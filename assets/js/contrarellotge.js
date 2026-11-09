import { t, getLang, applyI18n } from "./i18n.js";
import { loadDay, saveDay, recordScore, loadScore } from "./stats.js";
import { loadData, norm, dayIndexOf, rng, shuffle, countryName, untilMidnight, shareText } from "./data.js";

const GAME = "contrarellotge";
const SECONDS = 120;
const MIN_COUNTRY = 10;
const $ = id => document.getElementById(id);
const today = dayIndexOf();

let D, challenges, ch, members, keyMap, tokenMap, found, mode = "daily", endsAt = 0, timer = null, running = false, done = false;

// Reptes possibles: cada equip i cada país amb prou corredors.
function buildChallenges() {
  const byCountry = {};
  D.riders.forEach(r => { (byCountry[r.country] ||= []).push(r); });
  const list = Object.keys(D.teams).sort().map(id => ({ kind: "team", id }));
  Object.keys(byCountry).sort().forEach(c => { if (byCountry[c].length >= MIN_COUNTRY) list.push({ kind: "country", id: c }); });
  return list;
}

function membersOf(c) {
  return D.riders.filter(r => (c.kind === "team" ? r.team : r.country) === c.id);
}

function titleOf(c) {
  return c.kind === "team" ? t("ct.team", { name: D.teams[c.id].name }) : t("ct.country", { name: countryName(c.id, D.countries) });
}

// Claus de cerca: nom complet, nom sense el primer nom i darrer cognom. Una clau compartida per
// dos corredors del repte no val per a cap dels dos (cal escriure el nom complet).
function buildKeys() {
  const m = new Map();
  for (const r of members) {
    const n = norm(r.name), parts = n.split(" ");
    const keys = new Set([n]);
    if (parts.length > 1) { keys.add(parts.slice(1).join(" ")); keys.add(parts[parts.length - 1]); }
    for (const k of keys) if (k.length >= 3) (m.get(k) || m.set(k, []).get(k)).push(r);
  }
  for (const [k, rs] of m) if (rs.length > 1 && !rs.some(r => norm(r.name) === k)) m.delete(k);
  return m;
}

// Paraules soles del nom (nom de pila, cognoms) per acceptar-les en prémer Enter.
const PARTICLES = new Set(["van", "de", "der", "den", "da", "del", "la", "le", "di", "du", "von", "dos", "das", "y", "e"]);
function buildTokens() {
  const m = new Map();
  for (const r of members) {
    const parts = norm(r.name).split(" ");
    const toks = new Set(parts.filter(p => p.length >= 3 && !PARTICLES.has(p)));
    if (parts.length > 2) toks.add(parts.slice(0, 2).join(" "));
    for (const k of toks) (m.get(k) || m.set(k, []).get(k)).push(r);
  }
  return m;
}

function matchInput(q) {
  const rs = keyMap.get(norm(q));
  if (!rs) return null;
  if (rs.length === 1) return rs[0];
  return rs.find(r => norm(r.name) === norm(q)) || null;
}

function renderFound() {
  const ul = $("found"); ul.innerHTML = "";
  members.filter(r => found.has(r.id)).forEach(r => { const li = document.createElement("li"); li.textContent = r.name; ul.appendChild(li); });
  $("count").textContent = t("ct.found", { n: found.size, total: members.length });
}

function tick() {
  const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  $("timer").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  $("timer").classList.toggle("low", left <= 15);
  if (left <= 0 && running) finish();
}

function persist() {
  if (mode === "daily") saveDay(GAME, { day: today, guesses: [...found], endsAt, done });
}

function begin() {
  running = true;
  endsAt = endsAt || Date.now() + SECONDS * 1000;
  $("start").hidden = true; $("stop").hidden = false;
  $("q").disabled = false; $("q").focus();
  clearInterval(timer); timer = setInterval(tick, 250); tick();
  persist();
}

