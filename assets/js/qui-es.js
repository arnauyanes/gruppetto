import { t, getLang, applyI18n } from "./i18n.js";
import { loadStats, recordDaily, loadDay, saveDay } from "./stats.js";

const GAME = "quies";
const MAX = 8;
const EPOCH = new Date(2026, 0, 1);
const $ = id => document.getElementById(id);

// Dia de joc segons la data local del jugador (com el Wordle).
function dayIndexOf(d = new Date()) {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((local - EPOCH) / 86400000);
}

// Barreja determinista: tothom té el mateix corredor el mateix dia.
function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function ageOf(born, now = new Date()) {
  const [y, m = 7, d = 1] = born.split("-").map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

let riders, teams, countries, byId;
let mode = "daily", target, guesses = [], hintUsed = false, done = false, gaveUp = false;
const today = dayIndexOf();

async function load() {
  const [r, tm, c] = await Promise.all(["riders", "teams", "countries"].map(f => fetch(`../data/${f}.json`).then(x => x.json())));
  teams = Object.fromEntries(tm.teams.map(x => [x.id, x]));
  countries = c;
  riders = r.riders.map(x => ({ ...x, age: ageOf(x.born) }));
  byId = Object.fromEntries(riders.map(x => [x.id, x]));
}

function dailyTarget() {
  const pool = riders.filter(r => r.specConfidence === "sure").map(r => r.id).sort();
  const order = seededShuffle(pool, 20260101);
  return byId[order[((today % order.length) + order.length) % order.length]];
}

function evaluate(g) {
  const T = target, cg = countries[g.country], ct = countries[T.country];
  return {
    country: g.country === T.country ? "ok" : (cg?.continent && cg.continent === ct?.continent ? "near" : "miss"),
    team: g.team === T.team ? "ok" : "miss",
    age: g.age === T.age ? "ok" : (Math.abs(g.age - T.age) <= 2 ? "near" : "miss"),
    spec: g.spec === T.spec ? "ok" : "miss",
    gt: g.gtWins === T.gtWins ? "ok" : "miss",
    mon: g.monuments === T.monuments ? "ok" : "miss",
  };
}

const arrow = (a, b) => a === b ? "" : (b > a ? " ↑" : " ↓");

function tile(cls, main, sub) {
  const d = document.createElement("div");
  d.className = `tile row-cell ${cls}`;
  d.textContent = main;
  if (sub) { const s = document.createElement("small"); s.textContent = sub; d.appendChild(s); }
  return d;
}

function renderGuess(g) {
  const e = evaluate(g), grid = $("grid");
  const n = document.createElement("div");
  n.className = "name row-cell"; n.textContent = g.name; grid.appendChild(n);
  const c = countries[g.country];
  grid.appendChild(tile(e.country, c?.code || g.country, c ? t(`cont.${c.continent}`) : ""));
  grid.appendChild(tile(e.team, teams[g.team]?.short || g.team));
  grid.appendChild(tile(e.age, g.age + arrow(g.age, target.age), t("years")));
  grid.appendChild(tile(e.spec, t(`spec.${g.spec}`)));
  grid.appendChild(tile(e.gt, g.gtWins + arrow(g.gtWins, target.gtWins)));
  grid.appendChild(tile(e.mon, g.monuments + arrow(g.monuments, target.monuments)));
}

function addGuess(g) {
  guesses.push(g);
  renderGuess(g);
  const won = g.id === target.id;
  if (mode === "daily") saveDay(GAME, { day: today, guesses: guesses.map(x => x.id), hint: hintUsed, gaveUp });
  if (won || guesses.length >= MAX) finish(won, true);
  update();
}

function gameUrl() { return location.origin + location.pathname; }

function shareText(won) {
  const icon = { ok: "🟩", near: "🟨", miss: "⬛" };
  const rows = guesses.map(g => Object.values(evaluate(g)).map(k => icon[k]).join(""));
  const head = `Gruppetto · ${t("whoName")} ${mode === "daily" ? "#" + (today + 1) : ""} ${won ? guesses.length : (gaveUp ? "🏳️" : "X")}/${MAX}${hintUsed ? " 💡" : ""}`;
  return `${head}\n${rows.join("\n")}\n${t("shareInvite")} ${gameUrl()}`;
}

function finish(won, fresh) {
  done = true;
  if (mode === "daily" && fresh) recordDaily(GAME, today, won, guesses.length);
  const r = $("result");
  r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = won ? t("won") : (gaveUp ? t("gaveUp") : t("lost"));
  const p = document.createElement("p");
  p.textContent = won ? `${t("wonText", { n: guesses.length })} ` : `${t("lostText")} `;
  const b = document.createElement("strong"); b.textContent = `${target.name} · ${teams[target.team]?.name || ""}`;
  p.appendChild(b);
  const pre = document.createElement("pre"); pre.className = "share"; pre.textContent = shareText(won);
  const row = document.createElement("div"); row.className = "actions";
  const text = pre.textContent;
  const share = document.createElement("button"); share.className = "btn primary"; share.textContent = t("share");
  share.onclick = async () => {
    if (navigator.share) { try { await navigator.share({ text }); return; } catch (e) { if (e.name === "AbortError") return; } }
    copyToClipboard(text, share);
  };
  const wa = document.createElement("a"); wa.className = "btn"; wa.target = "_blank"; wa.rel = "noopener";
  wa.href = `https://wa.me/?text=${encodeURIComponent(text)}`; wa.textContent = "WhatsApp";
  const x = document.createElement("a"); x.className = "btn"; x.target = "_blank"; x.rel = "noopener";
  x.href = `https://x.com/intent/post?text=${encodeURIComponent(text)}`; x.textContent = "X";
  const copy = document.createElement("button"); copy.className = "btn"; copy.textContent = t("copyText");
  copy.onclick = () => copyToClipboard(text, copy);
  const again = document.createElement("button"); again.className = "btn"; again.textContent = t("playFree");
  again.onclick = () => start("free");
  row.append(share, wa, x, copy, again);
  r.append(h, p, pre, row);
  if (mode === "daily") {
    const next = document.createElement("p"); next.className = "counter"; r.appendChild(next);
    const tick = () => {
      const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const s = Math.max(0, Math.floor((mid - now) / 1000));
      const hms = [s / 3600, (s % 3600) / 60, s % 60].map(v => String(Math.floor(v)).padStart(2, "0")).join(":");
      next.textContent = t("nextIn", { t: hms });
    };
    tick(); clearInterval(finish.timer); finish.timer = setInterval(tick, 1000);
  }
  r.hidden = false;
}

function copyToClipboard(text, btn) {
  const ok = () => { btn.textContent = t("copied"); };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok).catch(() => {});
}

