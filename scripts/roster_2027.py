#!/usr/bin/env python3
"""Compara les plantilles WorldTour d'una temporada amb l'anterior.

Font de partida: "List of {season} UCI WorldTeams and riders" (Viquipèdia, en anglès).
Per a cada moviment guarda la URL de la referència que cita la Viquipèdia,
perquè es pugui revisar a la font original (comunicat de l'equip, UCI o premsa).

Sortides (a work/):
  roster_{season}_candidates.csv  tots els corredors de la pàgina nova amb l'estat
  roster_{season}_report.md       resum i incidències
  wikitext_{season}.txt           còpia del text font, per revisar-lo

No toca data/riders.json: el pas a producció es fa a mà, revisant aquests fitxers.
"""
import argparse, csv, datetime, json, re, traceback
from pathlib import Path
from urllib.parse import urlparse

import build_data as b

WORK = b.ROOT / "work"

# Dominis oficials coneguts (orientatius: cal revisar-los a cada temporada).
OFFICIAL_DOMAINS = {
    "uci.org": "uci",
    "uaeteamemirates.com": "oficial_equip", "teamvismaleaseabike.com": "oficial_equip",
    "redbullborahansgrohe.com": "oficial_equip", "ineosgrenadiers.com": "oficial_equip",
    "racing.trekbikes.com": "oficial_equip", "trekbikes.com": "oficial_equip",
    "soudal-quickstepteam.com": "oficial_equip", "movistarteam.com": "oficial_equip",
    "decathlonag2rlamondiale.com": "oficial_equip", "decathloncmacgm.com": "oficial_equip",
    "equipecycliste-groupama-fdj.fr": "oficial_equip", "groupama-fdj.fr": "oficial_equip",
    "efprocycling.com": "oficial_equip", "bahraincyclingteam.com": "oficial_equip",
    "astanaqazaqstan.com": "oficial_equip", "astana.team": "oficial_equip",
    "alpecin-deceuninck.com": "oficial_equip", "alpecin-premiertech.com": "oficial_equip",
    "greenedgecycling.com": "oficial_equip", "teampicnicpostnl.com": "oficial_equip",
    "teamdsmfirmenich-postnl.com": "oficial_equip", "unoxteam.com": "oficial_equip",
    "unoxmobility.com": "oficial_equip", "lottocyclingteam.be": "oficial_equip",
    "nsncycling.com": "oficial_equip", "israelpremiertech.com": "oficial_equip",
}
PRESS_HINT = ("cyclingnews", "velo", "procyclinguk", "escapecollective", "directvelo", "ciclo21", "wielerflits",
              "sporza", "nieuwsblad", "lequipe", "gazzetta", "marca", "as.com", "cyclingweekly", "domestique",
              "idlprocycling", "hln", "het", "tuttobici", "biciciclismo", "eurosport")
SOCIAL = ("twitter.com", "x.com", "instagram.com", "facebook.com", "tiktok.com", "youtube.com", "strava.com")


def source_type(url):
    if not url:
        return "pendent"
    host = urlparse(url).netloc.lower().removeprefix("www.")
    for d, t in OFFICIAL_DOMAINS.items():
        if host == d or host.endswith("." + d):
            return t
    if any(s in host for s in SOCIAL):
        return "xarxes"
    if "procyclingstats" in host or "firstcycling" in host:
        return "resultats"
    return "premsa"


def collect_refs(text):
    named = {}
    for m in re.finditer(r'<ref\s+name\s*=\s*"?([^">/]+?)"?\s*>(.*?)</ref>', text, re.S):
        named[m.group(1).strip()] = m.group(2)
    return named


def ref_urls(fragment, named):
    urls = []
    for m in re.finditer(r"<ref(?:\s+name\s*=\s*\"?([^\">/]+?)\"?)?\s*(/>|>(.*?)</ref>)", fragment, re.S):
        content = m.group(3) if m.group(3) is not None else named.get((m.group(1) or "").strip(), "")
        for u in re.findall(r"url\s*=\s*([^\s|}]+)", content) or re.findall(r"https?://[^\s\]|}<]+", content):
            urls.append(u.strip())
    return urls


def best_source(urls):
    rank = {"uci": 0, "oficial_equip": 1, "premsa": 2, "resultats": 3, "xarxes": 4, "pendent": 5}
    return sorted(urls, key=lambda u: rank[source_type(u)])[0] if urls else ""


