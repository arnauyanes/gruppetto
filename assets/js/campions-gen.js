// Preguntes de Campions: cursa + any. Sense DOM, per poder-ho provar fora del navegador.
import { rng, shuffle } from "./data.js";

// Pes de cada època: les recents són més conegudes, però hi ha de tot.
const ERAS = [[1990, 9999, 60], [1970, 1989, 30], [1900, 1969, 10]];

function pickEra(rand) {
  let x = rand() * 100;
  for (const [a, b, w] of ERAS) { if ((x -= w) < 0) return [a, b]; }
  return ERAS[0];
}

export function generateQuestions(editions, seed, n = 10) {
  const rand = rng(seed);
  const out = [], used = new Set();
  let lastRace = null;
  for (let attempt = 0; out.length < n && attempt < 2000; attempt++) {
    const [a, b] = pickEra(rand);
    const pool = editions.filter(e => e.year >= a && e.year <= b && e.race !== lastRace && !used.has(`${e.race}-${e.year}`));
    if (!pool.length) continue;
    const e = shuffle(pool, rand)[0];
    used.add(`${e.race}-${e.year}`);
    lastRace = e.race;
    out.push(e);
  }
  return out;
}
