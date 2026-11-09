import { t, applyI18n } from "./i18n.js";
import { loadDay, saveDay, recordScore, loadScore } from "./stats.js";
import { loadLegends, norm, dayIndexOf, countryName, untilMidnight, shareText } from "./data.js";
import { generateQuestions } from "./campions-gen.js";

const GAME = "campions";
const N = 5;
const TRIES = 3;
const $ = id => document.getElementById(id);
const today = dayIndexOf();
const GIVE_UP = "—";

// Estat per pregunta: { tries: [ids provats], hint: bool }. Una pregunta està acabada
// quan l'encertes, quan esgotes els intents o quan dius "No ho sé".
let L, names, qs, mode = "daily", idx = 0, state = [], done = false;

const raceName = id => t(`races.${id}`);
const person = id => L.people[id] || { name: id };
const cur = () => state[idx];
const solvedAt = (s, q) => s.tries.indexOf(q.winner) + 1;
const isOver = (s, q) => s.tries.includes(q.winner) || s.tries.includes(GIVE_UP) || s.tries.length >= TRIES;
const score = () => qs.filter((q, i) => solvedAt(state[i], q) > 0).length;

function persist() { if (mode === "daily") saveDay(GAME, { day: today, v: 2, state, done }); }

function render() {
  const q = qs[idx], s = cur(), over = isOver(s, q);
  $("round").textContent = t("in.round", { n: idx + 1, total: N });
  $("score").textContent = t("in.score", { n: score(), total: N });
  $("race").textContent = raceName(q.race);
  $("year").textContent = q.year;
  $("q").value = ""; $("q").disabled = over || done; $("suggest").hidden = true;
  $("skip").disabled = over || done;

  const wrong = s.tries.filter(id => id !== q.winner && id !== GIVE_UP);
  const ul = $("tries-list"); ul.innerHTML = "";
  wrong.forEach(id => { const li = document.createElement("li"); li.textContent = person(id).name; ul.appendChild(li); });
  ul.hidden = !wrong.length;

  const fb = $("feedback"), w = person(q.winner), wc = countryName(w.country, L.countries);
  if (over) {
    const ok = solvedAt(s, q) > 0;
    fb.textContent = ok ? `${t("cp.right")} ${w.name} (${wc})` : `${t("cp.wrong", { name: w.name })} (${wc})`;
    fb.className = `in-feedback ${ok ? "ok" : "ko"}`;
    fb.hidden = false;
  } else if (wrong.length) {
    const left = TRIES - s.tries.length;
    fb.textContent = t(left === 1 ? "cp.triesLeft1" : "cp.triesLeft", { n: left });
    fb.className = "in-feedback ko";
    fb.hidden = false;
  } else fb.hidden = true;

  $("hint-box").hidden = !s.hint;
  if (s.hint) $("hint-box").textContent = t("cp.hintCountry", { country: wc });
  $("hint").disabled = over || done || s.hint;
  $("hint").textContent = s.hint ? t("hintUsed") : t("hintBtn");
  $("next").hidden = !over || done;
  $("next").textContent = idx === N - 1 ? t("in.finish") : t("in.next");
  $("attempts").textContent = t("cp.attempt", { n: Math.min(s.tries.length + 1, TRIES), max: TRIES });
  $("attempts").hidden = over;
  if (!over && !done) $("q").focus();
}

function answer(id) {
  const q = qs[idx], s = cur();
  if (isOver(s, q) || done || s.tries.includes(id)) return;
  s.tries.push(id);
  persist(); render();
}

function next() { if (idx < N - 1) { idx++; render(); } else end(true); }

function emoji(i) {
  const n = solvedAt(state[i], qs[i]);
  return ["🟥", "🟩", "🟨", "🟧"][n] || "🟥";
}

