# Auditoria de dades 2027

Data: 10/11/2026 · Branca: `data/auditoria-2027`

Criteri: una dada només es dona per confirmada si hi ha una font oficial (web o comunicat de l'equip, de la UCI o del corredor). Les fonts de premsa serveixen per a l'estat `provisional`. Tot el que no s'ha pogut confirmar queda documentat aquí.

## 1. Palmarès: grans voltes i monuments

**Incidència del Tour de Flandes.** `data/report.md` deia «Tour of Flanders: 0 edicions». Era l'informe de `build_data.py` de la temporada 2026: aquell script buscava edicions anomenades «Tour of Flanders», però a Wikidata es diuen «… Tour of Flanders (men's race)». Per compensar-ho es van afegir a mà 8 monuments (`extraMonuments` a `overrides.json`: Pogačar 3, Van der Poel 3, Asgreen 1, Bettiol 1).

**Què s'ha fet:**
- El palmarès es calcula ara amb `scripts/palmares.py` a partir de `data/winners.json`, que té 110 edicions de Flandes (1913–2026) i ja es va contrastar amb la Viquipèdia.
- S'han eliminat els ajustos manuals, i `build_data.py` ja no en suma. Així no es poden comptar dues vegades si algú torna a executar el script.
- L'informe antic s'ha arxivat a `data/archive/report_2026.md`, amb una nota que n'explica l'error.

**Comprovació:** els valors de `riders.json` coincideixen amb `winners.json` per als 546 corredors (0 diferències). 24 corredors 2027 tenen alguna victòria; el detall és a `data/2027/palmares_2027.md`.
- `gtWins` només compta la classificació general final (qualificador de Wikidata «overall winner general classification»). Les etapes i els mallots no compten.
- `monuments` compta exactament Milà-Sanremo, Flandes, Roubaix, Lieja i Llombardia, en categoria masculina elit.
- Resultats de 2026 contrastats amb premsa del dia: Milà-Sanremo, Flandes i Lieja (Pogačar), Roubaix (Van Aert), Giro (Vingegaard), Tour (Pogačar), Vuelta (Mas) i Llombardia (Seixas).
- Les noves altes reben el palmarès amb el mateix càlcul.

## 2. Equips: noms i registre UCI 2027

