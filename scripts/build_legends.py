#!/usr/bin/env python3
"""Genera la base històrica: guanyadors per cursa i any, i corredors llegendaris.

Fonts: Wikidata (edicions, guanyadors, etapes, mallots, dades dels corredors) i, si
Wikidata té massa poques edicions d'una cursa, la taula de guanyadors de l'article
de la Viquipèdia en anglès.

Escriu:
  data/winners.json   guanyador de cada edició (generals, monuments i mundials)
  data/legends.json   corredors que compleixen algun criteri de llegenda, amb palmarès
  data/legends_report.md
Si alguna cosa falla, no sobreescriu els JSON i deixa l'error a l'informe.
"""
import datetime, json, re, time, traceback
from collections import Counter, defaultdict

import build_data as b

RACES = [
    ("tour", "Tour de France", "gt"), ("giro", "Giro d'Italia", "gt"), ("vuelta", "Vuelta a España", "gt"),
    ("msr", "Milan–San Remo", "mon"), ("rvv", "Tour of Flanders", "mon"), ("pr", "Paris–Roubaix", "mon"),
    ("lbl", "Liège–Bastogne–Liège", "mon"), ("lomb", "Il Lombardia", "mon"),
    ("wrr", "UCI Road World Championships – Men's road race", "wc"),
    ("wtt", "UCI Road World Championships – Men's time trial", "wc"),
]
MIN_EDITIONS = {"gt": 60, "mon": 60, "wc": 25}
# Articles on hi ha la taula de guanyadors, si no és l'article principal.
WIKI_TABLES = {"rvv": ["Tour of Flanders", "List of Tour of Flanders winners"],
               "wtt": ["UCI Road World Championships – Men's time trial"]}
# Primer any vàlid de cada cursa (abans no existia o era amateur).
FIRST_YEAR = {"wtt": 1994, "wrr": 1927}
# Codis COI antics o alternatius que fa servir Wikidata.
IOC_FIX = {"SPA": "ESP", "HOL": "NED", "FRG": "GER", "SAF": "RSA"}
JERSEY = {"points": re.compile(r"point", re.I), "mountains": re.compile(r"mountain|king of the|climber", re.I),
          "young": re.compile(r"young|youth|best rider under", re.I)}
GC = b.WINNER_QUALIFIER
NOT_STAGE_WIN = re.compile(r"general|overall|point|mountain|young|youth|leader|combativ|team|intermediate|second|third", re.I)
MAX_YEAR = datetime.date.today().year

report, log_lines = [], []


def log(m):
    print(m, flush=True)
    log_lines.append(m)


# Noms alternatius de les edicions a la Viquipèdia (quan l'edició és una desambiguació).
EDITION_SUFFIX = {"Tour of Flanders": " (men's race)", "Paris–Roubaix": " (men's race)"}


def race_classes(title, ids):
    """Element de la cursa i, a partir d'edicions recents, la classe de les edicions.
    Només s'accepta una classe si la seva etiqueta conté el nom de la cursa: així no
    s'hi colen classes genèriques com "contrarellotge individual"."""
    classes = set()
    if ids.get(title):
        classes.add(ids[title])
    key = b.slug(title.split("–")[0] if "World Championships" not in title else title).replace("-", " ")
    words = [w for w in key.split() if len(w) > 3]
    for year in (2025, 2024):
        ed = ids.get(f"{year} {title}{EDITION_SUFFIX.get(title, '')}") or ids.get(f"{year} {title}")
        if ed:
            for r in b.sparql(f"""SELECT ?c ?l WHERE {{ wd:{ed} wdt:P31|wdt:P179|wdt:P3450 ?c .
              OPTIONAL {{ ?c rdfs:label ?l FILTER(LANG(?l) = "en") }} }}"""):
                label = b.slug(r.get("l", {}).get("value", "")).replace("-", " ")
                if all(w in label for w in words):
                    classes.add(b.qid_of(r["c"]["value"]))
                else:
                    log(f"{title}: classe descartada '{r.get('l', {}).get('value', '?')}'")
    return classes


def year_of(row):
    if "date" in row:
        return int(row["date"]["value"][:4])
    if "elabel" in row:
        m = re.search(r"(18|19|20)\d\d", row["elabel"]["value"])
        return int(m.group(0)) if m else None
    return None


