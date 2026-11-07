#!/usr/bin/env python3
"""Genera data/riders.json.

- Plantilles: pàgina de la Viquipèdia en anglès "List of {season} UCI WorldTeams and riders".
- Naixement, país i palmarès: Wikidata.
- Especialitats: NO es generen aquí; viuen a data/specialties.json i el joc les combina.
- Correccions manuals: data/overrides.json (camps per id de corredor).

Escriu també data/report.md amb un resum per revisar errors.
Si alguna cosa falla, no sobreescriu riders.json i deixa l'error a l'informe.
"""
import argparse, datetime, json, re, sys, time, traceback, unicodedata
from collections import defaultdict
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
UA = "GruppettoBot/0.1 (https://github.com/arnauyanes/gruppetto; cycling quiz data build)"
WP = "https://en.wikipedia.org/w/api.php"
SPARQL = "https://query.wikidata.org/sparql"

GRAND_TOURS = ["Tour de France", "Giro d'Italia", "Vuelta a España"]
MONUMENTS = ["Milan–San Remo", "Tour of Flanders", "Paris–Roubaix", "Liège–Bastogne–Liège", "Il Lombardia"]

# Paraules clau per reconèixer cada equip als títols de la Viquipèdia.
TEAM_KEYS = {
    "alpecin": ["alpecin"], "decathlon": ["decathlon"], "ef": ["ef education", "easypost"],
    "groupama": ["groupama", "fdj"], "lidl": ["lidl"], "lotto": ["lotto", "intermarch"],
    "movistar": ["movistar"], "ineos": ["ineos"], "nsn": ["nsn"], "redbull": ["red bull", "bora"],
    "soudal": ["soudal", "quick-step", "quick step"], "bahrain": ["bahrain"], "jayco": ["jayco", "alula"],
    "picnic": ["picnic", "postnl"], "visma": ["visma"], "uae": ["uae"], "unox": ["uno-x", "uno x"],
    "astana": ["astana"],
}
SKIP_SUBSECTIONS = re.compile(r"stagiaire|trainee|depart|left|transfer", re.I)
WINNER_QUALIFIER = re.compile(r"overall winner|winner general classification", re.I)

S = requests.Session()
S.headers["User-Agent"] = UA
log_lines = []


def log(msg):
    print(msg, flush=True)
    log_lines.append(msg)


def get(url, params, tries=5):
    for i in range(tries):
        try:
            r = S.get(url, params=params, timeout=90)
            if r.status_code == 429 or r.status_code >= 500:
                raise RuntimeError(f"HTTP {r.status_code}")
            r.raise_for_status()
            return r
        except Exception as e:
            if i == tries - 1:
                raise
            wait = 10 * (i + 1)
            log(f"  reintent en {wait}s ({e})")
            time.sleep(wait)


def sparql(query):
    r = get(SPARQL, {"query": query, "format": "json"})
    return r.json()["results"]["bindings"]