function finish() {
  running = false; done = true;
  clearInterval(timer);
  $("q").disabled = true; $("stop").hidden = true; $("start").hidden = true;
  $("timer").textContent = "0:00";
  if (mode === "daily") { persist(); recordScore(GAME, today, found.size, members.length); }
  const r = $("result"); r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = t("ct.end");
  const p = document.createElement("p"); p.textContent = t("ct.result", { n: found.size, total: members.length });
  r.append(h, p);
  const missed = members.filter(x => !found.has(x.id));
  if (missed.length) {
    const h3 = document.createElement("h3"); h3.textContent = t("ct.missed"); h3.style.fontSize = "1rem";
    const ul = document.createElement("ul"); ul.className = "found-list missed";
    missed.forEach(x => { const li = document.createElement("li"); li.textContent = x.name; ul.appendChild(li); });
    r.append(h3, ul);
  }
  const pct = members.length ? Math.round((found.size / members.length) * 100) : 0;
  const bar = "🟩".repeat(Math.round(pct / 10)) + "⬛".repeat(10 - Math.round(pct / 10));
  const text = `Gruppetto · ${t("ctName")}${mode === "daily" ? " #" + (today + 1) : ""}\n${titleOf(ch)}: ${found.size}/${members.length} ⏱️\n${bar}\n${location.origin + location.pathname}`;
  const row = document.createElement("div"); row.className = "actions";
  const share = document.createElement("button"); share.className = "btn primary"; share.textContent = t("share");
  share.onclick = () => shareText(text, share, t("copied"));
  const again = document.createElement("button"); again.className = "btn"; again.textContent = t("playFree");
  again.onclick = () => start("free");
  row.append(share, again); r.appendChild(row);
  if (mode === "daily") { const n = document.createElement("p"); n.className = "counter"; n.textContent = t("ct.nextIn", { t: untilMidnight() }); r.appendChild(n); }
  r.hidden = false;
}

function start(m) {
  mode = m; done = false; running = false; endsAt = 0; found = new Set();
  clearInterval(timer);
  $("m-daily").setAttribute("aria-pressed", m === "daily");
  $("m-free").setAttribute("aria-pressed", m === "free");
  $("result").hidden = true; $("flash").textContent = "";
  if (m === "daily") {
    const order = shuffle(challenges, rng(20270101));
    ch = order[((today % order.length) + order.length) % order.length];
  } else {
    ch = challenges[Math.floor(Math.random() * challenges.length)];
  }
  members = membersOf(ch).sort((a, b) => a.name.localeCompare(b.name));
  keyMap = buildKeys();
  tokenMap = buildTokens();
  $("challenge").textContent = titleOf(ch);
  $("q").value = ""; $("q").disabled = true;
  $("start").hidden = false; $("stop").hidden = true;
  $("timer").textContent = `${SECONDS / 60}:00`; $("timer").classList.remove("low");
  if (m === "daily") {
    const saved = loadDay(GAME, today);
    (saved.guesses || []).forEach(id => found.add(id));
    if (saved.done) { renderFound(); finish(); return; }
    if (saved.endsAt) { endsAt = saved.endsAt; if (Date.now() >= endsAt) { renderFound(); finish(); return; } begin(); }
  }
  renderFound();
}

function onInput() {
  if (!running) return;
  const r = matchInput($("q").value);
  if (r && !found.has(r.id)) {
    found.add(r.id); $("q").value = ""; $("flash").textContent = "";
    renderFound(); persist();
    if (found.size === members.length) finish();
  }
}

function onEnter() {
  if (!running) return;
  const q = norm($("q").value);
  if (!q) return;
  const r = matchInput(q);
  if (r && found.has(r.id)) { $("flash").textContent = t("ct.already"); $("q").value = ""; return; }
  const byToken = tokenMap.get(q);
  if (byToken) {
    const left = byToken.filter(x => !found.has(x.id));
    if (left.length === 1) {
      found.add(left[0].id); $("q").value = ""; $("flash").textContent = "";
      renderFound(); persist();
      if (found.size === members.length) finish();
      return;
    }
    $("flash").textContent = left.length ? t("ct.ambiguous", { name: $("q").value.trim() }) : t("ct.already");
    $("q").value = "";
    return;
  }
  const other = D.riders.find(x => norm(x.name) === q);
  $("flash").textContent = other ? t("ct.notIn", { name: other.name }) : t("ct.notIn", { name: $("q").value.trim() });
  $("q").value = "";
  $("q").classList.add("shake"); setTimeout(() => $("q").classList.remove("shake"), 400);
}

function showStats() {
  const s = loadScore(GAME);
  $("st-played").textContent = s.played;
  $("st-best").textContent = s.best;
  $("st-avg").textContent = s.played ? Math.round(s.sumPct / s.played) : 0;
  $("st-streak").textContent = s.streak;
  $("stats").showModal();
}

async function init() {
  applyI18n();
  D = await loadData();
  challenges = buildChallenges();
  $("q").addEventListener("input", onInput);
  $("q").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } });
  $("start").onclick = begin;
  $("stop").onclick = finish;
  $("m-daily").onclick = () => start("daily");
  $("m-free").onclick = () => start("free");
  $("open-stats").onclick = showStats;
  $("close-stats").onclick = () => $("stats").close();
  start("daily");
}

init();
