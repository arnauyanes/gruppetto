# Fonts i metodologia de dades

Última revisió: 2026-11-08 · Temporada a la base: **2027 (provisional)**

## Què carrega el joc
El joc llegeix quatre fitxers JSON de `data/`:

| Fitxer | Contingut | Com es genera |
|---|---|---|
| `riders.json` | Corredors: id, nom, país, equip, naixement, palmarès | Scripts (vegeu més avall) |
| `specialties.json` | Especialitat i confiança per id | A mà, amb revisió humana |
| `teams.json` | Equips WorldTour de la temporada | A mà |
| `countries.json` | Codi COI → continent | A mà |

`overrides.json` guarda correccions manuals que s'apliquen sobre les dades generades. `archive/` conserva les bases de temporades anteriors, perquè els ids antics no es perdin.

## Què compta cada camp
- **gtWins**: victòries finals a la classificació general del Tour, el Giro i la Vuelta. Les edicions sense guanyador (per exemple, el Tour 1999–2005) no compten per a ningú.
- **monuments**: victòries a Milà-Sanremo, Tour de Flandes, París-Roubaix, Lieja-Bastogne-Lieja i Il Lombardia, només en categoria elit masculina.
- **country**: nacionalitat esportiva (codi COI) que fa servir la llista d'equips de la Viquipèdia o, si no n'hi ha, Wikidata (P1532, i si no, P27).
- **born**: data de naixement de Wikidata (P569).