def parse_page(season):
    page = f"List of {season} UCI WorldTeams and riders"
    j = b.get(b.WP, {"action": "parse", "page": page, "prop": "wikitext", "format": "json",
                     "formatversion": 2, "redirects": 1}).json()
    if "error" in j:
        return None, page
    return j["parse"]["wikitext"], page


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", default="2027")
    args = ap.parse_args()
    season = args.season
    today = datetime.date.today().isoformat()
    WORK.mkdir(exist_ok=True)
    report = [f"# Plantilles {season}: comparació amb la temporada anterior", f"Generat: {today}", ""]
    try:
        text, page = parse_page(season)
        if text is None:
            report.append(f"**La pàgina '{page}' encara no existeix a la Viquipèdia.** No hi ha canvis a proposar.")
            raise SystemExit
        (WORK / f"wikitext_{season}.txt").write_text(text)
        named = collect_refs(text)

        rows, team, unknown = [], None, []
        for line in text.splitlines():
            h = re.match(r"^(=+)\s*(.*?)\s*\1\s*$", line)
            if h:
                level, title = len(h.group(1)), h.group(2)
                tid = b.team_for_heading(title)
                if level <= 3:
                    team = tid
                    if not tid and level == 3:
                        unknown.append(title)
                elif b.SKIP_SUBSECTIONS.search(title):
                    team = None
                continue
            if not team:
                continue
            for m in b.RIDER_TPL.finditer(line):
                r = b.parse_rider_template(m.group(1) or m.group(2))
                if not r:
                    continue
                tail = line[m.start():]
                nxt = b.RIDER_TPL.search(tail, 1)
                fragment = tail[: nxt.start()] if nxt else tail
                r["team"] = team
                r["urls"] = ref_urls(fragment, named)
                rows.append(r)

        prev = json.loads((b.DATA / "riders.json").read_text())
        prev_riders = prev["riders"]
        prev_by_qid = {r["qid"]: r for r in prev_riders if r.get("qid")}
        prev_by_id = {r["id"]: r for r in prev_riders}

        ids = b.wikidata_ids([r["title"] for r in rows if r["title"]])
        for r in rows:
            r["qid"] = ids.get(r["title"]) if r["title"] else None
        facts = b.rider_facts([r["qid"] for r in rows if r["qid"]])

        out, seen = [], set()
        for r in rows:
            old = prev_by_qid.get(r["qid"]) or prev_by_id.get(b.slug(r["name"]))
            rid = old["id"] if old else b.slug(r["name"])
            if rid in seen:
                continue
            seen.add(rid)
            f = facts.get(r["qid"], {})
            src = best_source(r["urls"])
            if old and old["team"] == r["team"]:
                move, status = "continua", "provisional"
                stype = "pendent" if not src else source_type(src)
            elif old:
                move, stype = "canvi_equip", source_type(src)
                status = "provisional" if stype in ("uci", "oficial_equip") else ("pendent" if stype == "pendent" else "rumor" if stype == "xarxes" else "provisional")
            else:
                move, stype = "alta", source_type(src)
                status = "provisional" if stype in ("uci", "oficial_equip", "premsa") else "pendent"
            out.append({
                "id": rid, "nom": r["name"], "qid": r["qid"] or "",
                "equip_anterior": old["team"] if old else "", "equip_nou": r["team"],
                "moviment": move, "pais": r["ioc"] or f.get("ioc") or (old or {}).get("country", ""),
                "data_naixement": f.get("born") or r["born"] or (old or {}).get("born", ""),
                "font_url": src, "altres_fonts": " ".join(u for u in r["urls"] if u != src),
                "font_tipus": stype, "data_verificacio": today, "estat_confirmacio": status,
            })
        new_ids = {o["id"] for o in out}
        for r in prev_riders:
            if r["id"] not in new_ids:
                out.append({"id": r["id"], "nom": r["name"], "qid": r.get("qid") or "", "equip_anterior": r["team"],
                            "equip_nou": "", "moviment": "baixa", "pais": r["country"], "data_naixement": r["born"],
                            "font_url": "", "altres_fonts": "", "font_tipus": "pendent", "data_verificacio": today,
                            "estat_confirmacio": "pendent"})

        cols = list(out[0].keys())
        with open(WORK / f"roster_{season}_candidates.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=cols)
            w.writeheader()
            w.writerows(out)

        from collections import Counter
        moves = Counter(o["moviment"] for o in out)
        per_team = Counter(o["equip_nou"] for o in out if o["equip_nou"])
        report += [f"Pàgina: {page}", "",
                   "## Moviments", *[f"- {k}: {v}" for k, v in sorted(moves.items())], "",
                   "## Corredors per equip a la pàgina nova", *[f"- {k}: {v}" for k, v in sorted(per_team.items())],
                   *([f"- ⚠️ Equips sense corredors: {', '.join(t for t in b.TEAM_KEYS if t not in per_team)}"]
                     if any(t not in per_team for t in b.TEAM_KEYS) else []),
                   *([f"- Seccions no reconegudes: {', '.join(unknown)}"] if unknown else []), "",
                   "## Tipus de font dels moviments (altes i canvis)",
                   *[f"- {k}: {v}" for k, v in sorted(Counter(o['font_tipus'] for o in out if o['moviment'] in ('alta', 'canvi_equip')).items())]]
    except SystemExit:
        pass
    except Exception:
        report += ["", "## Error", "```", traceback.format_exc(), "```"]
        traceback.print_exc()
    (WORK / f"roster_{season}_report.md").write_text("\n".join(report) + "\n")


if __name__ == "__main__":
    main()
