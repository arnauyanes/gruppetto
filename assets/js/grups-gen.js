// Generador de reptes de Grups. Sense DOM, perquè es pugui provar fora del navegador.
import { rng, shuffle } from "./data.js";

// Categories possibles. Només fem servir corredors amb l'especialitat segura, perquè
// un corredor amb l'especialitat pendent podria encaixar en un grup sense saber-ho.
export function categories(pool) {
  const cats = [];
  const group = (key, fn) => { const m = {}; pool.forEach(r => { const k = fn(r); if (k != null) (m[k] ||= []).push(r); }); return m; };
  for (const [k, rs] of Object.entries(group("team", r => r.team))) if (rs.length >= 4) cats.push({ type: "team", key: k, test: r => r.team === k });
  for (const [k, rs] of Object.entries(group("country", r => r.country))) if (rs.length >= 4) cats.push({ type: "country", key: k, test: r => r.country === k });
  for (const [k, rs] of Object.entries(group("spec", r => r.spec))) if (rs.length >= 4) cats.push({ type: "spec", key: k, test: r => r.spec === k });
  for (const [k, rs] of Object.entries(group("year", r => r.born.slice(0, 4)))) if (rs.length >= 4) cats.push({ type: "year", key: k, test: r => r.born.slice(0, 4) === k });
  if (pool.filter(r => r.gtWins > 0).length >= 4) cats.push({ type: "gt", key: "gt", test: r => r.gtWins > 0 });
  if (pool.filter(r => r.monuments > 0).length >= 4) cats.push({ type: "mon", key: "mon", test: r => r.monuments > 0 });
  return cats;
}

const EASE = { team: 0, country: 1, spec: 2, gt: 2, mon: 2, year: 3 };
const MAX_PER_TYPE = { team: 2, country: 1, spec: 1, gt: 1, mon: 1, year: 1 };

// Tria 4 categories i 4 corredors per categoria de manera que cada corredor
// compleixi exactament una de les quatre: així només hi ha una solució.
export function generatePuzzle(riders, seed) {
  const rand = rng(seed);
  const pool = riders.filter(r => r.specConfidence === "sure" && r.spec);
  const cats = categories(pool);
  for (let attempt = 0; attempt < 400; attempt++) {
    const chosen = [], per = {};
    for (const c of shuffle(cats, rand)) {
      if ((per[c.type] || 0) >= MAX_PER_TYPE[c.type]) continue;
      chosen.push(c); per[c.type] = (per[c.type] || 0) + 1;
      if (chosen.length === 4) break;
    }
    if (chosen.length < 4) continue;
    const used = new Set(), groups = [];
    let ok = true;
    for (const c of chosen) {
      const cands = shuffle(pool.filter(r => c.test(r) && !used.has(r.id) && chosen.filter(o => o.test(r)).length === 1), rand);
      if (cands.length < 4) { ok = false; break; }
      const pick = cands.slice(0, 4);
      pick.forEach(r => used.add(r.id));
      groups.push({ cat: c, riders: pick });
    }
    if (!ok) continue;
    groups.sort((a, b) => EASE[a.cat.type] - EASE[b.cat.type] || a.cat.key.localeCompare(b.cat.key));
    groups.forEach((g, i) => { g.level = i; });
    return groups;
  }
  return null;
}