function giveUp() {
  if (done) return;
  gaveUp = true;
  if (mode === "daily") saveDay(GAME, { day: today, guesses: guesses.map(x => x.id), hint: hintUsed, gaveUp: true });
  finish(false, true);
  update();
}

function update() {
  $("tries").textContent = t("tries", { n: guesses.length, max: MAX });
  $("q").disabled = done;
  $("q").placeholder = done ? t("finished") : t("placeholder");
  const hb = $("hint");
  hb.disabled = done || hintUsed;
  hb.textContent = hintUsed ? t("hintUsed") : t("hintBtn");
  $("giveup").disabled = done;
  $("hint-box").hidden = !hintUsed;
  if (hintUsed) $("hint-box").textContent = t("hintTeam", { team: teams[target.team]?.name || "" });
}

function start(m) {
  mode = m;
  $("m-daily").setAttribute("aria-pressed", m === "daily");
  $("m-free").setAttribute("aria-pressed", m === "free");
  document.querySelectorAll("#grid .row-cell").forEach(e => e.remove());
  $("result").hidden = true;
  guesses = []; done = false; hintUsed = false; gaveUp = false;
  if (m === "daily") {
    target = dailyTarget();
    const saved = loadDay(GAME, today);
    hintUsed = saved.hint; gaveUp = !!saved.gaveUp;
    saved.guesses.map(id => byId[id]).filter(Boolean).forEach(g => { guesses.push(g); renderGuess(g); });
    const won = guesses.some(g => g.id === target.id);
    if (won || gaveUp || guesses.length >= MAX) finish(won, false);
  } else {
    target = riders[Math.floor(Math.random() * riders.length)];
  }
  update();
}

