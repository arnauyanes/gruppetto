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
1. **UCI**: registre i categoria dels equips. A 8/11/2026 la llista definitiva 2027 encara no s'ha publicat, i la situació de les sol·licituds la coneixem per [Cyclingnews, 19/10/2026](https://www.cyclingnews.com/pro-cycling/transfers/theres-still-hope-for-totalenergies-as-uci-announces-team-registrations-for-2027/).
2. **Webs i comunicats oficials dels equips**: plantilles, fitxatges i baixes. Encara no s'han contrastat corredor per corredor (vegeu *Limitacions*).
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
| `confirmat` | Comunicat oficial de l'equip o registre UCI definitiu. Encara no n'hi ha cap. |
| `provisional` | Anunciat per una o més fonts de premsa, o corredor de la plantilla 2026 sense cap baixa coneguda. |
| `rumor` | La premsa el presenta com a possible, no com a fet. No s'aplica a la base. |
| `pendent` | La font té dades incompletes o no s'ha pogut identificar el corredor. No s'aplica a la base. |

`num_fonts` indica quantes de les tres recopilacions de premsa recullen el moviment.

## Procés
1. `scripts/build_data.py` (manual): llegeix la llista de la Viquipèdia i el palmarès de Wikidata, i escriu `riders.json`. Serveix per començar una temporada quan la llista existeix.
2. `data/{any}/moves_input_{any}.csv` (a mà): fitxatges, baixes, retirades i renovacions, amb les fonts.
3. `scripts/apply_moves.py`: aplica els moviments a la base de la temporada anterior (arxivada) i genera `roster_changes`, `riders_{any}_sources.csv` i `incidencies`. Les altes només entren si a Wikidata hi ha exactament un ciclista amb aquest nom, amb data de naixement i nacionalitat.
4. `scripts/specialty_review.py`: genera la taula de revisió d'especialitats.
5. `scripts/validate_data.py`: comprova la integritat. S'executa a cada PR.
6. `scripts/roster_2027.py`: compara la base amb la pàgina de la Viquipèdia de la temporada nova quan existeixi. S'executa cada dilluns (workflow *Revisió setmanal de dades*) i obre una PR, però mai modifica `main`.

## Especialitats
Les assigna una persona, mai un procés automàtic. La confiança `sure` (alta) és l'única que permet que un corredor sigui el corredor del dia. Les desconegudes queden pendents (`spec: null`) i el joc les mostra com a "?". No s'assignen com a gregari.

## Limitacions
- Els moviments venen de recopilacions de premsa, no de comunicats oficials. Cal contrastar-los amb les webs dels equips abans de passar-los a `confirmat`.
- Els corredors que continuen al mateix equip ho fan perquè no se'n coneix cap baixa, no perquè s'hagi confirmat el contracte 2027.
- Onze equips tenen més de 30 corredors, o menys de 27, a la base 2027. Això indica baixes o altes que encara no surten a les fonts (vegeu `data/2027/incidencies_2027.csv`).
- Les especialitats `probable` i les justificacions són orientatives i no s'han contrastat corredor per corredor amb resultats.