def edition_statements(classes):
    values = " ".join(f"wd:{c}" for c in sorted(classes))
    rows = b.sparql(f"""
SELECT ?edition ?elabel ?date ?st ?winner ?qlabel WHERE {{
  VALUES ?race {{ {values} }}
  ?edition wdt:P31|wdt:P179|wdt:P3450 ?race .
  ?edition p:P1346 ?st .
  ?st ps:P1346 ?winner ; wikibase:rank ?rank .
  FILTER(?rank != wikibase:DeprecatedRank)
  ?winner wdt:P31 wd:Q5 .
  OPTIONAL {{ ?edition rdfs:label ?elabel FILTER(LANG(?elabel) = "en") }}
  OPTIONAL {{ ?edition wdt:P585|wdt:P580 ?date }}
  OPTIONAL {{ ?st ?pq ?qv . ?qp wikibase:qualifier ?pq . ?qv rdfs:label ?qlabel FILTER(LANG(?qlabel) = "en") }}
}}""")
    st = defaultdict(lambda: {"winner": None, "edition": None, "year": None, "labels": set()})
    for r in rows:
        s = st[r["st"]["value"]]
        s["winner"] = b.qid_of(r["winner"]["value"])
        s["edition"] = b.qid_of(r["edition"]["value"])
        s["year"] = s["year"] or year_of(r)
        if "qlabel" in r:
            s["labels"].add(r["qlabel"]["value"])
    return list(st.values())


def stage_winners(classes):
    values = " ".join(f"wd:{c}" for c in sorted(classes))
    rows = b.sparql(f"""
SELECT ?stage ?st ?winner ?qlabel WHERE {{
  VALUES ?race {{ {values} }}
  ?edition wdt:P31|wdt:P179|wdt:P3450 ?race .
  ?stage wdt:P361 ?edition .
  ?stage p:P1346 ?st .
  ?st ps:P1346 ?winner ; wikibase:rank ?rank .
  FILTER(?rank != wikibase:DeprecatedRank)
  ?winner wdt:P31 wd:Q5 .
  OPTIONAL {{ ?st ?pq ?qv . ?qp wikibase:qualifier ?pq . ?qv rdfs:label ?qlabel FILTER(LANG(?qlabel) = "en") }}
}}""")
    st = defaultdict(lambda: {"winner": None, "stage": None, "labels": set()})
    for r in rows:
        s = st[r["st"]["value"]]
        s["winner"] = b.qid_of(r["winner"]["value"])
        s["stage"] = b.qid_of(r["stage"]["value"])
        if "qlabel" in r:
            s["labels"].add(r["qlabel"]["value"])
    per_stage = defaultdict(set)
    for s in st.values():
        if not any(NOT_STAGE_WIN.search(l) for l in s["labels"]):
            per_stage[s["stage"]].add(s["winner"])
    counts = Counter()
    for stage, ws in per_stage.items():
        if len(ws) == 1:
            counts[next(iter(ws))] += 1
    return counts, len(per_stage)


def wikipedia_winners(titles):
    """Llegeix les taules de guanyadors (HTML) d'un o més articles de la Viquipèdia.
    Retorna {any: [títols d'article enllaçats a la columna del guanyador]}."""
    from bs4 import BeautifulSoup
    out = {}
    for title in titles:
        j = b.get(b.WP, {"action": "parse", "page": title, "prop": "text", "format": "json",
                         "formatversion": 2, "redirects": 1}).json()
        html = j.get("parse", {}).get("text")
        if not html:
            log(f"Viquipèdia: no existeix '{title}'")
            continue
        soup = BeautifulSoup(html, "html.parser")
        for table in soup.select("table.wikitable"):
            head = table.find("tr")
            if not head:
                continue
            hs = [c.get_text(" ", strip=True).lower() for c in head.find_all(["th", "td"])]
            log(f"Viquipèdia '{title}': taula amb capçalera {hs[:6]}")
            yi = next((i for i, h in enumerate(hs) if "year" in h or h in ("edition", "season")), None)
            wi = next((i for i, h in enumerate(hs) if any(k in h for k in ("winner", "gold", "first", "champion", "rider"))), None)
            if yi is None or wi is None:
                continue
            n = 0
            for tr in table.find_all("tr")[1:]:
                cells = tr.find_all(["td", "th"])
                if len(cells) <= max(yi, wi):
                    continue
                m = re.search(r"\b(18[6-9]\d|19\d\d|20\d\d)\b", cells[yi].get_text(" ", strip=True))
                if not m:
                    continue
                y = int(m.group(1))
                links = [a.get("title") for a in cells[wi].find_all("a") if a.get("title")
                         and not a.find_parent(class_="flagicon") and "(page does not exist)" not in a.get("title")]
                if links and y not in out and y <= MAX_YEAR:
                    out[y] = links
                    n += 1
            log(f"Viquipèdia '{title}': taula amb {n} anys (columnes '{hs[yi]}' / '{hs[wi]}')")
    return out


def humans(titles):
    ids = b.wikidata_ids(titles)
    qids = sorted(set(ids.values()))
    hum = set()
    for i in range(0, len(qids), 150):
        vals = " ".join(f"wd:{q}" for q in qids[i:i + 150])
        for r in b.sparql(f"SELECT ?i WHERE {{ VALUES ?i {{ {vals} }} ?i wdt:P31 wd:Q5 }}"):
            hum.add(b.qid_of(r["i"]["value"]))
    return {t: q for t, q in ids.items() if q in hum}


