import { t, applyI18n } from "./i18n.js";
import { loadDay, saveDay, recordScore, loadScore } from "./stats.js";
import { loadLegends, norm, dayIndexOf, countryName, untilMidnight, shareText } from "./data.js";
import { generateQuestions } from "./campions-gen.js";

const GAME = "campions";
const N = 10;
const MAX_HINTS = 2;
const $ = id => document.getElementById(id);
const today = dayIndexOf();

let L, names, qs, mode = "daily", idx = 0, answers = [], hints = [], done = false;

const raceName = id => t(`races.${id}`);
const person = id => L.people[id] || { name: id };

function persist() { if (mode === "daily") saveDay(GAME, { day: today, guesses: answers, hints, done }); }
const score = () => answers.filter((a, i) => a === qs[i].winner).length;

function render() {
  const q = qs[idx];
  const answered = answers[idx] !== undefined;
  $("round").textContent = t("in.round", { n: idx + 1, total: N });
  $("score").textContent = t("in.score", { n: score(), total: N });
  $("race").textContent = raceName(q.race);
  $("year").textContent = q.year;
  $("q").value = ""; $("q").disabled = answered || done; $("suggest").hidden = true;
  $("skip").disabled = answered || done;
  const fb = $("feedback");
  if (answered) {
    const ok = answers[idx] === q.winner;
    const w = person(q.winner);
    fb.textContent = ok ? `${t("cp.right")} ${w.name} (${countryName(w.country, L.countries)})`
                        : `${t("cp.wrong", { name: w.name })} (${countryName(w.country, L.countries)})`;
    fb.className = `in-feedback ${ok ? "ok" : "ko"}`;
    fb.hidden = false;
  } else fb.hidden = true;
  const h = hints.find(x => x === idx);
  $("hint-box").hidden = h === undefined;
  if (h !== undefined) $("hint-box").textContent = t("cp.hintCountry", { country: countryName(person(q.winner).country, L.countries) });
  $("hint").disabled = answered || done || hints.length >= MAX_HINTS || h !== undefined;
  $("hint").textContent = `${t("hintBtn")} · ${t("cp.hintsLeft", { n: MAX_HINTS - hints.length })}`;
  $("next").hidden = !answered || done;
  $("next").textContent = idx === N - 1 ? t("in.finish") : t("in.next");
  if (!answered && !done) $("q").focus();
}

function answer(id) {
  if (answers[idx] !== undefined || done) return;
  answers[idx] = id;
  persist(); render();
}

function next() { if (idx < N - 1) { idx++; render(); } else end(true); }

function end(fresh) {
  done = true;
  if (mode === "daily" && fresh) recordScore(GAME, today, score(), N);
  persist();
  $("play").hidden = true;
  const r = $("result"); r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = t("cp.result", { n: score(), total: N });
  const rows = qs.map((q, i) => (answers[i] === q.winner ? "🟩" : "🟥")).join("");
  const pre = document.createElement("pre"); pre.className = "share"; pre.textContent = rows;
  const list = document.createElement("ol"); list.className = "in-review";
  qs.forEach((q, i) => {
    const li = document.createElement("li");
    li.textContent = `${answers[i] === q.winner ? "✓" : "✗"} ${raceName(q.race)} ${q.year}: ${person(q.winner).name}`;
    list.appendChild(li);
  });
  const text = `Veloguess · ${t("cpName")}${mode === "daily" ? " #" + (today + 1) : ""} ${score()}/${N}${hints.length ? " " + "💡".repeat(hints.length) : ""}\n${rows}\n${location.origin + location.pathname}`;
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

// Anunci simulat; la pista diu la nacionalitat del guanyador.
function showHintAd() {
  if (done || answers[idx] !== undefined || hints.length >= MAX_HINTS || hints.includes(idx)) return;
  const dlg = $("ad"), count = $("ad-count");
  let n = 3; count.textContent = n; dlg.showModal();
  const iv = setInterval(() => {
    n--; count.textContent = n;
    if (n <= 0) { clearInterval(iv); dlg.close(); hints.push(idx); persist(); render(); }
  }, 1000);
}

// Cercador amb tots els guanyadors de la base, no només els de la pregunta.
let sel = 0, opts = [];
function renderSuggest() {
  const q = norm($("q").value);
  const list = $("suggest"); list.innerHTML = "";
  opts = q.length < 2 ? [] : names.filter(p => p.key.includes(q)).slice(0, 8);
  opts.forEach((p, k) => {
    const li = document.createElement("li"); li.setAttribute("role", "option"); li.setAttribute("aria-selected", k === sel);
    li.dataset.id = p.id; li.textContent = p.name;
    const s = document.createElement("small"); s.textContent = p.country || ""; li.appendChild(s);
    list.appendChild(li);
  });
  list.hidden = !opts.length;
}

function start(m) {
  mode = m; idx = 0; answers = []; hints = []; done = false;
  $("m-daily").setAttribute("aria-pressed", m === "daily");
  $("m-free").setAttribute("aria-pressed", m === "free");
  $("result").hidden = true; $("play").hidden = false;
  const seed = m === "daily" ? 15485863 * (today + 1) + 20270101 : Math.floor(Math.random() * 1e9);
  qs = generateQuestions(L.editions, seed, N);
  if (m === "daily") {
    const s = loadDay(GAME, today);
    answers = s.guesses || []; hints = s.hints || [];
    if (s.done) { end(false); return; }
    idx = Math.min(answers.length, N - 1);
    if (answers.length === N) { end(true); return; }
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
  $("skip").onclick = () => answer("—");
  $("next").onclick = next;
  $("hint").onclick = showHintAd;
  $("m-daily").onclick = () => start("daily");
  $("m-free").onclick = () => start("free");
  $("open-stats").onclick = showStats;
  $("close-stats").onclick = () => $("stats").close();
  start("daily");
}

init();