// Autocompletat
let sel = 0, opts = [];
function renderSuggest() {
  const q = norm($("q").value.trim()), list = $("suggest");
  const used = new Set(guesses.map(g => g.id));
  opts = q ? riders.filter(r => !used.has(r.id) && norm(r.name).includes(q)).slice(0, 8) : [];
  list.innerHTML = "";
  opts.forEach((r, k) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option"); li.setAttribute("aria-selected", k === sel); li.dataset.id = r.id;
    li.textContent = r.name;
    const s = document.createElement("small"); s.textContent = teams[r.team]?.short || ""; li.appendChild(s);
    list.appendChild(li);
  });
  list.hidden = !opts.length;
  $("q").setAttribute("aria-expanded", String(!!opts.length));
}
function pick(r) { if (!r || done) return; $("q").value = ""; sel = 0; renderSuggest(); addGuess(r); }

// Anunci simulat per a la pista. Es substituirà per H5 Games Ads de Google.
function showHintAd() {
  const dlg = $("ad"), count = $("ad-count");
  let n = 3; count.textContent = n; dlg.showModal();
  const iv = setInterval(() => {
    n--; count.textContent = n;
    if (n <= 0) {
      clearInterval(iv); dlg.close(); hintUsed = true;
      if (mode === "daily") saveDay(GAME, { day: today, guesses: guesses.map(x => x.id), hint: true, gaveUp });
      update();
    }
  }, 1000);
}

function showStats() {
  const s = loadStats(GAME);
  $("st-played").textContent = s.played;
  $("st-pct").textContent = s.played ? Math.round((s.wins / s.played) * 100) : 0;
  $("st-streak").textContent = s.streak;
  $("st-max").textContent = s.maxStreak;
  const dist = $("st-dist"); dist.innerHTML = "";
  const max = Math.max(1, ...Object.values(s.dist));
  for (let i = 1; i <= MAX; i++) {
    const v = s.dist[i] || 0, row = document.createElement("div"), lab = document.createElement("span"), bar = document.createElement("span");
    lab.textContent = i; bar.className = "bar" + (done && mode === "daily" && guesses.length === i && guesses.at(-1)?.id === target.id ? " cur" : "");
    bar.style.width = `${Math.max(8, (v / max) * 100)}%`; bar.textContent = v;
    row.append(lab, bar); dist.appendChild(row);
  }
  $("stats").showModal();
}

async function init() {
  applyI18n();
  await load();
  $("note").textContent = t("sampleNote");
  $("q").addEventListener("input", () => { sel = 0; renderSuggest(); });
  $("q").addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, opts.length - 1); renderSuggest(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderSuggest(); e.preventDefault(); }
    else if (e.key === "Enter") { pick(opts[sel] || opts[0]); e.preventDefault(); }
    else if (e.key === "Escape") { $("suggest").hidden = true; }
  });
  $("q").addEventListener("blur", () => setTimeout(() => { $("suggest").hidden = true; }, 150));
  $("suggest").addEventListener("mousedown", e => { const li = e.target.closest("li"); if (li) { e.preventDefault(); pick(byId[li.dataset.id]); } });
  $("m-daily").onclick = () => start("daily");
  $("m-free").onclick = () => start("free");
  $("hint").onclick = showHintAd;
  $("giveup").onclick = () => $("confirm-giveup").showModal();
  $("giveup-yes").onclick = () => { $("confirm-giveup").close(); giveUp(); };
  $("giveup-no").onclick = () => $("confirm-giveup").close();
  $("open-stats").onclick = showStats;
  $("close-stats").onclick = () => $("stats").close();
  start("daily");
}

init();
