// Estadístiques i partida del dia, guardades al navegador del jugador.
// Més endavant, amb compte d'usuari, es podran sincronitzar amb el servidor.

const safeGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

export function loadStats(game) {
  return safeGet(`gruppetto.${game}.stats`) || { played: 0, wins: 0, streak: 0, maxStreak: 0, lastDay: null, dist: {} };
}

// Registra una partida diària acabada. dayIndex evita comptar-la dues vegades.
export function recordDaily(game, dayIndex, won, tries) {
  const s = loadStats(game);
  if (s.lastDay === dayIndex) return s;
  s.played++;
  if (won) {
    s.wins++;
    s.streak = s.lastDay === dayIndex - 1 ? s.streak + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
    s.dist[tries] = (s.dist[tries] || 0) + 1;
  } else {
    s.streak = 0;
  }
  s.lastDay = dayIndex;
  safeSet(`gruppetto.${game}.stats`, s);
  return s;
}

export function loadDay(game, dayIndex) {
  const d = safeGet(`gruppetto.${game}.day`);
  return d && d.day === dayIndex ? d : { day: dayIndex, guesses: [], hint: false };
}

export function saveDay(game, data) {
  safeSet(`gruppetto.${game}.day`, data);
}
