// Textos de la plataforma en 5 idiomes.
// Per afegir un text nou: afegeix la clau a tots els idiomes.
export const LANGS = { ca: "Català", es: "Español", en: "English", fr: "Français", it: "Italiano" };

const T = {
  ca: {
    giveUp: "Em rendeixo", giveUpConfirm: "Segur? Es mostrarà la solució i comptarà com a derrota.", giveUpYes: "Sí, mostra-la", cancel: "Continua jugant", gaveUp: "T'has retirat", share: "Comparteix el resultat", shareOn: "Comparteix a", copyText: "Copia el text", shareInvite: "Saps qui és el corredor d'avui?",
    tagline: "Jocs diaris per a aficionats al ciclisme",
    gamesTitle: "Jocs",
    soon: "Aviat",
    whoName: "Qui és?",
    whoDesc: "Endevina el corredor del dia a partir del país, l'equip, l'edat i el palmarès.",
    gridName: "Graella",
    gridDesc: "Omple la graella amb corredors que compleixin cada condició.",
    historyName: "Llegendes",
    historyDesc: "El mateix joc amb les grans figures de tota la història.",
    modeDaily: "Diari", modeFree: "Lliure",
    tries: "Intent {n} / {max}",
    placeholder: "Escriu el nom d'un ciclista…",
    finished: "Partida acabada",
    colRider: "Corredor", colNat: "País", colTeam: "Equip", colAge: "Edat", colSpec: "Especialitat", colGT: "Grans voltes", colMon: "Monuments",
    years: "anys",
    legendOk: "Correcte", legendNear: "A prop (mateix continent / ±2 anys)", legendMiss: "No", legendArrow: "↑↓ el misteriós és més gran o en té més",
    won: "Has guanyat l'etapa!", lost: "Fora de control",
    wonText: "L'has trobat en {n} intents.", lostText: "El corredor era",
    copy: "Copia el resultat", copied: "Copiat", playFree: "Partida lliure",
    hintBtn: "Pista (veure anunci)", hintUsed: "Pista utilitzada", hintTeam: "Pista: corre a {team}.",
    adTitle: "Anunci", adText: "Aquí sortirà un anunci de vídeo. La pista arriba quan acabi.", adSim: "Simulació de prova",
    stats: "Estadístiques", close: "Tanca",
    played: "Jugades", winPct: "% victòries", streak: "Ratxa", maxStreak: "Millor ratxa", distribution: "Intents per victòria",
    nextIn: "Nou corredor en {t}",
    sampleNote: "Versió de proves. Plantilles 2027 provisionals.",
    spec: { gv: "Gran volta", climber: "Escalador", puncheur: "Puncheur", classics: "Clàssiques", sprinter: "Esprintador", tt: "Crono", domestique: "Gregari" },
    cont: { EU: "Europa", AM: "Amèrica", AF: "Àfrica", AS: "Àsia", OC: "Oceania" }
  },
  es: {
    giveUp: "Me rindo", giveUpConfirm: "¿Seguro? Se mostrará la solución y contará como derrota.", giveUpYes: "Sí, muéstrala", cancel: "Seguir jugando", gaveUp: "Te has retirado", share: "Comparte tu resultado", shareOn: "Compartir en", copyText: "Copiar texto", shareInvite: "¿Sabes quién es el corredor de hoy?",
    tagline: "Juegos diarios para aficionados al ciclismo",
    gamesTitle: "Juegos",
    soon: "Pronto",
    whoName: "¿Quién es?",
    whoDesc: "Adivina el corredor del día a partir del país, el equipo, la edad y el palmarés.",
    gridName: "Cuadrícula",
    gridDesc: "Rellena la cuadrícula con corredores que cumplan cada condición.",
    historyName: "Leyendas",
    historyDesc: "El mismo juego con las grandes figuras de toda la historia.",
    modeDaily: "Diario", modeFree: "Libre",
    tries: "Intento {n} / {max}",
    placeholder: "Escribe el nombre de un ciclista…",
    finished: "Partida terminada",
    colRider: "Corredor", colNat: "País", colTeam: "Equipo", colAge: "Edad", colSpec: "Especialidad", colGT: "Grandes vueltas", colMon: "Monumentos",
    years: "años",
    legendOk: "Correcto", legendNear: "Cerca (mismo continente / ±2 años)", legendMiss: "No", legendArrow: "↑↓ el misterioso es mayor o tiene más",
    won: "¡Has ganado la etapa!", lost: "Fuera de control",
    wonText: "Lo has encontrado en {n} intentos.", lostText: "El corredor era",
    copy: "Copiar resultado", copied: "Copiado", playFree: "Partida libre",
    hintBtn: "Pista (ver anuncio)", hintUsed: "Pista usada", hintTeam: "Pista: corre en {team}.",
    adTitle: "Anuncio", adText: "Aquí aparecerá un anuncio de vídeo. La pista llega cuando termine.", adSim: "Simulación de prueba",
    stats: "Estadísticas", close: "Cerrar",
    played: "Jugadas", winPct: "% victorias", streak: "Racha", maxStreak: "Mejor racha", distribution: "Intentos por victoria",
    nextIn: "Nuevo corredor en {t}",
    sampleNote: "Versión de pruebas. Plantillas 2027 provisionales.",
    spec: { gv: "Gran vuelta", climber: "Escalador", puncheur: "Puncheur", classics: "Clásicas", sprinter: "Esprínter", tt: "Crono", domestique: "Gregario" },
    cont: { EU: "Europa", AM: "América", AF: "África", AS: "Asia", OC: "Oceanía" }
  },
  en: {
    giveUp: "Give up", giveUpConfirm: "Sure? The answer will be shown and it counts as a loss.", giveUpYes: "Yes, show it", cancel: "Keep playing", gaveUp: "Abandoned", share: "Share your score", shareOn: "Share on", copyText: "Copy text", shareInvite: "Can you guess today's rider?",
    tagline: "Daily games for cycling fans",
    gamesTitle: "Games",
    soon: "Soon",
    whoName: "Who's that rider?",
    whoDesc: "Guess the rider of the day from nationality, team, age and palmarès.",
    gridName: "Grid",
    gridDesc: "Fill the grid with riders who match each condition.",
    historyName: "Legends",
    historyDesc: "The same game with the greatest riders in history.",
    modeDaily: "Daily", modeFree: "Free play",
    tries: "Guess {n} / {max}",
    placeholder: "Type a rider's name…",
    finished: "Game over",
    colRider: "Rider", colNat: "Country", colTeam: "Team", colAge: "Age", colSpec: "Specialty", colGT: "Grand Tours", colMon: "Monuments",
    years: "years",
    legendOk: "Correct", legendNear: "Close (same continent / ±2 years)", legendMiss: "No", legendArrow: "↑↓ the mystery rider is older or has more",
    won: "Stage win!", lost: "Outside the time cut",
    wonText: "You found them in {n} guesses.", lostText: "The rider was",
    copy: "Copy result", copied: "Copied", playFree: "Free play",
    hintBtn: "Hint (watch an ad)", hintUsed: "Hint used", hintTeam: "Hint: rides for {team}.",
    adTitle: "Ad", adText: "A video ad will play here. You get the hint when it ends.", adSim: "Test simulation",
    stats: "Statistics", close: "Close",
    played: "Played", winPct: "Win %", streak: "Streak", maxStreak: "Best streak", distribution: "Guesses per win",
    nextIn: "New rider in {t}",
    sampleNote: "Test version. Provisional 2027 rosters.",
    spec: { gv: "Grand Tour", climber: "Climber", puncheur: "Puncheur", classics: "Classics", sprinter: "Sprinter", tt: "TT", domestique: "Domestique" },
    cont: { EU: "Europe", AM: "Americas", AF: "Africa", AS: "Asia", OC: "Oceania" }
  },
  fr: {
    giveUp: "J'abandonne", giveUpConfirm: "Sûr ? La solution sera affichée et comptera comme une défaite.", giveUpYes: "Oui, montre-la", cancel: "Continuer", gaveUp: "Abandon", share: "Partage ton score", shareOn: "Partager sur", copyText: "Copier le texte", shareInvite: "Sauras-tu trouver le coureur du jour ?",
    tagline: "Jeux quotidiens pour les fans de cyclisme",
    gamesTitle: "Jeux",
    soon: "Bientôt",
    whoName: "Qui est-ce ?",
    whoDesc: "Devine le coureur du jour grâce à la nationalité, l'équipe, l'âge et le palmarès.",
    gridName: "Grille",
    gridDesc: "Remplis la grille avec des coureurs qui remplissent chaque condition.",
    historyName: "Légendes",
    historyDesc: "Le même jeu avec les plus grands coureurs de l'histoire.",
    modeDaily: "Quotidien", modeFree: "Libre",
    tries: "Essai {n} / {max}",
    placeholder: "Tape le nom d'un coureur…",
    finished: "Partie terminée",
    colRider: "Coureur", colNat: "Pays", colTeam: "Équipe", colAge: "Âge", colSpec: "Spécialité", colGT: "Grands Tours", colMon: "Monuments",
    years: "ans",
    legendOk: "Correct", legendNear: "Proche (même continent / ±2 ans)", legendMiss: "Non", legendArrow: "↑↓ le coureur mystère est plus âgé ou en a plus",
    won: "Victoire d'étape !", lost: "Hors délais",
    wonText: "Trouvé en {n} essais.", lostText: "Le coureur était",
    copy: "Copier le résultat", copied: "Copié", playFree: "Partie libre",
    hintBtn: "Indice (voir une pub)", hintUsed: "Indice utilisé", hintTeam: "Indice : il court chez {team}.",
    adTitle: "Publicité", adText: "Une publicité vidéo s'affichera ici. L'indice arrive à la fin.", adSim: "Simulation de test",
    stats: "Statistiques", close: "Fermer",
    played: "Parties", winPct: "% victoires", streak: "Série", maxStreak: "Meilleure série", distribution: "Essais par victoire",
    nextIn: "Nouveau coureur dans {t}",
    sampleNote: "Version de test. Effectifs 2027 provisoires.",
    spec: { gv: "Grand Tour", climber: "Grimpeur", puncheur: "Puncheur", classics: "Classiques", sprinter: "Sprinteur", tt: "Chrono", domestique: "Équipier" },
    cont: { EU: "Europe", AM: "Amérique", AF: "Afrique", AS: "Asie", OC: "Océanie" }
  },
  it: {
    giveUp: "Mi arrendo", giveUpConfirm: "Sicuro? Verrà mostrata la soluzione e conterà come sconfitta.", giveUpYes: "Sì, mostrala", cancel: "Continua a giocare", gaveUp: "Ritirato", share: "Condividi il punteggio", shareOn: "Condividi su", copyText: "Copia il testo", shareInvite: "Sai chi è il corridore di oggi?",
    tagline: "Giochi quotidiani per gli appassionati di ciclismo",
    gamesTitle: "Giochi",
    soon: "Presto",
    whoName: "Chi è?",
    whoDesc: "Indovina il corridore del giorno da nazionalità, squadra, età e palmarès.",
    gridName: "Griglia",
    gridDesc: "Riempi la griglia con corridori che soddisfano ogni condizione.",
    historyName: "Leggende",
    historyDesc: "Lo stesso gioco con i grandi campioni di tutta la storia.",
    modeDaily: "Giornaliero", modeFree: "Libero",
    tries: "Tentativo {n} / {max}",
    placeholder: "Scrivi il nome di un corridore…",
    finished: "Partita finita",
    colRider: "Corridore", colNat: "Paese", colTeam: "Squadra", colAge: "Età", colSpec: "Specialità", colGT: "Grandi giri", colMon: "Monumento",
    years: "anni",
    legendOk: "Giusto", legendNear: "Vicino (stesso continente / ±2 anni)", legendMiss: "No", legendArrow: "↑↓ il corridore misterioso è più grande o ne ha di più",
    won: "Vittoria di tappa!", lost: "Fuori tempo massimo",
    wonText: "Trovato in {n} tentativi.", lostText: "Il corridore era",
    copy: "Copia il risultato", copied: "Copiato", playFree: "Partita libera",
    hintBtn: "Indizio (guarda uno spot)", hintUsed: "Indizio usato", hintTeam: "Indizio: corre per {team}.",
    adTitle: "Pubblicità", adText: "Qui comparirà uno spot video. L'indizio arriva alla fine.", adSim: "Simulazione di prova",
    stats: "Statistiche", close: "Chiudi",
    played: "Giocate", winPct: "% vittorie", streak: "Serie", maxStreak: "Serie migliore", distribution: "Tentativi per vittoria",
    nextIn: "Nuovo corridore tra {t}",
    sampleNote: "Versione di prova. Rose 2027 provvisorie.",
    spec: { gv: "Grandi giri", climber: "Scalatore", puncheur: "Puncheur", classics: "Classiche", sprinter: "Velocista", tt: "Crono", domestique: "Gregario" },
    cont: { EU: "Europa", AM: "America", AF: "Africa", AS: "Asia", OC: "Oceania" }
  }
};

const KEY = "gruppetto.lang";

export function getLang() {
  try { const s = localStorage.getItem(KEY); if (s && T[s]) return s; } catch (e) {}
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return T[nav] ? nav : "en";
}

export function setLang(l) {
  try { localStorage.setItem(KEY, l); } catch (e) {}
}

export function t(key, vars = {}, lang = getLang()) {
  const parts = key.split(".");
  let v = T[lang];
  for (const p of parts) v = v?.[p];
  if (v == null) { v = T.en; for (const p of parts) v = v?.[p]; }
  if (typeof v !== "string") return key;
  return v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

// Omple tots els elements amb data-i18n="clau" i crea el selector d'idioma.
export function applyI18n(root = document) {
  const lang = getLang();
  document.documentElement.lang = lang;
  root.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  const sel = root.querySelector("select.lang");
  if (sel && !sel.options.length) {
    for (const [code, name] of Object.entries(LANGS)) sel.add(new Option(name, code));
    sel.value = lang;
    sel.addEventListener("change", () => { setLang(sel.value); location.reload(); });
  }
}