## Jerarquia de fonts
1. **UCI**: registre i categoria dels equips. La llista definitiva 2027 es publica el 8/12/2026. Fins llavors fem servir el [comunicat de la UCI sobre els documents presentats per al 2027](https://www.uci.org/pressrelease/womens-and-mens-professional-road-cycling-48-teams-have-submitted-essential-documents-with-a-view-to-registration-in-2027/1sWR2XrL5SoXmKsnWA4RZr): 16 dels 18 WorldTeams actuals hi figuren; Jayco AlUla i Picnic PostNL no. Els noms UCI 2027 de cada equip són a `teams.json` (`uci2027`).
2. **Webs i comunicats oficials dels equips**: plantilles, fitxatges, baixes i retirades. Cada comunicat trobat és a `data/{any}/official_sources_{any}.csv` (URL de la web de l'equip). Un corredor només és `confirmat` si un comunicat oficial el situa en aquest equip per a la temporada. Els dominis que es consideren oficials són a `OFFICIAL_DOMAINS` (`scripts/apply_moves.py`).
3. **Viquipèdia en anglès**: plantilles de la temporada ("List of {any} UCI WorldTeams and riders"). Les referències de cada corredor es guarden quan hi són.
4. **Wikidata**: naixement, nacionalitat i palmarès. Dades lliures (CC0).
5. **Premsa**: recopilacions de fitxatges, només com a font provisional:
   - [Cycling Weekly, All the pro cycling transfers for 2027](https://www.cyclingweekly.com/racing/all-the-pro-cycling-transfers-for-2027) (actualitzat el 21/10/2026)
   - [3bikes, 2026–2027 transfer window](https://www.3bikes.fr/en/2026/09/09/2026-2027-transfer-window-all-transfers-in-the-worldtour-and-proteam/) (09/09/2026)
   - [ProCyclingUK, Men's cycling transfers hub](https://procyclinguk.com/mens-cycling-transfers-hub/) (notícies fins al 06/11/2026; també retirades i renovacions)

**No es fan servir ProCyclingStats ni FirstCycling.** Les condicions de ProCyclingStats prohibeixen l'accés automatitzat i reutilitzar-ne el contingut en altres webs.

## Estats de confirmació
| Estat | Significat |
|---|---|
| `confirmat` | Comunicat oficial de l'equip (fitxatge, ascens, renovació o plantilla completa) que situa el corredor en aquest equip per a la temporada. |
| `provisional` | Anunciat per una o més fonts de premsa, o corredor de la plantilla 2026 sense cap baixa coneguda. |
| `rumor` | La premsa el presenta com a possible, no com a fet. No s'aplica a la base. |
| `pendent` | La font té dades incompletes o no s'ha pogut identificar el corredor. No s'aplica a la base. |

`num_fonts` indica quantes de les tres recopilacions de premsa recullen el moviment.

## Procés
1. `scripts/build_data.py` (manual): llegeix la llista de la Viquipèdia i el palmarès de Wikidata, i escriu `riders.json`. Serveix per començar una temporada quan la llista existeix.
2. `data/{any}/moves_input_{any}.csv` (a mà): fitxatges, baixes, retirades i renovacions, amb les fonts.
3. `scripts/apply_moves.py`: aplica els moviments a la base de la temporada anterior (arxivada) i genera `roster_changes`, `riders_{any}_sources.csv` i `incidencies`. Les altes només entren si a Wikidata hi ha exactament un ciclista amb aquest nom, amb data de naixement i nacionalitat.
4. `scripts/palmares.py`: calcula `gtWins` i `monuments` a partir de `winners.json` i escriu `data/{any}/palmares_{any}.md`. No hi ha ajustos manuals de palmarès.
5. `scripts/specialty_wiki.py`: busca el camp *ridertype* de la Viquipèdia anglesa per a cada corredor i escriu `specialty_evidence_{any}.csv`.
6. `scripts/specialty_review.py`: genera la taula de revisió d'especialitats.
7. `scripts/validate_data.py`: comprova la integritat. S'executa a cada PR.
8. `scripts/roster_2027.py`: compara la base amb la pàgina de la Viquipèdia de la temporada nova quan existeixi. S'executa cada dilluns (workflow *Revisió setmanal de dades*) i obre una PR, però mai modifica `main`.

## Especialitats
La confiança `sure` (alta) l'assigna una persona i és l'única que permet que un corredor sigui el corredor del dia. Les desconegudes queden pendents (`spec: null`) i el joc les mostra com a "?". No s'assignen com a gregari.

Per a les pendents, `scripts/specialty_wiki.py` llegeix el camp *ridertype* de la fitxa de la Viquipèdia anglesa. Només n'assigna una si el camp en porta exactament una de les set del joc, i sempre amb confiança `probable` i la URL de la font (`source`, `evidence`). Si el camp no hi és o en porta més d'una, queda pendent. Les especialitats ja assignades no es toquen: les discrepàncies queden a `specialty_evidence_{any}.csv`. Les assignacions es revisen a la Pull Request abans d'arribar a `main`.

Les especialitats `probable` anteriors a l'auditoria (novembre de 2026) no tenen font externa: es van proposar amb coneixement previ i consten així a `specialty_review_{any}.csv`.

## Base històrica (Campions i Llegendes)
`scripts/build_legends.py` (s'executa a GitHub en branques `data/**`) genera:
- `winners.json`: guanyador de cada edició de les grans voltes (general), els cinc monuments i els Mundials en ruta i contrarellotge (aquest des del 1994). Font: Wikidata, contrastada amb la taula de guanyadors de la Viquipèdia quan Wikidata té poques edicions.
- `legends.json`: corredors amb almenys una gran volta, un monument, un Mundial, un mallot final (punts, muntanya o jove) o 3 etapes de gran volta. Es poden afegir corredors a mà a `legends_extra.json`.
- Les edicions sense guanyador (per exemple, el Tour 1999–2005) no compten.
- Limitació: el recompte d'etapes i de mallots de Wikidata és incomplet per a alguns corredors (per exemple, Contador). Els codis de país antics es normalitzen (SPA→ESP) i hi ha països històrics (URSS, RDA, RFA, Txecoslovàquia, Iugoslàvia).

## Limitacions
- 98 dels 146 moviments aplicats tenen un comunicat oficial (auditoria del 10/11/2026). La resta només tenen fonts de premsa i queden `provisional`; la llista és a `data/2027/auditoria_2027.md`.
- Els corredors que continuen al mateix equip només són `confirmat` si l'equip ha publicat la plantilla 2027 completa (de moment, només Jayco AlUla, 4/11/2026). La resta ho són perquè no se'n coneix cap baixa, no perquè s'hagi confirmat el contracte.
- Les recopilacions de fitxatges no recullen bé les retirades: l'auditoria en va trobar 13 que encara eren a la base. Pot haver-n'hi més fins que els equips publiquin les plantilles.
- Diversos equips tenen més de 30 corredors, o menys de 27. Això indica baixes o altes que encara no surten a les fonts (vegeu `data/2027/incidencies_2027.csv`).
- Les especialitats `probable` sense `source` són orientatives i no s'han contrastat amb cap font.
