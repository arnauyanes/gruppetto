#!/usr/bin/env python3
"""Valida les dades que carrega el joc. Surt amb codi 1 si hi ha errors.

Comprova: ids únics, un sol equip vàlid per corredor, país i data vàlids,
palmarès coherent, especialitats vàlides (una o cap per corredor) i
referències entre fitxers.
"""
import csv, datetime, json, sys
from collections import Counter
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
SPECS = {"gv", "climber", "puncheur", "classics", "sprinter", "tt", "domestique"}
CONFS = {"sure", "probable", "unknown"}
errors, warnings = [], []


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def main():
    global errors, warnings
    riders_doc = load("riders.json")
    teams = {t["id"] for t in load("teams.json")["teams"]}
    countries = load("countries.json")
    specs = load("specialties.json")["riders"]
    overrides = load("overrides.json")
    season = int(riders_doc.get("season", 0))
    riders = riders_doc["riders"]
    archived = set()
    for f in (DATA / "archive").glob("riders_*.json") if (DATA / "archive").exists() else []:
        archived |= {r["id"] for r in json.loads(f.read_text(encoding="utf-8"))["riders"]}

    if not 2020 <= season <= 2100:
        errors.append(f"riders.json: temporada no vàlida ({season})")

    ids = Counter(r.get("id") for r in riders)
    errors += [f"id duplicat: {i} ({n} vegades)" for i, n in ids.items() if n > 1]
    qids = Counter(r.get("qid") for r in riders if r.get("qid"))
    errors += [f"qid de Wikidata duplicat: {q}" for q, n in qids.items() if n > 1]
    people = Counter((r.get("name"), r.get("born")) for r in riders)
    errors += [f"corredor repetit: {n} ({b})" for (n, b), c in people.items() if c > 1]

    for r in riders:
        rid = r.get("id") or "?"
        for field in ("id", "name", "team", "country", "born"):
            if not r.get(field):
                errors.append(f"{rid}: falta el camp '{field}'")
        if r.get("team") and r["team"] not in teams:
            errors.append(f"{rid}: equip desconegut '{r['team']}'")
        if r.get("country") and r["country"] not in countries:
            errors.append(f"{rid}: país sense continent a countries.json '{r['country']}'")
        born = r.get("born") or ""
        try:
            d = datetime.date.fromisoformat(born) if len(born) == 10 else datetime.date(int(born), 7, 1)
            age = season - d.year
            if not 16 <= age <= 45:
                errors.append(f"{rid}: edat impossible per a {season} ({age} anys, {born})")
        except ValueError:
            errors.append(f"{rid}: data de naixement no vàlida '{born}'")
        for field in ("gtWins", "monuments"):
            v = r.get(field)
            if not isinstance(v, int) or v < 0 or v > 20:
                errors.append(f"{rid}: valor no vàlid a '{field}': {v!r}")

    rider_ids = set(ids)
    for k, v in specs.items():
        if k not in rider_ids and k not in archived:
            errors.append(f"specialties.json: '{k}' no correspon a cap corredor (ni arxivat)")
        if v.get("spec") is not None and v["spec"] not in SPECS:
            errors.append(f"specialties.json: '{k}' té una especialitat no vàlida '{v['spec']}'")
        if v.get("confidence") not in CONFS:
            errors.append(f"specialties.json: '{k}' té una confiança no vàlida '{v.get('confidence')}'")
        if v.get("confidence") == "sure" and not v.get("spec"):
            errors.append(f"specialties.json: '{k}' és 'sure' però no té especialitat")
    missing_spec = [i for i in rider_ids if i not in specs or not specs[i].get("spec")]
    if missing_spec:
        warnings.append(f"{len(missing_spec)} corredors amb l'especialitat pendent")
    pool = [i for i in rider_ids if specs.get(i, {}).get("confidence") == "sure" and specs[i].get("spec")]
    if len(pool) < 30:
        errors.append(f"Només {len(pool)} corredors poden ser el corredor del dia (mínim 30)")

    for section in ("riders", "extraMonuments", "extraGrandTours"):
        for k in overrides.get(section, {}):
            if k not in rider_ids and k not in archived:
                warnings.append(f"overrides.json/{section}: '{k}' no correspon a cap corredor")

    for path in DATA.glob("*/moves_input_*.csv"):
        with open(path, encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                if row["id"] and row["id"] not in rider_ids | archived:
                    errors.append(f"{path.name}: id desconegut '{row['id']}'")

    sizes = Counter(r["team"] for r in riders)
    print(f"Temporada {season}: {len(riders)} corredors, {len(sizes)} equips, {len(pool)} candidats a corredor del dia")
    for w in warnings:
        print(f"AVÍS: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    if errors:
        sys.exit(1)
    print("Dades correctes")


if __name__ == "__main__":
    main()