def rider_info(qids):
    info = {}
    qids = sorted(qids)
    for i in range(0, len(qids), 120):
        vals = " ".join(f"wd:{q}" for q in qids[i:i + 120])
        rows = b.sparql(f"""
SELECT ?i ?label ?lang ?birth ?death ?ioc1 ?ioc2 WHERE {{
  VALUES ?i {{ {vals} }}
  OPTIONAL {{ ?i rdfs:label ?label . BIND(LANG(?label) AS ?lang) FILTER(?lang IN ("en", "mul", "fr", "it", "es", "nl", "ca")) }}
  OPTIONAL {{ ?i wdt:P569 ?birth }}
  OPTIONAL {{ ?i wdt:P570 ?death }}
  OPTIONAL {{ ?i wdt:P1532 ?c1 . ?c1 wdt:P984 ?ioc1 }}
  OPTIONAL {{ ?i wdt:P27 ?c2 . ?c2 wdt:P984 ?ioc2 }}
}}""")
        pref = ["en", "mul", "fr", "it", "es", "nl", "ca"]
        for r in rows:
            q = b.qid_of(r["i"]["value"])
            d = info.setdefault(q, {"labels": {}})
            if "label" in r:
                d["labels"][r["lang"]["value"]] = r["label"]["value"]
            if "birth" in r and "born" not in d and not r["birth"]["value"].startswith("http"):
                d["born"] = r["birth"]["value"][:10]
            if "death" in r and "died" not in d and not r["death"]["value"].startswith("http"):
                d["died"] = r["death"]["value"][:10]
            if "ioc1" in r and "ioc" not in d:
                d["ioc"] = r["ioc1"]["value"]
            elif "ioc2" in r and "ioc2" not in d:
                d["ioc2"] = r["ioc2"]["value"]
        for q in [x for x in qids[i:i + 120] if x in info]:
            d = info[q]
            d["name"] = next((d["labels"][l] for l in pref if l in d["labels"]), None)
            d["ioc"] = d.get("ioc") or d.get("ioc2")
            d["ioc"] = IOC_FIX.get(d["ioc"], d["ioc"])
        time.sleep(1)
    return info


