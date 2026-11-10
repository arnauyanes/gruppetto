#!/usr/bin/env python3
"""Calcula gtWins i monuments dels corredors actuals a partir de data/winners.json.

- gtWins: victòries de la classificació general del Tour, el Giro i la Vuelta.
- monuments: victòries a Milà-Sanremo, Tour de Flandes, París-Roubaix,
  Lieja-Bastogne-Lieja i Il Lombardia.
winners.json és l'única font: no s'hi sumen ajustos manuals.
Escriu data/riders.json i data/{season}/palmares_{season}.md amb el detall per corredor.
"""
import json
from collections import defaultdict
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
GT = {"tour", "giro", "vuelta"}
MON = {"msr", "rvv", "pr", "lbl", "lomb"}
NAMES = {"tour": "Tour", "giro": "Giro", "vuelta": "Vuelta", "msr": "Milà-Sanremo", "rvv": "Flandes",
         "pr": "Roubaix", "lbl": "Lieja", "lomb": "Llombardia"}


def main():
    doc = json.loads((DATA / "riders.json").read_text(encoding="utf-8"))
    win = json.loads((DATA / "winners.json").read_text(encoding="utf-8"))
    detail = defaultdict(list)
    for e in win["editions"]:
        if e["race"] in GT | MON:
            detail[e["winner"]].append(e)
    changed, lines = [], []
    for r in doc["riders"]:
        ed = detail.get(r["id"], [])
        gt = sum(1 for e in ed if e["race"] in GT)
        mon = sum(1 for e in ed if e["race"] in MON)
        if (gt, mon) != (r["gtWins"], r["monuments"]):
            changed.append(f"{r['name']}: GV {r['gtWins']}→{gt}, monuments {r['monuments']}→{mon}")
        r["gtWins"], r["monuments"] = gt, mon
        if ed:
            parts = ", ".join(f"{NAMES[e['race']]} {e['year']}" for e in sorted(ed, key=lambda e: (e["race"] not in GT, e["year"])))
            lines.append(f"| {r['name']} | {gt} | {mon} | {parts} |")
    (DATA / "riders.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    season = doc["season"]
    per_race = defaultdict(int)
    for e in win["editions"]:
        per_race[e["race"]] += 1
    out = [f"# Palmarès dels corredors {season}", "",
           "Calculat amb `scripts/palmares.py` a partir de `data/winners.json` (Wikidata, contrastat amb la Viquipèdia).",
           "`gtWins` només compta la classificació general final; `monuments` compta els cinc monuments masculins.", "",
           "## Edicions amb guanyador a la base", *[f"- {NAMES[k]}: {per_race[k]}" for k in ["tour", "giro", "vuelta", "msr", "rvv", "pr", "lbl", "lomb"]], "",
           f"## Corredors {season} amb victòries ({len(lines)})", "", "| Corredor | GV | Monuments | Victòries |", "|---|---|---|---|",
           *sorted(lines, key=lambda l: l.lower()), "", "## Canvis respecte a la versió anterior", *(changed or ["- Cap"])]
    (DATA / str(season) / f"palmares_{season}.md").write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"{len(lines)} corredors amb victòries; {len(changed)} canvis")


if __name__ == "__main__":
    main()
