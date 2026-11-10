#!/usr/bin/env python3
"""Aplica els moviments de data/{season}/moves_input_{season}.csv a la base de dades.

- Arxiva la base anterior a data/archive/riders_{season-1}.json (si no hi és).
- canvi: canvia l'equip. baixa/retirada: treu el corredor dels WorldTeams (queda a l'arxiu).
- alta: busca el corredor a Wikidata; només l'afegeix si hi ha exactament un ciclista
  amb aquest nom i té data de naixement i nacionalitat. Si no, queda pendent.
- renovacio: el corredor continua (estat provisional, amb font).
- rumor/pendent: no s'aplica; va a incidències.

Escriu:
  data/riders.json                               base que fa servir el joc
  data/{season}/roster_changes_{season}.csv      altes, baixes, canvis i renovacions
  data/{season}/riders_{season}_sources.csv      traçabilitat de cada corredor de la base
  data/{season}/incidencies_{season}.csv         el que no s'ha pogut aplicar
"""
import argparse, csv, datetime, json, shutil, time
from collections import Counter

import build_data as b

ROSTER_2026_URL = "https://en.wikipedia.org/wiki/List_of_2026_UCI_WorldTeams_and_riders"
UCI_2027_URL = ("https://www.cyclingnews.com/pro-cycling/transfers/"
                "theres-still-hope-for-totalenergies-as-uci-announces-team-registrations-for-2027/")
REGISTRATION_PENDING = {"jayco": "Registre UCI 2027 pendent (documents no presentats el 15/10/2026)",
                        "picnic": "Registre UCI 2027 pendent (documents no presentats el 15/10/2026)"}


# Webs oficials dels equips (comunicats propis). Una font d'aquests dominis compta com a oficial.
OFFICIAL_DOMAINS = ("uci.org", "alpecin-premiertech.com", "bahraincyclingteam.com", "decathloncmacgmteam.com",
                    "efprocycling.com", "equipecycliste-groupama-fdj.fr", "racing.trekbikes.com",
                    "lotto-intermarche.be", "movistarteam.com", "netcompanyineos.com", "ineosgrenadiers.com",
                    "nsncyclingteam.com", "redbullborahansgrohe.com", "soudal-quickstepteam.com",
                    "greenedgecycling.com", "teamvismaleaseabike.com", "uaeteamemirates.com", "unoxteam.com",
                    "tudorprocycling.com", "equipecofidis.com")


def source_type(url):
    if "uci.org" in url:
        return "uci"
    if any(d in url for d in OFFICIAL_DOMAINS):
        return "oficial"
    if "wikipedia.org" in url:
        return "enciclopedia"
    return "premsa" if url else "pendent"


