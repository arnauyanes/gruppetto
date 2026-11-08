# Canvis de dades · temporada 2027

## 2026-11-08 · Base provisional 2027

**Corredors:** 521 (2026) → 546 (2027), als mateixos 18 WorldTeams.

### Plantilles
- 50 canvis d'equip entre WorldTeams (p. ex. Ganna a Lidl-Trek, Carapaz i Asgreen a NSN, Gall i Mühlberger a Lidl-Trek, Jakobsen a Visma).
- 44 altes de fora dels WorldTeams (filials, ProTeams i equips continentals).
- 16 baixes cap a ProTeams (p. ex. Landa a Euskaltel-Euskadi, Ciccone i Hayter a Pinarello-Q36.5, De Lie i Groves a Tudor).
- 3 retirades: Guillaume Boivin, Jacopo Mosca i Jasper De Buyst.
- 10 renovacions anunciades (Vine, Bissegger, Gudmestad, entre d'altres).
- 7 moviments pendents o rumors, no aplicats. A més, 13 avisos d'equip: el registre UCI pendent de Jayco AlUla i Picnic PostNL, i 11 plantilles amb una mida poc habitual. Tot és a `data/2027/incidencies_2027.csv`.
- Tots els moviments són **provisionals**: venen de premsa i no s'han contrastat encara amb els comunicats oficials.

### Especialitats
- Les 139 especialitats desconegudes passen de "gregari" a **pendent**. El joc les mostra com a "?".
- Especialitat proposada per a 16 de les altes noves. Les altres 28 queden pendents.
- Corredors que poden ser el corredor del dia (confiança alta): 136 → 126, perquè alguns han sortit dels WorldTeams.

### Fitxers nous
- `data/archive/riders_2026.json`: base 2026 sencera, perquè els ids antics no es perdin.
- `data/2027/moves_input_2027.csv`, `roster_changes_2027.csv`, `riders_2027_sources.csv`, `incidencies_2027.csv` i `specialty_review_2027.csv`.
- `scripts/apply_moves.py`, `scripts/validate_data.py`, `scripts/specialty_review.py` i `scripts/roster_2027.py`.

### Processos automàtics
- Eliminat el workflow que escrivia directament a `main`.
- Nou: validació de dades a cada PR i revisió setmanal (dilluns) que obre una PR.

### Joc
- Únic canvi de codi: les especialitats pendents es mostren com a "?" i no compten com a coincidència.