def main():
    global report
    today = datetime.date.today().isoformat()
    report.extend(["# Informe de llegendes", f"Generat: {today}", ""])
    try:
        titles = [t for _, t, _ in RACES]
        ids = b.wikidata_ids(titles + [f"{y} {t}" for t in titles for y in (2025, 2024)]
                             + [f"{y} {t}{sfx}" for t, sfx in EDITION_SUFFIX.items() for y in (2025, 2024)])
        editions, label_stats = [], Counter()
        stats = defaultdict(lambda: Counter())
        report.append("## Cobertura per cursa")
        for rid, title, kind in RACES:
            classes = race_classes(title, ids)
            st = edition_statements(classes) if classes else []
            for s in st:
                label_stats.update(s["labels"])
            per_ed = defaultdict(list)
            for s in st:
                per_ed[s["edition"]].append(s)
            found = {}
            for ed, ss in per_ed.items():
                labelled = [x for x in ss if x["labels"]]
                gc = [x for x in labelled if any(GC.search(l) for l in x["labels"])] if labelled else ss
                ws = {x["winner"] for x in gc}
                year = next((x["year"] for x in ss if x["year"]), None)
                if len(ws) == 1 and year and year <= MAX_YEAR:
                    found[year] = next(iter(ws))
                if kind == "gt":
                    for x in labelled:
                        for j, rx in JERSEY.items():
                            if any(rx.search(l) for l in x["labels"]) and not any(GC.search(l) for l in x["labels"]):
                                stats[x["winner"]][f"j_{j}"] += 1
            fy = FIRST_YEAR.get(rid)
            if fy:
                found = {y: q for y, q in found.items() if y >= fy}
            source = "wikidata"
            if len(found) < MIN_EDITIONS[kind] or rid in WIKI_TABLES:
                wp = wikipedia_winners(WIKI_TABLES.get(rid, [title]))
                hum = humans(sorted({l for ls in wp.values() for l in ls}))
                wp_found = {y: next((hum[l] for l in ls if l in hum), None) for y, ls in wp.items()}
                wp_found = {y: q for y, q in wp_found.items() if q and (not fy or y >= fy)}
                log(f"{title}: Wikidata {len(found)} edicions, Viquipèdia {len(wp_found)}")
                if len(wp_found) > len(found):
                    found, source = wp_found, "wikipedia"
            for y, q in sorted(found.items()):
                editions.append({"race": rid, "year": y, "winner": q, "source": source})
                stats[q][kind] += 1
                stats[q][f"r_{rid}"] += 1
            yrs = sorted(found)
            report.append(f"- {title}: {len(found)} edicions ({yrs[0] if yrs else '?'}–{yrs[-1] if yrs else '?'}), font: {source}")
            if kind == "gt" and classes:
                counts, n = stage_winners(classes)
                for q, c in counts.items():
                    stats[q]["stages"] += c
                report.append(f"  - etapes amb guanyador: {n}")
            time.sleep(1)

        def score(c):
            return c["gt"] + c["mon"] + c["wc"] + (1 if c["stages"] >= 3 else 0) + c["j_points"] + c["j_mountains"] + c["j_young"]
        extra = json.loads((b.DATA / "legends_extra.json").read_text()).get("qids", []) if (b.DATA / "legends_extra.json").exists() else []
        legend_qids = {q for q, c in stats.items() if score(c) > 0} | set(extra)
        winner_qids = {e["winner"] for e in editions}
        info = rider_info(legend_qids | winner_qids)

        cur = json.loads((b.DATA / "riders.json").read_text())["riders"]
        arch = []
        for f in (b.DATA / "archive").glob("riders_*.json"):
            arch += json.loads(f.read_text())["riders"]
        id_by_qid = {r["qid"]: r["id"] for r in arch + cur if r.get("qid")}

        people, used = {}, set(id_by_qid.values())
        for q in sorted(legend_qids | winner_qids):
            d = info.get(q, {})
            if not d.get("name"):
                continue
            pid = id_by_qid.get(q)
            if not pid:
                pid = b.slug(d["name"])
                while pid in used and pid not in id_by_qid.values():
                    pid += "-2"
                used.add(pid)
            c = stats[q]
            people[q] = {"id": pid, "qid": q, "name": d["name"], "country": d.get("ioc"), "born": d.get("born"),
                         "died": d.get("died"), "gtWins": c["gt"], "monuments": c["mon"], "worlds": c["wc"],
                         "stages": c["stages"], "jerseys": c["j_points"] + c["j_mountains"] + c["j_young"],
                         "legend": q in legend_qids}
        legends = sorted([p for p in people.values() if p["legend"] and p["born"] and p["country"]],
                         key=lambda p: (-(p["gtWins"] * 3 + p["monuments"] * 2 + p["worlds"] * 2 + p["stages"] / 5), p["name"]))
        win_out = [{"race": e["race"], "year": e["year"], "winner": people[e["winner"]]["id"]}
                   for e in editions if e["winner"] in people]
        names = {p["id"]: {"name": p["name"], "country": p["country"]} for p in people.values()}

        report += ["", "## Resum",
                   f"- Edicions amb guanyador: {len(win_out)}",
                   f"- Llegendes (amb data i país): {len(legends)}",
                   f"- Descartades per falta de data o país: {sum(1 for p in people.values() if p['legend']) - len(legends)}",
                   "", "## Top 40 per palmarès"]
        report += [f"- {p['name']} ({p['country']}, {p['born'][:4]}): {p['gtWins']} GV, {p['monuments']} mon., "
                   f"{p['worlds']} mund., {p['stages']} etapes, {p['jerseys']} mallots" for p in legends[:40]]
        missing_c = Counter(p["country"] for p in legends)
        countries = json.loads((b.DATA / "countries.json").read_text())
        unk = sorted(c for c in missing_c if c not in countries)
        report += ["", f"Codis de país sense continent: {', '.join(unk) or 'cap'}",
                   "", "## Qualificadors més freqüents a Wikidata", *[f"- {l}: {n}" for l, n in label_stats.most_common(25)]]

        if len(legends) < 200 or len(win_out) < 500:
            report.insert(3, "**❌ Dades insuficients: no s'han escrit els fitxers.**\n")
        else:
            (b.DATA / "legends.json").write_text(json.dumps({"generated": today, "source": "wikidata+wikipedia",
                                                              "riders": legends}, ensure_ascii=False, indent=1) + "\n")
            (b.DATA / "winners.json").write_text(json.dumps({"generated": today, "races": [{"id": r, "title": t, "kind": k} for r, t, k in RACES],
                                                              "editions": win_out, "people": names}, ensure_ascii=False, indent=1) + "\n")
            report.insert(3, "**✅ legends.json i winners.json actualitzats.**\n")
    except Exception:
        report.insert(3, "**❌ Error durant la generació.**\n")
        report.extend(["", "## Error", "```", traceback.format_exc(), "```"])
        traceback.print_exc()
    report.extend(["", "## Registre", "```", *log_lines, "```"])
    (b.DATA / "legends_report.md").write_text("\n".join(report) + "\n")


if __name__ == "__main__":
    main()
