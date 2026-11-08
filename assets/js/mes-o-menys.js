import { t, getLang, applyI18n } from "./i18n.js";
import { saveBest, loadBest } from "./stats.js";
import { loadData, shuffle, shareText } from "./data.js";

const GAME = "mesomenys";
const $ = id => document.getElementById(id);
let D, A, B, stat, score = 0, busy = false, recent = [];

const value = (r, s) => s === "age" ? r.born : s === "mon" ? r.monuments : r.gtWins;

function fmtDate(iso) {
  try { return new Date(iso + "T12:00:00").toLocaleDateString(getLang(), { day: "numeric", month: "long", year: "numeric" }); }
  catch (e) { return iso; }
}

function shown(r, s) {
  if (s === "age") return t("mm.bornOn", { date: fmtDate(r.born) });
  const n = value(r, s);
  return t(`mm.${s === "mon" ? "monN" : "gtN"}${n === 1 ? "1" : ""}`, { n });
}

// Tria l'estadística de la ronda i un corredor B amb un valor diferent del d'A.
// Si A no té cap victòria, la ronda és d'edat; si en té, B pot tenir-ne més o menys.
function nextRound() {
  const options = ["age"];
  if (A.monuments > 0) options.push("mon", "mon");
  if (A.gtWins > 0) options.push("gt", "gt");
  stat = options[Math.floor(Math.random() * options.length)];
  const va = value(A, stat);
  let cands = D.riders.filter(r => r.id !== A.id && !recent.includes(r.id) && value(r, stat) !== va);
  if (stat !== "age" && Math.random() < 0.5) {
    const winners = cands.filter(r => value(r, stat) > 0);
    if (winners.length) cands = winners;
  }
  B = shuffle(cands)[0];
  recent = [...recent.slice(-30), B.id];
  render();
}

function meta(r) { return `${D.teams[r.team]?.name || ""} · ${r.country}`; }

function render() {
  $("a-name").textContent = A.name; $("a-meta").textContent = meta(A); $("a-value").textContent = shown(A, stat);
  $("b-name").textContent = B.name; $("b-meta").textContent = meta(B);
  $("b-value").textContent = "?"; $("b-value").className = "value hidden";
  $("question").textContent = t(stat === "age" ? "mm.qAge" : stat === "mon" ? "mm.qMon" : "mm.qGt", { name: A.name });
  $("up").textContent = stat === "age" ? t("mm.older") : `${t("mm.more")} ↑`;
  $("down").textContent = stat === "age" ? t("mm.younger") : `${t("mm.less")} ↓`;
  $("score").textContent = score;
  $("best").textContent = loadBest(GAME);
  $("up").disabled = $("down").disabled = false;
}

function answer(up) {
  if (busy) return;
  busy = true;
  $("up").disabled = $("down").disabled = true;
  const va = value(A, stat), vb = value(B, stat);
  // "Amunt" vol dir més victòries o més gran (nascut abans).
  const isUp = stat === "age" ? vb < va : vb > va;
  const right = up === isUp;
  $("b-value").textContent = shown(B, stat);
  $("b-value").className = `value ${right ? "right" : "wrong"}`;
  if (right) {
    score++;
    $("score").textContent = score;
    setTimeout(() => { A = B; busy = false; nextRound(); }, 1100);
  } else {
    const best = saveBest(GAME, score);
    $("best").textContent = best;
    setTimeout(() => gameOver(best), 700);
  }
}

function gameOver(best) {
  $("choices").hidden = true;
  const r = $("result"); r.innerHTML = "";
  const h = document.createElement("h2"); h.textContent = t("mm.over");
  const p = document.createElement("p"); p.textContent = `${t("streak")}: ${score} · ${t("mm.best")}: ${best}`;
  const text = `Gruppetto · ${t("mmName")}\n${t("mm.shareTxt", { n: score })} 🔥\n${location.origin + location.pathname}`;
  const row = document.createElement("div"); row.className = "actions";
  const share = document.createElement("button"); share.className = "btn primary"; share.textContent = t("share");
  share.onclick = () => shareText(text, share, t("copied"));
  const again = document.createElement("button"); again.className = "btn"; again.textContent = t("mm.again");
  again.onclick = start;
  row.append(share, again);
  r.append(h, p, row);
  r.hidden = false;
}

function start() {
  score = 0; busy = false; recent = [];
  $("result").hidden = true; $("choices").hidden = false;
  A = shuffle(D.riders.filter(r => r.monuments > 0 || r.gtWins > 0 || Math.random() < 0.2))[0];
  recent = [A.id];
  nextRound();
}

async function init() {
  applyI18n();
  D = await loadData();
  $("up").onclick = () => answer(true);
  $("down").onclick = () => answer(false);
  start();
}

init();