Font: [comunicat de la UCI](https://www.uci.org/pressrelease/womens-and-mens-professional-road-cycling-48-teams-have-submitted-essential-documents-with-a-view-to-registration-in-2027/1sWR2XrL5SoXmKsnWA4RZr) (documents presentats el 15/10/2026). El registre definitiu es publica el 8/12/2026.

| Equip a la base | Nom UCI 2027 | Situació |
|---|---|---|
| Alpecin–Premier Tech | Alpecin-Premier Tech | Documents presentats |
| Team Bahrain Victorious | Bahrain Victorious | Documents presentats |
| Decathlon CMA CGM | Decathlon CMA CGM Team | Documents presentats |
| EF Education–EasyPost | EF Education - EasyPost | Documents presentats |
| Groupama–FDJ United | Groupama-FDJ United | Documents presentats |
| Lidl–Trek | Lidl-Trek | Documents presentats |
| Lotto–Intermarché | Lotto Intermarché | Documents presentats |
| Movistar Team | Movistar Team | Documents presentats |
| Netcompany INEOS | Netcompany Ineos | Documents presentats |
| NSN Cycling Team | NSN Cycling Team | Documents presentats |
| Red Bull–Bora–Hansgrohe | Red Bull - Bora - Hansgrohe | Documents presentats |
| Soudal–Quick-Step | Soudal - Safety Jogger | Documents presentats. Canvi de nom [confirmat per l'equip](https://soudal-quickstepteam.com/en/news/a-new-era-of-the-team-soudal-safety-jogger-announced-for-2027) (13/7/2026) |
| UAE Team Emirates XRG | UAE Team Emirates XRG | Documents presentats |
| Uno-X Mobility | Uno-X Mobility | Documents presentats |
| XDS Astana Team | XDS Astana Team | Documents presentats |
| Visma–Lease a Bike | Yellow B. Cycling | Documents presentats amb aquest nom |
| Team Jayco–AlUla | — | **Pendent.** No hi figura. L'equip ho atribueix a una transferència bancària de la garantia ([Cyclingnews, 20/10/2026](https://www.cyclingnews.com/pro-cycling/teams-riders/picnic-postnl-finalising-new-bike-supplier-amid-lapierre-woes-jayco-alula-hit-by-bank-transfer-issue-as-both-teams-explain-missed-deadline-for-2027-worldtour-registration/)). Ha publicat la plantilla 2027 el 4/11/2026. |
| Team Picnic–PostNL | — | **Pendent.** No hi figura. L'equip diu que li falta tancar el proveïdor de bicicletes (mateixa font). Hi ha informacions que podria baixar a ProTeam ([CyclingUpToDate, 7/10/2026](https://cyclinguptodate.com/cycling/worldtour-exit-by-choice-struggling-picnic-postnl-considers-dropping-to-proteam-ranks-for-2027)), sense cap decisió anunciada. |

Fins al 10/11/2026 no s'ha trobat cap comunicat posterior de la UCI. El joc continua mostrant els noms de 2026 fins al registre definitiu; els noms UCI són a `teams.json` (`uci2027`).

## 3. Corredors i equips

### Comunicats oficials
S'han buscat els comunicats a les webs dels equips. Les 93 fonts trobades són a `data/2027/official_sources_2027.csv`:
- 79 fitxatges, ascensos o renovacions individuals.
- La plantilla 2027 completa de Jayco AlUla ([4/11/2026](https://greenedgecycling.com/2026/team-jayco-alula-confirms-refreshed-roster-for-2027-that-includes-matthews-welsford-plapp-and-more/)), que confirma els seus 30 corredors. És l'únic equip que l'ha publicada.

Dels 146 moviments aplicats, **98 tenen font oficial** i 48 només de premsa:

| Tipus | Amb font oficial | Només premsa |
|---|---|---|
| Canvi entre WorldTeams | 42 | 8 |
| Alta | 29 | 21 |
| Baixa | 7 | 13 |
| Retirada | 8 | 8 |
| Renovació | 4 | 6 |

Només premsa (queden `provisional`):
- **Canvis:** García Cortina, Van Uden i Mihkels (Alpecin), Steinhauser (Red Bull), Molano i Vansevenant (Lotto), Bagioli i Langellotti (Astana).
- **Altes:** Van Hemelen i Van den Eijnden (Alpecin), Juan Felipe Rodríguez (EF), Crescioli, Jeannière, Delettre, Lonardi, Daumas, Loulergue i Dujardin (Groupama), Donie, Eeman, Vaneeckhoutte i Dolven (Lotto), Scalco, Turgis, Breuillard, Dati i Berrade (Astana), Verbrugghe (NSN), Putz (Red Bull).
- **Baixes:** Ciccone, Hayter, August, Bittner, Schmid i Ballerini (Pinarello-Q36.5), De Lie (Tudor), Landa (Euskaltel), Krijnsen, Rutsch, Kajamini, Higuita i Hajek.
- **Retirades:** Boivin, Mosca, De Buyst, Hvideberg, Jungels, Lutsenko, Swift i Clarke.
- **Renovacions:** Vine, Toneatti, Fedorov, Gudmestad, Bissegger i Scotson.
- **Rumor no aplicat:** renovació de Carlos Rodríguez amb Netcompany INEOS (només Marca).

### Errors trobats i corregits
- **13 retirats encara eren a la base 2027:** Pello Bilbao, Damiano Caruso, Magnus Cort, Jonas Iversby Hvideberg, Bob Jungels, Steven Kruijswijk, Alexey Lutsenko, Luka Mezgec, Bauke Mollema, Nairo Quintana, Ben Swift, Max Walscheid i Simon Clarke (retirat l'1/2/2026). Font general: [CyclingUpToDate, 15/10/2026](https://cyclinguptodate.com/cycling/yates-quintana-alaphilippe-the-25-riders-that-have-confirmed-their-retirement-in-2026). 8 tenen a més un comunicat de l'equip (Bilbao, Caruso, Cort, Kruijswijk, Mezgec, Mollema, Quintana i Walscheid).
- **4 corredors que no surten a la plantilla oficial de Jayco:** Asbjørn Hellemose, Jasha Sütterlin, Koen Bouwman i Rudy Porter. Surten de la base 2027 com a baixa. No se'n coneix el destí: si fitxen per un altre WorldTeam, caldrà afegir-los.
- **5 moviments pendents resolts amb el nom del comunicat oficial:** «Olivier Belddyn» és Oliver Bleddyn (Jayco); «Nørtøft» i «Lambrecht» són Morten Nørtøft i Michiel Lambrecht (Alpecin); Mads Landbo (Movistar). Sebastian Putz (Red Bull) passa a alta, amb font de premsa.
- El workflow *Aplica moviments de plantilla* ha aplicat els moviments en aquesta branca: la base passa de 546 a **534 corredors**. 92 són `confirmat` i 442 `provisional` (`riders_2027_sources.csv`).
- **Alta no aplicada:** Benjamín Noval (Netcompany INEOS). El fitxatge és oficial, però Wikidata té dos ciclistes amb aquest nom i el sistema no els distingeix. Queda a `incidencies_2027.csv` fins que s'identifiqui el `qid` correcte.
- Plantilles de mida poc habitual després dels canvis: Alpecin 35, Groupama 34, Lotto 32, Uno-X 32 i Astana 31, i EF 26 i Picnic 25. Probablement hi falten baixes o altes que encara no s'han anunciat.

### Corredors que continuen
Els corredors sense cap moviment continuen a l'equip de 2026 i són `provisional` («plantilla 2026 sense baixa coneguda»). Només els de Jayco són `confirmat`, per la plantilla oficial. Per confirmar la resta individualment cal que cada equip publiqui la plantilla 2027. Normalment ho fan entre desembre i gener, i la revisió setmanal ho tornarà a comprovar.

## 4. Estadístiques de les altes i dels fitxatges
- Els fitxatges entre WorldTeams mantenen l'`id`, la data de naixement, la nacionalitat i el `qid` de la base 2026. Només canvia l'equip.
- Les altes prenen la data de naixement i la nacionalitat de Wikidata, i només entren si n'hi ha exactament un candidat amb les dues dades.
- El palmarès de tots, altes incloses, surt de `palmares.py`. Cap alta té victòries en grans voltes o monuments.
- El validador comprova que no hi hagi `id` ni `qid` duplicats, que les dates i els països siguin vàlids i que el palmarès siguin enters.

## 5. Especialitats pendents
Abans de l'auditoria n'hi havia 163 de pendents: 139 amb `spec: null` i 24 altes sense entrada. Cap s'ha assignat a mà.

`scripts/specialty_wiki.py` llegeix el camp *ridertype* de la fitxa de la Viquipèdia anglesa de cada corredor i:
- n'assigna una només si el camp porta exactament una de les set categories del joc. Ho fa amb confiança `probable`, i amb la URL i el text de la font;
- deixa la resta pendents i n'anota el motiu: sense article, sense camp, camp ambigu, o un terme que no és cap categoria (per exemple, *all-rounder* o *rouleur*);
- no canvia les especialitats que ja hi eren. Si la Viquipèdia en diu una altra, ho anota com a discrepància a `specialty_evidence_2027.csv`.

**Resultat (534 corredors):**
- 33 especialitats assignades amb font: 16 escaladors, 9 especialistes en contrarellotge, 4 esprintadors, 2 puncheurs i 2 especialistes en clàssiques. La llista és a `specialty_evidence_2027.csv`, filtrant per `accio = assignada`.
- **132 continuen pendents:** 113 tenen article però sense el camp, 15 no tenen article a la Viquipèdia anglesa, 2 tenen un terme que no és cap categoria i 2 són ambigus. No s'hi ha posat cap especialitat.
- 43 discrepàncies amb especialitats existents, que no s'han canviat. Moltes són de criteri: la Viquipèdia diu *Climber* d'un líder que el joc classifica com a `gv` (Mas, Almeida, Yates, Vlasov), o diu *Climber* d'un gregari muntanyer. Les que convé revisar a mà: Simon Dehairs (joc: gregari / Viquipèdia: esprintador), Clément Venturini (clàssiques / esprintador), Søren Wærenskjold (esprintador / contrarellotge), Stian Fredheim (esprintador / clàssiques), Jake Stewart (esprintador / clàssiques) i Edward Theuns (gregari / clàssiques).
- Les especialitats `probable` anteriors a l'auditoria no tenen font externa i consten així a `specialty_review_2027.csv`. Cap especialitat nova és `sure`, així que cap corredor nou pot ser corredor del dia. Els candidats passen de 126 a 121, per les retirades.

## Dubtes oberts
1. Registre definitiu de Jayco AlUla i Picnic PostNL (8/12/2026). Si algun no obté llicència WorldTour, cal treure'l del joc.
2. El destí de Hellemose, Sütterlin, Bouwman i Porter.
3. Les plantilles de la resta d'equips: encara poden aparèixer retirades i baixes que no surten a les recopilacions.
4. Els 48 moviments que només tenen font de premsa.
5. La renovació de Carlos Rodríguez.