def slug(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def qid_of(uri):
    return uri.rsplit("/", 1)[-1]


# ---------- Plantilles ----------

def team_for_heading(text):
    t = text.lower()
    for tid, keys in TEAM_KEYS.items():
        if any(k in t for k in keys):
            return tid
    return None


def parse_rosters(season):
    page = f"List of {season} UCI WorldTeams and riders"
    j = get(WP, {"action": "parse", "page": page, "prop": "wikitext", "format": "json",
                 "formatversion": 2, "redirects": 1}).json()
    if "error" in j:
        raise RuntimeError(f"No s'ha trobat la pàgina '{page}': {j['error']}")
    text = j["parse"]["wikitext"]
    riders, unknown_headings = [], []
    team = None
    for line in text.splitlines():
        h = re.match(r"^(=+)\s*(.*?)\s*\1\s*$", line)
        if h:
            level, title = len(h.group(1)), h.group(2)
            tid = team_for_heading(title)
            if level <= 3:
                team = tid
                if not tid and level == 3:
                    unknown_headings.append(title)
            elif SKIP_SUBSECTIONS.search(title):
                team = None
            continue
        if not team:
            continue
        for m in RIDER_TPL.finditer(line):
            rider = parse_rider_template(m.group(1) or m.group(2))
            if rider:
                rider["team"] = team
                riders.append(rider)
    return riders, unknown_headings


RIDER_TPL = re.compile(r"\{\{\s*Cycling squad rider\s*\|(.*?)\}\}\}\}|\{\{\s*Cycling squad rider\s*\|([^{}]*)\}\}", re.I)


def parse_rider_template(body):
    name_m = re.search(r"name\s*=\s*(.*?)(?:\|\s*(?:nat|birthdate|note)\s*=|$)", body)
    if not name_m:
        return None
    raw = name_m.group(1).strip()
    link = re.search(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", raw)
    if link:
        title = link.group(1).strip()
        name = link.group(2).strip() if link.group(2) else re.sub(r"\s*\(.*?\)\s*$", "", title)
    else:
        title, name = None, re.sub(r"<.*?>|'{2,3}", "", raw).strip()
    nat = re.search(r"nat\s*=\s*([A-Z]{3})", body)
    born = None
    if "birthdate" in body:
        nums = re.findall(r"\|\s*(\d{1,4})(?=\s*(?:\||$))", body.split("birthdate", 1)[1])
        if len(nums) >= 3 and len(nums[-3]) == 4:
            y, mth, d = nums[-3:]
            born = f"{y}-{int(mth):02d}-{int(d):02d}"
    if len(name) < 4:
        return None
    return {"name": name, "title": title, "ioc": nat.group(1) if nat else None, "born": born}


def wikidata_ids(titles):
    out = {}
    titles = [t for t in dict.fromkeys(titles) if t]
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        j = get(WP, {"action": "query", "prop": "pageprops", "ppprop": "wikibase_item", "titles": "|".join(chunk),
                     "redirects": 1, "format": "json", "formatversion": 2}).json()
        q = j.get("query", {})
        back = {}
        for n in q.get("normalized", []):
            back[n["to"]] = n["from"]
        for rd in q.get("redirects", []):
            back[rd["to"]] = back.get(rd["from"], rd["from"])
        for p in q.get("pages", []):
            qid = p.get("pageprops", {}).get("wikibase_item")
            if qid:
                out[back.get(p["title"], p["title"])] = qid
                out[p["title"]] = qid
        time.sleep(0.5)
    return out


# ---------- Dades i palmarès de Wikidata ----------

def rider_facts(qids):
    facts = {}
    qids = sorted(set(qids))
    for i in range(0, len(qids), 150):
        values = " ".join(f"wd:{q}" for q in qids[i:i + 150])
        rows = sparql(f"""
SELECT ?item ?birth ?ioc1 ?ioc2 WHERE {{
  VALUES ?item {{ {values} }}
  OPTIONAL {{ ?item wdt:P569 ?birth }}
  OPTIONAL {{ ?item wdt:P1532 ?c1 . ?c1 wdt:P984 ?ioc1 }}
  OPTIONAL {{ ?item wdt:P27 ?c2 . ?c2 wdt:P984 ?ioc2 }}
}}""")
        for r in rows:
            q = qid_of(r["item"]["value"])
            f = facts.setdefault(q, {})
            if "birth" in r and "born" not in f:
                f["born"] = r["birth"]["value"][:10]
            ioc = (r.get("ioc1") or r.get("ioc2") or {}).get("value")
            if ioc and "ioc" not in f:
                f["ioc"] = ioc
        time.sleep(1)
    return facts


def race_wins(race_titles, report):
    """Compta edicions guanyades (classificació general / guanyador) per corredor."""
    race_ids = wikidata_ids(race_titles)
    wins = defaultdict(int)
    for title in race_titles:
        rq = race_ids.get(title)
        if not rq:
            report.append(f"- ⚠️ {title}: no s'ha trobat a Wikidata")
            continue
        rows = sparql(f"""
SELECT ?edition ?elabel ?date ?st ?winner ?qlabel WHERE {{
  {{ ?edition wdt:P31 wd:{rq} }} UNION {{ ?edition wdt:P179 wd:{rq} }} UNION {{ ?edition wdt:P3450 wd:{rq} }}
  ?edition p:P1346 ?st .
  ?st ps:P1346 ?winner ; wikibase:rank ?rank .
  FILTER(?rank != wikibase:DeprecatedRank)
  ?winner wdt:P31 wd:Q5 .
  OPTIONAL {{ ?edition rdfs:label ?elabel FILTER(LANG(?elabel) = "en") }}
  OPTIONAL {{ ?edition wdt:P585|wdt:P580 ?date }}
  OPTIONAL {{ ?st ?pq ?qv . ?qp wikibase:qualifier ?pq . ?qv rdfs:label ?qlabel FILTER(LANG(?qlabel) = "en") }}
}}""")
        stmts = defaultdict(lambda: {"winner": None, "labels": set(), "edition": None, "year": None})
        for r in rows:
            s = stmts[r["st"]["value"]]
            s["winner"] = qid_of(r["winner"]["value"])
            s["edition"] = qid_of(r["edition"]["value"])
            if "qlabel" in r:
                s["labels"].add(r["qlabel"]["value"])
            y = None
            if "date" in r:
                y = r["date"]["value"][:4]
            elif "elabel" in r:
                m = re.search(r"(18|19|20)\d\d", r["elabel"]["value"])
                y = m.group(0) if m else None
            s["year"] = s["year"] or y
        per_edition = defaultdict(list)
        for x in stmts.values():
            per_edition[x["edition"]].append(x)
        years, ambiguous, no_label = [], [], 0
        for ed, ss in per_edition.items():
            labelled = [x for x in ss if x["labels"]]
            if labelled:
                chosen = [x for x in labelled if any(WINNER_QUALIFIER.search(l) for l in x["labels"])]
            else:
                chosen = ss
                no_label += 1
            winners = {x["winner"] for x in chosen}
            if not winners:
                continue
            if len(winners) > 1:
                ambiguous.append(chosen[0]["year"] or ed)
                continue
            wins[winners.pop()] += 1
            if chosen[0]["year"]:
                years.append(int(chosen[0]["year"]))
        span = f"{min(years)}–{max(years)}" if years else "?"
        report.append(f"- {title}: {len(years)} edicions comptades ({span}), {no_label} sense qualificador"
                      + (f" · ⚠️ ignorades per tenir més d'un guanyador: {sorted(map(str, ambiguous))}" if ambiguous else ""))
        time.sleep(1)
    return wins


# ---------- Principal ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", default="2026")
    args = ap.parse_args()
    report = [f"# Informe de dades · temporada {args.season}",
              f"Generat: {datetime.datetime.utcnow():%Y-%m-%d %H:%M} UTC", ""]
    try:
        log("Llegint plantilles de la Viquipèdia…")
        roster, unknown = parse_rosters(args.season)
        log(f"  {len(roster)} files")
        seen, riders = set(), []
        for r in roster:
            key = r["title"] or r["name"]
            if key in seen:
                continue
            seen.add(key)
            riders.append(r)

        log("Buscant identificadors de Wikidata…")
        ids = wikidata_ids([r["title"] for r in riders])
        for r in riders:
            r["qid"] = ids.get(r["title"]) if r["title"] else None

        log("Llegint naixement i nacionalitat…")
        facts = rider_facts([r["qid"] for r in riders if r["qid"]])

        log("Comptant grans voltes i monuments…")
        report += ["## Palmarès (fonts de Wikidata)", "### Grans voltes"]
        gt = race_wins(GRAND_TOURS, report)
        report.append("### Monuments")
        mon = race_wins(MONUMENTS, report)

        overrides = json.loads((DATA / "overrides.json").read_text()) if (DATA / "overrides.json").exists() else {}
        countries = json.loads((DATA / "countries.json").read_text())

        out, used_ids = [], set()
        for r in riders:
            f = facts.get(r["qid"], {})
            rid = slug(r["name"])
            while rid in used_ids:
                rid += "-2"
            used_ids.add(rid)
            rec = {
                "id": rid, "name": r["name"], "qid": r["qid"],
                "country": r["ioc"] or f.get("ioc"),
                "team": r["team"],
                "born": f.get("born") or r["born"],
                "gtWins": gt.get(r["qid"], 0), "monuments": mon.get(r["qid"], 0),
            }
            rec.update(overrides.get("riders", {}).get(rid, {}))
            out.append(rec)

        by_team = defaultdict(int)
        for r in out:
            by_team[r["team"]] += 1
        report += ["", "## Plantilles", f"Total: **{len(out)}** corredors", ""]
        report += [f"- {t}: {n}" for t, n in sorted(by_team.items())]
        missing_teams = [t for t in TEAM_KEYS if t not in by_team]
        if missing_teams:
            report.append(f"- ⚠️ Equips sense corredors: {', '.join(missing_teams)}")
        if unknown:
            report.append(f"- Seccions ignorades: {', '.join(unknown[:30])}")

        def listing(title, rows):
            report.extend(["", f"## {title} ({len(rows)})"] + [f"- {r['name']} ({r['team']})" for r in rows[:200]])
        listing("Sense Wikidata", [r for r in out if not r["qid"]])
        listing("Sense data de naixement", [r for r in out if not r["born"]])
        listing("Sense país", [r for r in out if not r["country"]])
        unknown_c = sorted({r["country"] for r in out if r["country"] and r["country"] not in countries})
        if unknown_c:
            report.append(f"\n⚠️ Codis de país sense continent a countries.json: {', '.join(unknown_c)}")
        winners = sorted([r for r in out if r["gtWins"] or r["monuments"]], key=lambda r: -(r["gtWins"] * 10 + r["monuments"]))
        report += ["", "## Corredors amb grans voltes o monuments"] + \
                  [f"- {r['name']}: {r['gtWins']} GV, {r['monuments']} monuments" for r in winners]

        if len(out) < 300 or len(by_team) < 15:
            report.insert(3, "**❌ Dades insuficients: no s'ha actualitzat riders.json.**\n")
            log("Massa pocs corredors; no s'escriu riders.json")
        else:
            payload = {"source": "wikipedia+wikidata", "season": int(args.season),
                       "generated": datetime.date.today().isoformat(),
                       "riders": sorted(out, key=lambda r: (r["team"], r["name"]))}
            (DATA / "riders.json").write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n")
            report.insert(3, "**✅ riders.json actualitzat.**\n")
            log(f"Escrit riders.json amb {len(out)} corredors")
    except Exception:
        report.insert(3, "**❌ Error durant la generació. riders.json no s'ha tocat.**\n")
        report += ["", "## Error", "```", traceback.format_exc(), "```"]
        traceback.print_exc()
    report += ["", "## Registre", "```", *log_lines, "```"]
    (DATA / "report.md").write_text("\n".join(report) + "\n")


if __name__ == "__main__":
    main()
