// Generador de rondes de l'Intrús. Sense DOM, perquè es pugui provar fora del navegador.
import { rng, shuffle } from "./data.js";
import { categories } from "./grups-gen.js";

// Pes de cada tipus de categoria: l'any de naixement és el més difícil, per això surt menys.
const WEIGHTS = [["team", 30], ["country", 25], ["spec", 25], ["gt", 6], ["mon", 6], ["year", 8]];
function pickType(rand) {
  let x = rand() * WEIGHTS.reduce((a, [, w]) => a + w, 0);
  for (const [t, w] of WEIGHTS) { if ((x -= w) < 0) return t; }
  return "team";
}

// Una ronda: 4 corredors que comparteixen una categoria i 1 que no.
// És vàlida només si cap altra categoria agrupa exactament 4 dels 5 corredors
// (si no, hi hauria dos intrusos possibles).
function makeRound(cats, rand, avoid, lastType, usedCats) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const type = pickType(rand);
    if (type === lastType) continue;
    const ofType = cats.filter(x => x.type === type && !usedCats.has(x));
    if (!ofType.length) continue;
    const c = ofType[Math.floor(rand() * ofType.length)];
    const ins = shuffle(c.members.filter(r => !avoid.has(r.id)), rand);
    if (ins.length < 4) continue;
    const four = ins.slice(0, 4);
    // L'intrús ha de semblar-s'hi: comparteix alguna altra categoria amb algun dels quatre.
    const outs = shuffle(c.outsiders.filter(r => !avoid.has(r.id)), rand).slice(0, 40);
    for (const odd of outs) {
      const five = [...four, odd];
      if (!cats.some(o => o !== c && o.test(odd) && four.some(r => o.test(r)))) continue;
      const clash = cats.some(o => o !== c && five.filter(r => o.test(r)).length === 4);
      if (clash) continue;
      return { cat: c, odd, riders: shuffle(five, rand) };
    }
  }
  return null;
}

export function generateGame(riders, seed, rounds = 10) {
  const rand = rng(seed);
  const pool = riders.filter(r => r.specConfidence === "sure" && r.spec);
  const cats = categories(pool).map(c => ({ ...c, members: pool.filter(c.test), outsiders: pool.filter(r => !c.test(r)) }));
  const avoid = new Set(), usedCats = new Set(), out = [];
  let lastType = null;
  for (let i = 0; i < rounds; i++) {
    const r = makeRound(cats, rand, avoid, lastType, usedCats);
    if (!r) return null;
    r.riders.forEach(x => avoid.add(x.id));
    if (avoid.size > pool.length - 20) avoid.clear();
    lastType = r.cat.type;
    usedCats.add(r.cat);
    out.push(r);
  }
  return out;
}
