import { t, applyI18n } from "./i18n.js";
import { loadStats, recordDaily, loadDay, saveDay } from "./stats.js";
import { loadData, dayIndexOf, rng, shuffle, countryName, untilMidnight, shareText } from "./data.js";
import { generatePuzzle } from "./grups-gen.js";

const GAME = "grups";
const MAX_MISTAKES = 4;
const MAX_HINTS = 2;
const $ = id => document.getElementById(id);
const today = dayIndexOf();
const ICON = ["🟨", "🟩", "🟦", "🟪"];

let D, puzzle, history = [], hints = [], mode = "daily", solved = [], mistakes = 0, tried = new Set(), selected = new Set(), order = [], done = false;

function label(c) {
  if (c.type === "team") return t("gr.cat.team", { name: D.teams[c.key].name });
  if (c.type === "country") return t("gr.cat.country", { name: countryName(c.key, D.countries) });
  if (c.type === "spec") return t(`gr.specPl.${c.key}`);
  if (c.type === "year") return t("gr.cat.year", { year: c.key });
  return t(`gr.cat.${c.type}`);
}

function groupOf(id) { return puzzle.find(g => g.riders.some(r => r.id === id)); }

function render() {
  const grid = $("grid"); grid.innerHTML = "";
  for (const lvl of solved) {
    const g = puzzle.find(x => x.level === lvl);
    const div = document.createElement("div"); div.className = `gr-solved l${g.level}`;
    const b = document.createElement("b"); b.textContent = label(g.cat);
    const s = document.createElement("span"); s.textContent = g.riders.map(r => r.name).join(", ");
    div.append(b, s); grid.appendChild(div);
  }
  const solvedIds = new Set(solved.flatMap(l => puzzle.find(x => x.level === l).riders.map(r => r.id)));
  for (const id of order.filter(i => !solvedIds.has(i))) {
    const r = D.byId[id];
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "gr-tile";
    btn.textContent = r.name; btn.setAttribute("aria-pressed", selected.has(id));
    btn.disabled = done;
    btn.onclick = () => {
      if (selected.has(id)) selected.delete(id); else if (selected.size < 4) selected.add(id);
      render();
    };
    grid.appendChild(btn);
  }
  $("mistakes").textContent = t("gr.mistakes", { n: mistakes, max: MAX_MISTAKES });
  const dots = $("dots"); dots.innerHTML = "";
  for (let i = 0; i < MAX_MISTAKES; i++) { const d = document.createElement("i"); if (i < mistakes) d.className = "used"; dots.appendChild(d); }
  $("submit").disabled = done || selected.size !== 4;
  $("clear").disabled = done || !selected.size;
  $("shuffle").disabled = done;
  renderHints();
}

// Pistes: la primera revela el tema del grup més fàcil que queda; la segona, un corredor d'aquest grup.
function renderHints() {
  const box = $("hint-box"); box.innerHTML = "";
  for (const h of hints) {
    const g = puzzle.find(x => x.level === h.level);
    const p = document.createElement("p"); p.style.margin = "0";
    p.textContent = h.type === "theme" ? t("gr.hintTheme", { name: label(g.cat) }) : t("gr.hintRider", { rider: D.byId[h.rider].name, name: label(g.cat) });
    box.appendChild(p);
  }
  box.hidden = !hints.length;
  const btn = $("hint");
  btn.disabled = done || hints.length >= MAX_HINTS;
  btn.textContent = hints.length >= MAX_HINTS ? t("gr.noHints") : t("hintBtn");
}

function nextHint() {
  const last = hints[hints.length - 1];
  if (last && !solved.includes(last.level)) {
    const g = puzzle.find(x => x.level === last.level);
    const shown = new Set(hints.filter(h => h.rider).map(h => h.rider));
    const r = g.riders.find(x => !shown.has(x.id) && !selected.has(x.id)) || g.riders.find(x => !shown.has(x.id));
    return { type: "rider", level: g.level, rider: r.id };
  }
  const level = puzzle.map(g => g.level).filter(l => !solved.includes(l)).sort((a, b) => a - b)[0];
  return { type: "theme", level };
}

// Anunci simulat. Es substituirà per un anunci recompensat de Google (H5 Games Ads).
function showHintAd() {
  if (done || hints.length >= MAX_HINTS) return;
  const dlg = $("ad"), count = $("ad-count");
  let n = 3; count.textContent = n; dlg.showModal();
  const iv = setInterval(() => {
    n--; count.textContent = n;
    if (n <= 0) { clearInterval(iv); dlg.close(); hints.push(nextHint()); persist(); render(); }
  }, 1000);
}

