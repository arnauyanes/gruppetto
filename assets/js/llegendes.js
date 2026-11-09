import { t, applyI18n } from "./i18n.js";
import { loadStats, recordDaily, loadDay, saveDay } from "./stats.js";
import { loadLegends, norm, dayIndexOf, rng, shuffle, countryName, untilMidnight, shareText } from "./data.js";

const GAME = "llegendes";
const MAX = 8;
const $ = id => document.getElementById(id);
const today = dayIndexOf();

let L, pool, dailyPool, mode = "daily", target, guesses = [], hint = false, gaveUp = false, done = false;

// Pes del palmarès: serveix per triar llegendes conegudes com a llegenda del dia.
const weight = r => r.gtWins * 3 + r.monuments * 2 + r.worlds * 2 + r.stages / 5;

function dailyTarget() {
  const order = shuffle(dailyPool.map(r => r.id).sort(), rng(19500101));
  return L.byId[order[((today % order.length) + order.length) % order.length]];
}

function near(a, b, d) { return a === b ? "ok" : Math.abs(a - b) <= d ? "near" : "miss"; }

function evaluate(g) {
  const T = target, cg = L.countries[g.country], ct = L.countries[T.country];
  return {
    country: g.country === T.country ? "ok" : (cg?.continent && cg.continent === ct?.continent ? "near" : "miss"),
    decade: near(g.decade, T.decade, 10),
    gt: near(g.gtWins, T.gtWins, 1),
    mon: near(g.monuments, T.monuments, 1),
    wc: near(g.worlds, T.worlds, 1),
    st: near(g.stages, T.stages, 3),
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
  const e = evaluate(g), grid = $("grid"), T = target;
  const n = document.createElement("div"); n.className = "name row-cell"; n.textContent = g.name; grid.appendChild(n);
  const c = L.countries[g.country];
  grid.appendChild(tile(e.country, g.country, c ? t(`cont.${c.continent}`) : ""));
  grid.appendChild(tile(e.decade, `${g.decade}s${arrow(g.decade, T.decade)}`));
  grid.appendChild(tile(e.gt, g.gtWins + arrow(g.gtWins, T.gtWins)));
  grid.appendChild(tile(e.mon, g.monuments + arrow(g.monuments, T.monuments)));
  grid.appendChild(tile(e.wc, g.worlds + arrow(g.worlds, T.worlds)));
  grid.appendChild(tile(e.st, g.stages + arrow(g.stages, T.stages)));
}

function persist() { if (mode === "daily") saveDay(GAME, { day: today, guesses: guesses.map(x => x.id), hint, gaveUp }); }

function addGuess(g) {
  guesses.push(g); renderGuess(g); persist();
  const won = g.id === target.id;
  if (won || guesses.length >= MAX) finish(won, true);
  update();
}

// Pista: una victòria del corredor (cursa i any), triada sempre igual per a la mateixa llegenda.
function hintText() {
  const wins = L.editions.filter(e => e.winner === target.id).sort((a, b) => a.year - b.year);
  if (!wins.length) return t("lg.hintWin", { race: "—", year: "" });
  const w = wins[Math.floor(wins.length / 2)];
  return t("lg.hintWin", { race: t(`races.${w.race}`), year: w.year });
}

function finish(won, fresh) {
  done = true;
  if (mode === "daily" && fresh) recordDaily(GAME, today, won, guesses.length);
  const icon = { ok: "🟩", near: "🟨", miss: "⬛" };
  const rows = guesses.map(g => Object.values(evaluate(g)).map(k => icon[k]).join(""));
  const head = `Veloguess · ${t("lgName")} ${mode === "daily" ? "#" + (today + 1) : ""} ${won ? guesses.length : (gaveUp ? "🏳️" : "X")}/${MAX}${hint ? " 💡" : ""}`;
  const text = `${head}\n${rows.join("\n")}\n${t("shareInvite")} ${location.origin + location.pathname}`;
  const r = $("result"); r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = won ? t("won") : (gaveUp ? t("gaveUp") : t("lost"));
  const p = document.createElement("p");
  p.textContent = won ? `${t("wonText", { n: guesses.length })} ` : `${t("lostText")} `;
  const b = document.createElement("strong");
  b.textContent = `${target.name} · ${countryName(target.country, L.countries)} · ${target.born.slice(0, 4)}`;
  p.appendChild(b);
  const pre = document.createElement("pre"); pre.className = "share"; pre.textContent = rows.join("\n");
  const row = document.createElement("div"); row.className = "actions";
  const share = document.createElement("button"); share.className = "btn primary"; share.textContent = t("share");
  share.onclick = () => shareText(text, share, t("copied"));
  const again = document.createElement("button"); again.className = "btn"; again.textContent = t("playFree");
  again.onclick = () => start("free");
  row.append(share, again);
  r.append(h, p, pre, row);
  if (mode === "daily") { const n = document.createElement("p"); n.className = "counter"; n.textContent = t("nextIn", { t: untilMidnight() }); r.appendChild(n); }
  r.hidden = false;
}

function update() {
  $("tries").textContent = t("tries", { n: guesses.length, max: MAX });
  $("q").disabled = done;
  $("q").placeholder = done ? t("finished") : t("lg.placeholder");
  $("hint").disabled = done || hint;
  $("hint").textContent = hint ? t("hintUsed") : t("hintBtn");
  $("giveup").disabled = done;
  $("hint-box").hidden = !hint;
  if (hint) $("hint-box").textContent = hintText();
}

function start(m) {
  mode = m; guesses = []; hint = false; gaveUp = false; done = false;
  $("m-daily").setAttribute("aria-pressed", m === "daily");
  $("m-free").setAttribute("aria-pressed", m === "free");
  document.querySelectorAll("#grid .row-cell").forEach(e => e.remove());
  $("result").hidden = true;
  if (m === "daily") {
    target = dailyTarget();
    const s = loadDay(GAME, today);
    hint = !!s.hint; gaveUp = !!s.gaveUp;
    (s.guesses || []).map(id => L.byId[id]).filter(Boolean).forEach(g => { guesses.push(g); renderGuess(g); });
    const won = guesses.some(g => g.id === target.id);
    if (won || gaveUp || guesses.length >= MAX) finish(won, false);
  } else {
    target = pool[Math.floor(Math.random() * pool.length)];
  }
  update();
}

let sel = 0, opts = [];
function renderSuggest() {
  const q = norm($("q").value), list = $("suggest");
  const used = new Set(guesses.map(g => g.id));
  opts = q.length < 2 ? [] : L.legends.filter(r => !used.has(r.id) && norm(r.name).includes(q)).slice(0, 8);
  list.innerHTML = "";
  opts.forEach((r, k) => {
    const li = document.createElement("li"); li.setAttribute("role", "option"); li.setAttribute("aria-selected", k === sel);
    li.dataset.id = r.id; li.textContent = r.name;
    const s = document.createElement("small"); s.textContent = `${r.country} · ${r.born.slice(0, 4)}`; li.appendChild(s);
    list.appendChild(li);
  });
  list.hidden = !opts.length;
}
function pick(r) { if (!r || done) return; $("q").value = ""; sel = 0; renderSuggest(); addGuess(r); }

function showHintAd() {
  if (done || hint) return;
  const dlg = $("ad"), count = $("ad-count");
  let n = 3; count.textContent = n; dlg.showModal();
  const iv = setInterval(() => {
    n--; count.textContent = n;
    if (n <= 0) { clearInterval(iv); dlg.close(); hint = true; persist(); update(); }
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
    lab.textContent = i; bar.className = "bar"; bar.style.width = `${Math.max(8, (v / max) * 100)}%`; bar.textContent = v;
    row.append(lab, bar); dist.appendChild(row);
  }
  $("stats").showModal();
}

async function init() {
  applyI18n();
  L = await loadLegends();
  // Mode lliure: palmarès important (una gran volta, dos monuments o equivalent).
  // Llegenda del dia: més exigent i a partir del 1915, llevat dels més grans de tots els temps.
  pool = L.legends.filter(r => weight(r) >= 4);
  dailyPool = pool.filter(r => (weight(r) >= 6 && Number(r.born.slice(0, 4)) >= 1915) || weight(r) >= 10);
  $("note").textContent = t("sampleNote");
  $("q").addEventListener("input", () => { sel = 0; renderSuggest(); });
  $("q").addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, opts.length - 1); renderSuggest(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderSuggest(); e.preventDefault(); }
    else if (e.key === "Enter") { pick(opts[sel] || opts[0]); e.preventDefault(); }
    else if (e.key === "Escape") $("suggest").hidden = true;
  });
  $("q").addEventListener("blur", () => setTimeout(() => { $("suggest").hidden = true; }, 150));
  $("suggest").addEventListener("mousedown", e => { const li = e.target.closest("li"); if (li) { e.preventDefault(); pick(L.byId[li.dataset.id]); } });
  $("m-daily").onclick = () => start("daily");
  $("m-free").onclick = () => start("free");
  $("hint").onclick = showHintAd;
  $("giveup").onclick = () => $("confirm-giveup").showModal();
  $("giveup-yes").onclick = () => { $("confirm-giveup").close(); if (!done) { gaveUp = true; persist(); finish(false, true); update(); } };
  $("giveup-no").onclick = () => $("confirm-giveup").close();
  $("open-stats").onclick = showStats;
  $("close-stats").onclick = () => $("stats").close();
  start("daily");
}

init();
