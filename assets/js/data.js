// Utilitats compartides pels jocs: càrrega de dades, dies de joc i atzar determinista.
import { getLang } from "./i18n.js";

const EPOCH = new Date(2026, 0, 1);

// Normalitza per comparar noms: sense accents, minúscules, sense signes.
export const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

// Dia de joc segons la data local (com el Wordle).
export function dayIndexOf(d = new Date()) {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((local - EPOCH) / 86400000);
}

// Generador pseudoaleatori amb llavor: tothom obté el mateix repte el mateix dia.
export function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function ageOf(born, now = new Date()) {
  const [y, m = 7, d = 1] = born.split("-").map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

export function countryName(code, countries, lang = getLang()) {
  const names = countries[code]?.names;
  if (names) return names[lang] || names.en || code;
  const iso = countries[code]?.iso2;
  if (!iso) return code;
  try { return new Intl.DisplayNames([lang], { type: "region" }).of(iso) || code; } catch (e) { return code; }
}

export function untilMidnight() {
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const s = Math.max(0, Math.floor((mid - now) / 1000));
  return [s / 3600, (s % 3600) / 60, s % 60].map(v => String(Math.floor(v)).padStart(2, "0")).join(":");
}

export async function loadData(base = "../data/") {
  const [r, tm, c, sp] = await Promise.all(["riders", "teams", "countries", "specialties"]
    .map(f => fetch(`${base}${f}.json`).then(x => x.json())));
  const teams = Object.fromEntries(tm.teams.map(x => [x.id, x]));
  const riders = r.riders.filter(x => x.born && x.country).map(x => {
    const s = sp.riders[x.id] || {};
    return { ...x, age: ageOf(x.born), spec: s.spec || null, specConfidence: s.spec ? (s.confidence || "unknown") : "unknown" };
  });
  return { riders, teams, countries: c, season: r.season, byId: Object.fromEntries(riders.map(x => [x.id, x])) };
}

// Copia un text o, si no es pot, el selecciona perquè el jugador el copiï.
export async function shareText(text, btn, copiedLabel) {
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(text); btn.textContent = copiedLabel; } catch (e) {}
}
