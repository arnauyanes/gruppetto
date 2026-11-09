import { t, applyI18n } from "./i18n.js";
import { loadDay, saveDay, recordScore, loadScore } from "./stats.js";
import { loadData, dayIndexOf, countryName, untilMidnight, shareText } from "./data.js";
import { generateGame } from "./intrus-gen.js";

const GAME = "intrus";
const ROUNDS = 10;
const $ = id => document.getElementById(id);
const today = dayIndexOf();

let D, game, mode = "daily", round = 0, answers = [], hint = null, answered = false, done = false;

function label(c) {
  if (c.type === "team") return t("gr.cat.team", { name: D.teams[c.key].name });
  if (c.type === "country") return t("gr.cat.country", { name: countryName(c.key, D.countries) });
  if (c.type === "spec") return t(`gr.specPl.${c.key}`);
  if (c.type === "year") return t("gr.cat.year", { year: c.key });
  return t(`gr.cat.${c.type}`);
}

function persist() {
  if (mode === "daily") saveDay(GAME, { day: today, guesses: answers, hint, done });
}

function score() { return answers.filter((a, i) => a === game[i].odd.id).length; }

function renderRound() {
  const rd = game[round];
  const chosen = answers[round];
  answered = chosen !== undefined;
  $("round").textContent = t("in.round", { n: round + 1, total: ROUNDS });
  $("score").textContent = t("in.score", { n: score(), total: ROUNDS });
  const box = $("tiles"); box.innerHTML = "";
  for (const r of rd.riders) {
    const b = document.createElement("button"); b.type = "button"; b.className = "gr-tile in-tile";
    b.textContent = r.name;
    const removed = hint && hint.round === round && hint.rider === r.id;
    if (removed) { b.classList.add("removed"); b.disabled = true; b.title = t("in.removed"); }
    if (answered) {
      b.disabled = true;
      if (r.id === rd.odd.id) b.classList.add("odd");
      else if (r.id === chosen) b.classList.add("wrong");
      else b.classList.add("fit");
    } else if (!removed) {
      b.onclick = () => choose(r.id);
    }
    box.appendChild(b);
  }
  const fb = $("feedback");
  if (answered) {
    const ok = chosen === rd.odd.id;
    fb.innerHTML = "";
    const h = document.createElement("b"); h.textContent = ok ? t("in.right") : t("in.wrong", { name: rd.odd.name });
    const p = document.createElement("span"); p.textContent = " " + t("in.reason", { name: label(rd.cat) });
    fb.append(h, p);
    fb.className = `in-feedback ${ok ? "ok" : "ko"}`;
    fb.hidden = false;
  } else {
    fb.hidden = true;
  }
  $("next").hidden = !answered || done;
  $("next").textContent = round === ROUNDS - 1 ? t("in.finish") : t("in.next");
  const hb = $("hint");
  hb.disabled = answered || done || !!hint;
  hb.textContent = hint ? t("hintUsed") : t("hintBtn");
}

function choose(id) {
  if (answered || done) return;
  answers[round] = id;
  persist();
  renderRound();
}

function next() {
  if (round < ROUNDS - 1) { round++; renderRound(); return; }
  end(true);
}

function end(fresh) {
  done = true;
  if (mode === "daily" && fresh) recordScore(GAME, today, score(), ROUNDS);
  persist();
  $("play").hidden = true;
  const r = $("result"); r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = t("in.result", { n: score(), total: ROUNDS });
  const rows = game.map((rd, i) => (answers[i] === rd.odd.id ? "🟩" : "🟥")).join("");
  const pre = document.createElement("pre"); pre.className = "share"; pre.textContent = rows;
  const list = document.createElement("ol"); list.className = "in-review";
  game.forEach((rd, i) => {
    const li = document.createElement("li");
    li.textContent = `${answers[i] === rd.odd.id ? "✓" : "✗"} ${rd.odd.name} · ${label(rd.cat)}`;
    list.appendChild(li);
  });
  const text = `Veloguess · ${t("inName")}${mode === "daily" ? " #" + (today + 1) : ""} ${score()}/${ROUNDS}${hint ? " 💡" : ""}\n${rows}\n${location.origin + location.pathname}`;
  const row = document.createElement("div"); row.className = "actions";
  const share = document.createElement("button"); share.className = "btn primary"; share.textContent = t("share");
  share.onclick = () => shareText(text, share, t("copied"));
  const again = document.createElement("button"); again.className = "btn"; again.textContent = t("playFree");
  again.onclick = () => start("free");
  row.append(share, again);
  r.append(h, pre, list, row);
  if (mode === "daily") { const n = document.createElement("p"); n.className = "counter"; n.textContent = t("in.nextIn", { t: untilMidnight() }); r.appendChild(n); }
  r.hidden = false;
}

// Pista: treu un dels quatre corredors que no són l'intrús. Una per partida.
function showHintAd() {
  if (answered || done || hint) return;
  const dlg = $("ad"), count = $("ad-count");
  let n = 3; count.textContent = n; dlg.showModal();
  const iv = setInterval(() => {
    n--; count.textContent = n;
    if (n <= 0) {
      clearInterval(iv); dlg.close();
      const rd = game[round];
      const fits = rd.riders.filter(r => r.id !== rd.odd.id);
      hint = { round, rider: fits[Math.floor(Math.random() * fits.length)].id };
      persist(); renderRound();
    }
  }, 1000);
}

function start(m) {
  mode = m; round = 0; answers = []; hint = null; done = false;
  $("m-daily").setAttribute("aria-pressed", m === "daily");
  $("m-free").setAttribute("aria-pressed", m === "free");
  $("result").hidden = true; $("play").hidden = false;
  const seed = m === "daily" ? 104729 * (today + 1) + 20270101 : Math.floor(Math.random() * 1e9);
  game = generateGame(D.riders, seed, ROUNDS);
  if (!game) { $("round").textContent = "No s'ha pogut generar la partida."; return; }
  if (m === "daily") {
    const saved = loadDay(GAME, today);
    answers = saved.guesses || []; hint = saved.hint || null;
    if (saved.done) { end(false); return; }
    round = Math.min(answers.length, ROUNDS - 1);
    if (answers.length === ROUNDS) { end(true); return; }
  }
  renderRound();
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
  $("next").onclick = next;
  $("hint").onclick = showHintAd;
  $("m-daily").onclick = () => start("daily");
  $("m-free").onclick = () => start("free");
  $("open-stats").onclick = showStats;
  $("close-stats").onclick = () => $("stats").close();
  start("daily");
}

init();
