#!/usr/bin/env python3
"""Genera data/{season}/specialty_review_{season}.csv a partir de riders.json i specialties.json."""
import csv, datetime, json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
SHORT = {"gv": "GV", "climber": "Esc", "puncheur": "Pun", "classics": "Clà", "sprinter": "Esp", "tt": "Cro", "domestique": "Gre"}
CONF = {"sure": "alta", "probable": "mitjana", "unknown": "pendent"}
WHY = {
    "alta": "Líder o especialista consolidat; perfil conegut per resultats de diverses temporades.",
    "mitjana": "Proposta a partir del perfil conegut fins a juny de 2026; cal contrastar-la amb resultats recents.",
    "pendent": "No hi ha prou informació per triar-ne una; pendent de revisió humana.",
}
SOURCE = "Coneixement previ de Claude (fins a juny de 2026), sense font externa per corredor"

doc = json.loads((DATA / "riders.json").read_text(encoding="utf-8"))
specs = json.loads((DATA / "specialties.json").read_text(encoding="utf-8"))["riders"]
season = doc["season"]
today = datetime.date.today().isoformat()
rows = []
for r in doc["riders"]:
    s = specs.get(r["id"], {})
    conf = CONF[s.get("confidence", "unknown")] if s.get("spec") else "pendent"
    rows.append({"id": r["id"], "nom": r["name"], "equip": r["team"],
                 "especialitat_proposada": SHORT.get(s.get("spec"), ""), "especialitat_app": s.get("spec") or "",
                 "especialitat_confiança": conf,
                 "justificacio": (f"Viquipèdia anglesa, {s['evidence']}" if s.get("source") else
                                  WHY[conf] + (f" ({s['evidence']})" if conf == "pendent" and s.get("evidence") else "")),
                 "especialitat_font": s.get("source") or (SOURCE if conf != "pendent" else ""),
                 "especialitat_data_revisio": today, "cal_revisio_humana": "no" if conf == "alta" else "sí"})
out = DATA / str(season) / f"specialty_review_{season}.csv"
with open(out, "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0]))
    w.writeheader()
    w.writerows(rows)
print(out, len(rows))
