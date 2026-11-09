# Gruppetto

Jocs diaris per a aficionats al ciclisme. Versió de proves.

## Jocs
- **Qui és?** (`qui-es/`): endevina el corredor del dia a partir del país, l'equip, l'edat, l'especialitat, les grans voltes i els monuments guanyats.
- **Grups** (`grups/`): agrupa 16 corredors en 4 grups de 4. El repte diari es genera amb `assets/js/grups-gen.js` i cada corredor encaixa en un sol grup.
- **Contrarellotge** (`contrarellotge/`): 2 minuts per dir tots els corredors d'un equip o d'un país.
- **Més o menys** (`mes-o-menys/`): ratxa infinita comparant edat, monuments i grans voltes.

## Estructura
```
index.html            Portada de la plataforma
qui-es/index.html     Joc "Qui és?"
assets/css/style.css  Estils (paleta blau nit + rosa)
assets/js/i18n.js     Textos en català, castellà, anglès, francès i italià
assets/js/stats.js    Estadístiques i partida del dia (al navegador)
assets/js/qui-es.js   Lògica del joc
data/teams.json       Equips WorldTour de la temporada
data/countries.json   Codi i continent de cada país
data/riders.json      Corredors (ara mateix, dades de mostra)
```

## Format d'un corredor (`data/riders.json`)
| Camp | Exemple | Notes |
|---|---|---|
| `id` | `enric-mas` | Únic |
| `name` | `Enric Mas` | |
| `country` | `ESP` | Codi COI de 3 lletres (vegeu `countries.json`) |
| `team` | `movistar` | `id` de `teams.json` |
| `born` | `1995-01-07` o `1995` | |
| `spec` | `gv` | `gv`, `climber`, `puncheur`, `classics`, `sprinter`, `tt`, `domestique`, o `null` si està pendent (a `specialties.json`) |
| `specConfidence` | `sure` | `sure`, `probable` o `unknown`. Només els `sure` poden ser el corredor del dia |
| `gtWins` | `0` | Grans voltes guanyades |
| `monuments` | `0` | Monuments guanyats |

## Dades
La base de dades, les fonts i el procés d'actualització estan explicats a [DATA_SOURCES.md](DATA_SOURCES.md). Abans de fusionar canvis de dades, executa:
```
python3 scripts/validate_data.py
```

## Provar-ho en local
Cal un servidor (els mòduls JS no funcionen obrint el fitxer directament):
```
python3 -m http.server 8000
```
i obrir http://localhost:8000