function persist() {
  if (mode === "daily") saveDay(GAME, { day: today, guesses: [...tried], solved, mistakes, done, hints });
}

function submit() {
  if (selected.size !== 4 || done) return;
  const key = [...selected].sort().join("|");
  if (tried.has(key)) { $("flash").textContent = t("gr.already"); return; }
  tried.add(key);
  const levels = [...selected].map(id => groupOf(id).level);
  const counts = {}; levels.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
  const best = Math.max(...Object.values(counts));
  history.push(levels);
  if (best === 4) {
    solved.push(levels[0]); selected.clear(); $("flash").textContent = "";
    if (solved.length === 4) end(true);
  } else {
    mistakes++;
    $("flash").textContent = best === 3 ? t("gr.oneAway") : "";
    $("grid").classList.add("shake"); setTimeout(() => $("grid").classList.remove("shake"), 400);
    if (mistakes >= MAX_MISTAKES) end(false);
  }
  persist(); render();
}


function end(won, fresh = true) {
  done = true;
  if (!won) { for (const g of puzzle) if (!solved.includes(g.level)) solved.push(g.level); }
  if (mode === "daily" && fresh) recordDaily(GAME, today, won, mistakes + 1);
  persist();
  const r = $("result"); r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = won ? t("gr.won") : t("gr.lost");
  const rows = history.map(ls => ls.map(l => ICON[l]).join(""));
  const text = `Veloguess · ${t("grName")}${mode === "daily" ? " #" + (today + 1) : ""}${hints.length ? " " + "💡".repeat(hints.length) : ""}\n${rows.join("\n")}\n${location.origin + location.pathname}`;
  const pre = document.createElement("pre"); pre.className = "share"; pre.textContent = rows.join("\n");
  const row = document.createElement("div"); row.className = "actions";
  const share = document.createElement("button"); share.className = "btn primary"; share.textContent = t("share");
  share.onclick = () => shareText(text, share, t("copied"));
  const again = document.createElement("button"); again.className = "btn"; again.textContent = t("playFree");
  again.onclick = () => start("free");
  row.append(share, again);
  r.append(h, pre, row);
  if (mode === "daily") { const n = document.createElement("p"); n.className = "counter"; n.textContent = t("gr.nextIn", { t: untilMidnight() }); r.appendChild(n); }
  r.hidden = false;
  render();
}

function start(m) {
  mode = m; solved = []; mistakes = 0; tried = new Set(); selected = new Set(); history = []; hints = []; done = false;
  $("m-daily").setAttribute("aria-pressed", m === "daily");
  $("m-free").setAttribute("aria-pressed", m === "free");
  $("result").hidden = true; $("flash").textContent = "";
  const seed = m === "daily" ? 7919 * (today + 1) + 20270101 : Math.floor(Math.random() * 1e9);
  puzzle = generatePuzzle(D.riders, seed);
  if (!puzzle) { $("flash").textContent = "No s'ha pogut generar el repte."; return; }
  order = shuffle(puzzle.flatMap(g => g.riders.map(r => r.id)), rng(seed + 1));
  if (m === "daily") {
    const saved = loadDay(GAME, today);
    if (saved.solved) {
      solved = saved.solved; mistakes = saved.mistakes || 0; tried = new Set(saved.guesses || []); hints = saved.hints || [];
      history = [...tried].map(k => k.split("|").map(id => groupOf(id)?.level ?? 0));
      if (saved.done) { end(solved.length === 4 && mistakes < MAX_MISTAKES, false); return; }
    }
  }
  render();
}

function showStats() {
  const s = loadStats(GAME);
  $("st-played").textContent = s.played;
  $("st-pct").textContent = s.played ? Math.round((s.wins / s.played) * 100) : 0;
  $("st-streak").textContent = s.streak;
  $("st-max").textContent = s.maxStreak;
  $("stats").showModal();
}

async function init() {
  applyI18n();
  D = await loadData();
  $("submit").onclick = submit;
  $("hint").onclick = showHintAd;
  $("clear").onclick = () => { selected.clear(); render(); };
  $("shuffle").onclick = () => { order = shuffle(order); render(); };
  $("m-daily").onclick = () => start("daily");
  $("m-free").onclick = () => start("free");
  $("open-stats").onclick = showStats;
  $("close-stats").onclick = () => $("stats").close();
  start("daily");
}

init();