function end(fresh) {
  done = true;
  if (mode === "daily" && fresh) recordScore(GAME, today, score(), N);
  persist();
  $("play").hidden = true;
  const r = $("result"); r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = t("cp.result", { n: score(), total: N });
  const rows = qs.map((q, i) => emoji(i)).join("");
  const pre = document.createElement("pre"); pre.className = "share"; pre.textContent = rows;
  const list = document.createElement("ol"); list.className = "in-review";
  qs.forEach((q, i) => {
    const li = document.createElement("li");
    li.textContent = `${emoji(i)} ${raceName(q.race)} ${q.year}: ${person(q.winner).name}${state[i].hint ? " 💡" : ""}`;
    list.appendChild(li);
  });
  const hints = state.filter(s => s.hint).length;
  const text = `Veloguess · ${t("cpName")}${mode === "daily" ? " #" + (today + 1) : ""} ${score()}/${N}${hints ? " " + "💡".repeat(hints) : ""}\n${rows}\n${location.origin + location.pathname}`;
  const row = document.createElement("div"); row.className = "actions";
  const share = document.createElement("button"); share.className = "btn primary"; share.textContent = t("share");
  share.onclick = () => shareText(text, share, t("copied"));
  const again = document.createElement("button"); again.className = "btn"; again.textContent = t("playFree");
  again.onclick = () => start("free");
  row.append(share, again);
  r.append(h, pre, list, row);
  if (mode === "daily") { const n = document.createElement("p"); n.className = "counter"; n.textContent = t("cp.nextIn", { t: untilMidnight() }); r.appendChild(n); }
  r.hidden = false;
}

// Anunci simulat; una pista per pregunta amb la nacionalitat del guanyador.
function showHintAd() {
  const s = cur();
  if (done || s.hint || isOver(s, qs[idx])) return;
  const dlg = $("ad"), count = $("ad-count");
  let n = 3; count.textContent = n; dlg.showModal();
  const iv = setInterval(() => {
    n--; count.textContent = n;
    if (n <= 0) { clearInterval(iv); dlg.close(); s.hint = true; persist(); render(); }
  }, 1000);
}

// Cercador amb tots els guanyadors de la base, no només els de la pregunta.
let sel = 0, opts = [];
function renderSuggest() {
  const q = norm($("q").value), tried = new Set(cur().tries);
  const list = $("suggest"); list.innerHTML = "";
  opts = q.length < 2 ? [] : names.filter(p => p.key.includes(q) && !tried.has(p.id)).slice(0, 8);
  opts.forEach((p, k) => {
    const li = document.createElement("li"); li.setAttribute("role", "option"); li.setAttribute("aria-selected", k === sel);
    li.dataset.id = p.id; li.textContent = p.name;
    const s = document.createElement("small"); s.textContent = p.country || ""; li.appendChild(s);
    list.appendChild(li);
  });
  list.hidden = !opts.length;
}

function start(m) {
  mode = m; idx = 0; done = false;
  $("m-daily").setAttribute("aria-pressed", m === "daily");
  $("m-free").setAttribute("aria-pressed", m === "free");
  $("result").hidden = true; $("play").hidden = false;
  const seed = m === "daily" ? 15485863 * (today + 1) + 20270101 : Math.floor(Math.random() * 1e9);
  qs = generateQuestions(L.editions, seed, N);
  state = qs.map(() => ({ tries: [], hint: false }));
  if (m === "daily") {
    const s = loadDay(GAME, today);
    if (s.v === 2 && Array.isArray(s.state) && s.state.length === N) {
      state = s.state;
      if (s.done) { end(false); return; }
      const firstOpen = state.findIndex((x, i) => !isOver(x, qs[i]));
      if (firstOpen === -1) { end(true); return; }
      idx = firstOpen;
    }
  }
  render();
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
  L = await loadLegends();
  names = Object.entries(L.people).map(([id, p]) => ({ id, name: p.name, country: p.country, key: norm(p.name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  $("q").addEventListener("input", () => { sel = 0; renderSuggest(); });
  $("q").addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, opts.length - 1); renderSuggest(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderSuggest(); e.preventDefault(); }
    else if (e.key === "Enter") { const p = opts[sel] || opts[0]; if (p) answer(p.id); e.preventDefault(); }
    else if (e.key === "Escape") $("suggest").hidden = true;
  });
  $("q").addEventListener("blur", () => setTimeout(() => { $("suggest").hidden = true; }, 150));
  $("suggest").addEventListener("mousedown", e => { const li = e.target.closest("li"); if (li) { e.preventDefault(); answer(li.dataset.id); } });
  $("skip").onclick = () => answer(GIVE_UP);
  $("next").onclick = next;
  $("hint").onclick = showHintAd;
  $("m-daily").onclick = () => start("daily");
  $("m-free").onclick = () => start("free");
  $("open-stats").onclick = showStats;
  $("close-stats").onclick = () => $("stats").close();
  start("daily");
}

init();