def find_cyclist(name):
    """Retorna (qid, motiu) si hi ha exactament un ciclista amb aquest nom a Wikidata."""
    cands = set()
    ids = b.wikidata_ids([name, f"{name} (cyclist)"])
    cands.update(ids.values())
    j = b.get("https://www.wikidata.org/w/api.php", {"action": "wbsearchentities", "search": name, "language": "en",
                                                      "type": "item", "limit": 10, "format": "json"}).json()
    cands.update(x["id"] for x in j.get("search", []))
    if not cands:
        return None, "cap resultat a Wikidata"
    values = " ".join(f"wd:{q}" for q in cands)
    rows = b.sparql(f"""
SELECT DISTINCT ?item WHERE {{
  VALUES ?item {{ {values} }}
  ?item wdt:P31 wd:Q5 ; wdt:P106 ?occ .
  ?occ rdfs:label ?l FILTER(LANG(?l) = "en" && CONTAINS(LCASE(?l), "cyclist"))
}}""")
    found = {b.qid_of(r["item"]["value"]) for r in rows}
    time.sleep(0.5)
    if len(found) == 1:
        return found.pop(), ""
    return None, "cap ciclista amb aquest nom" if not found else f"{len(found)} ciclistes amb aquest nom"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", default="2027")
    args = ap.parse_args()
    season, prev_season = args.season, str(int(args.season) - 1)
    today = datetime.date.today().isoformat()
    out_dir = b.DATA / season
    arch = b.DATA / "archive" / f"riders_{prev_season}.json"
    arch.parent.mkdir(exist_ok=True)

    current = json.loads((b.DATA / "riders.json").read_text())
    if str(current.get("season")) == prev_season and not arch.exists():
        shutil.copy(b.DATA / "riders.json", arch)
    base = json.loads(arch.read_text())
    riders = {r["id"]: dict(r) for r in base["riders"]}

    with open(out_dir / f"moves_input_{season}.csv", encoding="utf-8") as fh:
        moves = list(csv.DictReader(fh))

    official = {}
    off_path = out_dir / f"official_sources_{season}.csv"
    if off_path.exists():
        with open(off_path, encoding="utf-8") as fh:
            official = {r["id"]: r for r in csv.DictReader(fh)}

    changes, incidents, touched = [], [], {}
    altes = [m for m in moves if m["tipus"] == "alta"]
    log = []

    for m in moves:
        urls = m["fonts"].split()
        src = urls[0] if urls else ""
        row = {"id": m["id"], "nom": m["nom"], "moviment": m["tipus"], "equip_2026": m["equip_2026"],
               "equip_2027": m["equip_2027"], "font_url": src, "altres_fonts": " ".join(urls[1:]),
               "font_tipus": source_type(src), "num_fonts": m["num_fonts"], "data_verificacio": today,
               "estat_confirmacio": "provisional", "nota": m["nota"]}
        t = m["tipus"]
        if t in ("rumor", "pendent"):
            row["estat_confirmacio"] = "rumor" if t == "rumor" else "pendent"
            incidents.append({**row, "motiu": "Rumor sense confirmar" if t == "rumor" else "Dades de la font incompletes"})
            continue
        if t == "canvi":
            riders[m["id"]]["team"] = m["equip_2027"]
            touched[m["id"]] = row
        elif t in ("baixa", "retirada"):
            riders.pop(m["id"], None)
        elif t == "renovacio":
            touched[m["id"]] = row
        elif t == "alta":
            qid, why = find_cyclist(m["nom"])
            if not qid:
                row["estat_confirmacio"] = "pendent"
                incidents.append({**row, "motiu": f"Alta sense dades verificables: {why}"})
                log.append(f"alta pendent: {m['nom']} ({why})")
                continue
            row["qid"] = qid
            m["qid"] = qid
        changes.append(row)

    # Dades de les altes trobades
    found = [m for m in altes if m.get("qid")]
    facts = b.rider_facts([m["qid"] for m in found]) if found else {}
    if found:
        rep = []
        gt = b.race_wins(b.GRAND_TOURS, rep)
        mon = b.race_wins(b.MONUMENTS, rep)
    existing_qids = {r.get("qid") for r in riders.values()}
    for m in found:
        f = facts.get(m["qid"], {})
        rid = b.slug(m["nom"])
        row = next(c for c in changes if c["nom"] == m["nom"] and c["moviment"] == "alta")
        if not f.get("born") or not f.get("ioc") or m["qid"] in existing_qids or rid in riders:
            changes.remove(row)
            row["estat_confirmacio"] = "pendent"
            incidents.append({**row, "motiu": "Falta data de naixement o nacionalitat a Wikidata, o ja existeix"})
            continue
        row["id"] = rid
        riders[rid] = {"id": rid, "name": m["nom"], "qid": m["qid"], "country": f["ioc"], "team": m["equip_2027"],
                       "born": f["born"], "gtWins": gt.get(m["qid"], 0), "monuments": mon.get(m["qid"], 0)}
        touched[rid] = row

    for team, why in REGISTRATION_PENDING.items():
        incidents.append({"id": "", "nom": "", "moviment": "registre_equip", "equip_2026": team, "equip_2027": team,
                          "font_url": UCI_2027_URL, "altres_fonts": "", "font_tipus": "premsa", "num_fonts": 1,
                          "data_verificacio": today, "estat_confirmacio": "pendent", "nota": "", "motiu": why})

    sizes = Counter(r["team"] for r in riders.values())
    for team, n in sorted(sizes.items()):
        if n > 30 or n < 27:
            incidents.append({"id": "", "nom": "", "moviment": "mida_plantilla", "equip_2026": team, "equip_2027": team,
                              "font_url": "", "altres_fonts": "", "font_tipus": "pendent", "num_fonts": 0,
                              "data_verificacio": today, "estat_confirmacio": "pendent", "nota": f"{n} corredors",
                              "motiu": ("Més de 30 corredors: segurament hi ha baixes que encara no surten a les fonts"
                                        if n > 30 else "Menys de 27 corredors: segurament falten altes per anunciar")})

    # Base nova
    out = sorted(riders.values(), key=lambda r: (r["team"], r["name"]))
    payload = {"source": "wikipedia+wikidata+moviments-premsa", "season": int(season), "status": "provisional",
               "generated": today, "riders": out}
    (b.DATA / "riders.json").write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n")

    def write(path, rows):
        cols = []
        for r in rows:
            cols += [k for k in r if k not in cols]
        with open(path, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=cols)
            w.writeheader()
            w.writerows(rows)

    write(out_dir / f"roster_changes_{season}.csv", changes)
    write(out_dir / f"incidencies_{season}.csv", incidents)
    trace = []
    for r in out:
        t = touched.get(r["id"])
        if t:
            trace.append({"id": r["id"], "nom": r["name"], "equip": r["team"], "origen": t["moviment"],
                          "font_url": t["font_url"], "font_tipus": t["font_tipus"], "data_verificacio": today,
                          "estat_confirmacio": t["estat_confirmacio"],
                          "nota": REGISTRATION_PENDING.get(r["team"], "")})
        else:
            trace.append({"id": r["id"], "nom": r["name"], "equip": r["team"], "origen": "continua",
                          "font_url": ROSTER_2026_URL, "font_tipus": "enciclopedia", "data_verificacio": today,
                          "estat_confirmacio": "provisional",
                          "nota": "; ".join(x for x in ["Plantilla 2026 sense baixa coneguda", REGISTRATION_PENDING.get(r["team"], "")] if x)})
    # Estat confirmat només amb comunicat oficial (equip, UCI o ciclista) que situï el corredor en aquest equip.
    for row in trace:
        o = official.get(row["id"])
        if o and o["equip_2027"] == row["equip"]:
            row.update(estat_confirmacio="confirmat", font_url=o["font_oficial"], font_tipus="oficial",
                       nota="; ".join(x for x in [o.get("nota", ""), row["nota"]] if x))
        elif o:
            row["nota"] = "; ".join(x for x in [row["nota"], f"Discrepància: la font oficial el situa a {o['equip_2027']}"] if x)
    write(out_dir / f"riders_{season}_sources.csv", trace)

    c = Counter(x["moviment"] for x in changes)
    per_team = Counter(r["team"] for r in out)
    lines = [f"# Aplicació de moviments {season}", f"Generat: {today}", "",
             f"Corredors {prev_season}: {len(base['riders'])} → {season}: {len(out)}", "",
             "## Moviments aplicats", *[f"- {k}: {v}" for k, v in sorted(c.items())],
             f"- incidències: {len(incidents)}", "", "## Corredors per equip",
             *[f"- {k}: {v}" for k, v in sorted(per_team.items())], "",
             "## Estat de confirmació", *[f"- {k}: {v}" for k, v in sorted(Counter(t['estat_confirmacio'] for t in trace).items())],
             "", "## Registre", *log]
    (out_dir / f"apply_report_{season}.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
