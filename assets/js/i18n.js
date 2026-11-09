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
    ctName: "Contrarellotge",
    ctDesc: "Dos minuts per dir tots els corredors que puguis d'un equip o d'un país.",
    grName: "Grups",
    grDesc: "Agrupa 16 corredors en 4 grups de 4 que tinguin alguna cosa en comú.",
    mmName: "Més o menys",
    mmDesc: "Té més o menys monuments? És més gran o més jove? Encadena encerts.",
    played: "Jugades",
    streak: "Ratxa",
    maxStreak: "Millor ratxa",
    ct: {"intro": "Tens 2 minuts per escriure tots els corredors que puguis. N'hi ha prou amb el cognom, o amb el nom i Enter, si no n'hi ha cap altre d'igual.", "ambiguous": "Hi ha més d'un «{name}» en aquest repte: escriu el nom complet.", "start": "Comença", "finish": "Acaba ara", "team": "Equip: {name}", "country": "País: {name}", "found": "{n} de {total}", "placeholder": "Escriu un corredor…", "notIn": "{name} no hi és", "already": "Ja el tens", "end": "Temps!", "result": "Has trobat {n} de {total} corredors.", "missed": "Els que et falten", "best": "Millor %", "avg": "Mitjana %", "nextIn": "Nou repte en {t}"},
    gr: {"hintTheme": "Pista: un dels grups és «{name}».", "hintRider": "Pista: {rider} és del grup «{name}».", "noHints": "No queden pistes", "intro": "Troba quatre grups de quatre corredors amb alguna cosa en comú. Pots fallar quatre vegades.", "submit": "Comprova", "shuffle": "Barreja", "clear": "Desselecciona", "mistakes": "Errors: {n} de {max}", "oneAway": "Gairebé! Te'n falta un.", "already": "Aquesta combinació ja l'has provat.", "won": "Ho has resolt!", "lost": "Avui no ha pogut ser", "solution": "Solució", "nextIn": "Nous grups en {t}", "winPct": "% resolts", "cat": {"team": "Equip: {name}", "country": "País: {name}", "gt": "Han guanyat una gran volta", "mon": "Han guanyat un monument", "year": "Nascuts el {year}"}, "specPl": {"gv": "Corredors de gran volta", "climber": "Escaladors", "puncheur": "Puncheurs", "classics": "Clàssics", "sprinter": "Esprintadors", "tt": "Contrarellotgistes", "domestique": "Gregaris"}},
    mm: {"intro": "Endevina si el següent corredor en té més o menys que l'anterior. Si falles, s'acaba la ratxa.", "more": "Més", "less": "Menys", "older": "Més gran", "younger": "Més jove", "qMon": "Té més o menys monuments que {name}?", "qGt": "Té més o menys grans voltes que {name}?", "qAge": "És més gran o més jove que {name}?", "monN1": "1 monument", "gtN1": "1 gran volta", "monN": "{n} monuments", "gtN": "{n} grans voltes", "bornOn": "Nascut el {date}", "best": "Millor ratxa", "over": "S'ha acabat la ratxa", "again": "Torna-hi", "shareTxt": "He encadenat {n} encerts a Més o menys"},
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
    ctName: "Contrarreloj",
    ctDesc: "Dos minutos para decir todos los corredores que puedas de un equipo o de un país.",
    grName: "Grupos",
    grDesc: "Agrupa 16 corredores en 4 grupos de 4 que tengan algo en común.",
    mmName: "Más o menos",
    mmDesc: "¿Tiene más o menos monumentos? ¿Es mayor o más joven? Encadena aciertos.",
    played: "Jugadas",
    streak: "Racha",
    maxStreak: "Mejor racha",
    ct: {"intro": "Tienes 2 minutos para escribir todos los corredores que puedas. Basta con el apellido, o con el nombre y Enter, si no hay otro igual.", "ambiguous": "Hay más de un «{name}» en este reto: escribe el nombre completo.", "start": "Empezar", "finish": "Terminar ya", "team": "Equipo: {name}", "country": "País: {name}", "found": "{n} de {total}", "placeholder": "Escribe un corredor…", "notIn": "{name} no está", "already": "Ya lo tienes", "end": "¡Tiempo!", "result": "Has encontrado {n} de {total} corredores.", "missed": "Los que te faltan", "best": "Mejor %", "avg": "Media %", "nextIn": "Nuevo reto en {t}"},
    gr: {"hintTheme": "Pista: uno de los grupos es «{name}».", "hintRider": "Pista: {rider} es del grupo «{name}».", "noHints": "No quedan pistas", "intro": "Encuentra cuatro grupos de cuatro corredores con algo en común. Puedes fallar cuatro veces.", "submit": "Comprobar", "shuffle": "Mezclar", "clear": "Deseleccionar", "mistakes": "Errores: {n} de {max}", "oneAway": "¡Casi! Te falta uno.", "already": "Esta combinación ya la has probado.", "won": "¡Resuelto!", "lost": "Hoy no ha podido ser", "solution": "Solución", "nextIn": "Nuevos grupos en {t}", "winPct": "% resueltos", "cat": {"team": "Equipo: {name}", "country": "País: {name}", "gt": "Han ganado una gran vuelta", "mon": "Han ganado un monumento", "year": "Nacidos en {year}"}, "specPl": {"gv": "Corredores de gran vuelta", "climber": "Escaladores", "puncheur": "Puncheurs", "classics": "Clasicómanos", "sprinter": "Esprínters", "tt": "Contrarrelojistas", "domestique": "Gregarios"}},
    mm: {"intro": "Adivina si el siguiente corredor tiene más o menos que el anterior. Si fallas, se acaba la racha.", "more": "Más", "less": "Menos", "older": "Mayor", "younger": "Más joven", "qMon": "¿Tiene más o menos monumentos que {name}?", "qGt": "¿Tiene más o menos grandes vueltas que {name}?", "qAge": "¿Es mayor o más joven que {name}?", "monN1": "1 monumento", "gtN1": "1 gran vuelta", "monN": "{n} monumentos", "gtN": "{n} grandes vueltas", "bornOn": "Nacido el {date}", "best": "Mejor racha", "over": "Se acabó la racha", "again": "Otra vez", "shareTxt": "He encadenado {n} aciertos en Más o menos"},
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
    ctName: "Time Trial",
    ctDesc: "Two minutes to name as many riders as you can from a team or a country.",
    grName: "Groups",
    grDesc: "Sort 16 riders into 4 groups of 4 that have something in common.",
    mmName: "Higher or Lower",
    mmDesc: "More or fewer Monuments? Older or younger? Keep the streak going.",
    played: "Played",
    streak: "Streak",
    maxStreak: "Best streak",
    ct: {"intro": "You have 2 minutes to type as many riders as you can. The surname, or the first name plus Enter, is enough if nobody else shares it.", "ambiguous": "There's more than one “{name}” here: type the full name.", "start": "Start", "finish": "Finish now", "team": "Team: {name}", "country": "Country: {name}", "found": "{n} of {total}", "placeholder": "Type a rider…", "notIn": "{name} isn't on the list", "already": "Already found", "end": "Time's up!", "result": "You found {n} of {total} riders.", "missed": "The ones you missed", "best": "Best %", "avg": "Average %", "nextIn": "New challenge in {t}"},
    gr: {"hintTheme": "Hint: one group is “{name}”.", "hintRider": "Hint: {rider} belongs to “{name}”.", "noHints": "No hints left", "intro": "Find four groups of four riders with something in common. You can make four mistakes.", "submit": "Submit", "shuffle": "Shuffle", "clear": "Deselect all", "mistakes": "Mistakes: {n} of {max}", "oneAway": "One away!", "already": "You've already tried that.", "won": "Solved!", "lost": "Not today", "solution": "Solution", "nextIn": "New groups in {t}", "winPct": "Solved %", "cat": {"team": "Team: {name}", "country": "Country: {name}", "gt": "Grand Tour winners", "mon": "Monument winners", "year": "Born in {year}"}, "specPl": {"gv": "Grand Tour riders", "climber": "Climbers", "puncheur": "Puncheurs", "classics": "Classics specialists", "sprinter": "Sprinters", "tt": "Time triallists", "domestique": "Domestiques"}},
    mm: {"intro": "Guess whether the next rider has more or less than the previous one. One wrong answer ends the streak.", "more": "More", "less": "Fewer", "older": "Older", "younger": "Younger", "qMon": "More or fewer Monuments than {name}?", "qGt": "More or fewer Grand Tours than {name}?", "qAge": "Older or younger than {name}?", "monN1": "1 Monument", "gtN1": "1 Grand Tour", "monN": "{n} Monuments", "gtN": "{n} Grand Tours", "bornOn": "Born {date}", "best": "Best streak", "over": "Streak over", "again": "Play again", "shareTxt": "I got a streak of {n} in Higher or Lower"},
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
    ctName: "Contre-la-montre",
    ctDesc: "Deux minutes pour citer le plus de coureurs possible d'une équipe ou d'un pays.",
    grName: "Groupes",
    grDesc: "Range 16 coureurs en 4 groupes de 4 qui ont un point commun.",
    mmName: "Plus ou moins",
    mmDesc: "Plus ou moins de Monuments ? Plus âgé ou plus jeune ? Enchaîne les bonnes réponses.",
    played: "Parties",
    streak: "Série",
    maxStreak: "Meilleure série",
    ct: {"intro": "Tu as 2 minutes pour écrire le plus de coureurs possible. Le nom de famille, ou le prénom puis Entrée, suffit s'il est unique.", "ambiguous": "Il y a plusieurs « {name} » dans ce défi : écris le nom complet.", "start": "Commencer", "finish": "Terminer", "team": "Équipe : {name}", "country": "Pays : {name}", "found": "{n} sur {total}", "placeholder": "Tape un coureur…", "notIn": "{name} n'y est pas", "already": "Déjà trouvé", "end": "Temps écoulé !", "result": "Tu as trouvé {n} coureurs sur {total}.", "missed": "Ceux qui manquent", "best": "Meilleur %", "avg": "Moyenne %", "nextIn": "Nouveau défi dans {t}"},
    gr: {"hintTheme": "Indice : un des groupes est « {name} ».", "hintRider": "Indice : {rider} fait partie du groupe « {name} ».", "noHints": "Plus d'indices", "intro": "Trouve quatre groupes de quatre coureurs ayant un point commun. Tu as droit à quatre erreurs.", "submit": "Valider", "shuffle": "Mélanger", "clear": "Tout désélectionner", "mistakes": "Erreurs : {n} sur {max}", "oneAway": "Presque ! Il en manque un.", "already": "Tu as déjà essayé cette combinaison.", "won": "Résolu !", "lost": "Pas aujourd'hui", "solution": "Solution", "nextIn": "Nouveaux groupes dans {t}", "winPct": "% résolus", "cat": {"team": "Équipe : {name}", "country": "Pays : {name}", "gt": "Vainqueurs d'un Grand Tour", "mon": "Vainqueurs d'un Monument", "year": "Nés en {year}"}, "specPl": {"gv": "Coureurs de Grand Tour", "climber": "Grimpeurs", "puncheur": "Puncheurs", "classics": "Spécialistes des classiques", "sprinter": "Sprinteurs", "tt": "Rouleurs", "domestique": "Équipiers"}},
    mm: {"intro": "Devine si le coureur suivant en a plus ou moins que le précédent. Une erreur et la série s'arrête.", "more": "Plus", "less": "Moins", "older": "Plus âgé", "younger": "Plus jeune", "qMon": "Plus ou moins de Monuments que {name} ?", "qGt": "Plus ou moins de Grands Tours que {name} ?", "qAge": "Plus âgé ou plus jeune que {name} ?", "monN1": "1 Monument", "gtN1": "1 Grand Tour", "monN": "{n} Monuments", "gtN": "{n} Grands Tours", "bornOn": "Né le {date}", "best": "Meilleure série", "over": "Fin de la série", "again": "Rejouer", "shareTxt": "J'ai enchaîné {n} bonnes réponses à Plus ou moins"},
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
    ctName: "Cronometro",
    ctDesc: "Due minuti per nominare più corridori possibile di una squadra o di un paese.",
    grName: "Gruppi",
    grDesc: "Dividi 16 corridori in 4 gruppi da 4 con qualcosa in comune.",
    mmName: "Più o meno",
    mmDesc: "Più o meno Monumenti? Più grande o più giovane? Allunga la serie.",
    played: "Giocate",
    streak: "Serie",
    maxStreak: "Serie migliore",
    ct: {"intro": "Hai 2 minuti per scrivere più corridori possibile. Basta il cognome, o il nome più Invio, se nessun altro lo ha uguale.", "ambiguous": "C'è più di un «{name}» in questa sfida: scrivi il nome completo.", "start": "Inizia", "finish": "Termina ora", "team": "Squadra: {name}", "country": "Paese: {name}", "found": "{n} su {total}", "placeholder": "Scrivi un corridore…", "notIn": "{name} non c'è", "already": "Già trovato", "end": "Tempo scaduto!", "result": "Hai trovato {n} corridori su {total}.", "missed": "Quelli che mancano", "best": "Migliore %", "avg": "Media %", "nextIn": "Nuova sfida tra {t}"},
    gr: {"hintTheme": "Indizio: uno dei gruppi è «{name}».", "hintRider": "Indizio: {rider} fa parte del gruppo «{name}».", "noHints": "Nessun indizio rimasto", "intro": "Trova quattro gruppi di quattro corridori con qualcosa in comune. Puoi sbagliare quattro volte.", "submit": "Verifica", "shuffle": "Mescola", "clear": "Deseleziona", "mistakes": "Errori: {n} su {max}", "oneAway": "Quasi! Ne manca uno.", "already": "Hai già provato questa combinazione.", "won": "Risolto!", "lost": "Non oggi", "solution": "Soluzione", "nextIn": "Nuovi gruppi tra {t}", "winPct": "% risolti", "cat": {"team": "Squadra: {name}", "country": "Paese: {name}", "gt": "Vincitori di un grande giro", "mon": "Vincitori di una Classica Monumento", "year": "Nati nel {year}"}, "specPl": {"gv": "Uomini da grandi giri", "climber": "Scalatori", "puncheur": "Puncheur", "classics": "Specialisti delle classiche", "sprinter": "Velocisti", "tt": "Cronoman", "domestique": "Gregari"}},
    mm: {"intro": "Indovina se il prossimo corridore ne ha di più o di meno del precedente. Un errore e la serie finisce.", "more": "Di più", "less": "Di meno", "older": "Più grande", "younger": "Più giovane", "qMon": "Più o meno Monumenti di {name}?", "qGt": "Più o meno grandi giri di {name}?", "qAge": "Più grande o più giovane di {name}?", "monN1": "1 Monumento", "gtN1": "1 grande giro", "monN": "{n} Monumenti", "gtN": "{n} grandi giri", "bornOn": "Nato il {date}", "best": "Serie migliore", "over": "Serie finita", "again": "Rigioca", "shareTxt": "Ho fatto una serie di {n} a Più o meno"},
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
