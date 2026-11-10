#!/usr/bin/env python3
"""Busca evidència per a les especialitats a la fitxa de la Viquipèdia anglesa (camp «ridertype»).

Regles (no s'inventa res):
- Només es fa servir el camp «ridertype» de la infotaula, que és text visible i citable de l'article.
- S'assigna una especialitat només als corredors que la tenen pendent, i només si el camp
  porta exactament una categoria del joc. Es marca com a 'probable' (una sola font).
- Si el camp no existeix, no es pot llegir o porta més d'una categoria, l'especialitat queda pendent.
- Les especialitats ja assignades no es canvien: si la Viquipèdia en diu una altra, es documenta.

Escriu:
  data/specialties.json                           assignacions noves (amb font)
  data/{season}/specialty_evidence_{season}.csv   evidència per a cada corredor
"""
import csv, datetime, json, re, time

import build_data as b

MAP = [
    (r"sprint", "sprinter"),
    (r"climb|grimpeur|mountain", "climber"),
    (r"puncheur|punch", "puncheur"),
    (r"classic|cobble", "classics"),
    (r"time[ -]?trial|chrono|prologue", "tt"),
    (r"grand tour|general classification|stage race|\bgc\b", "gv"),
    (r"domestique|super-domestique|gregario|support rider", "domestique"),
]
# Termes que no indiquen cap especialitat del joc (es descarten sense fer-la ambigua).
NEUTRAL = r"all[- ]?round|rouleur|lead[- ]?out|breakaway|baroudeur|track|cyclo-?cross|mountain bik|gravel"


def enwiki_titles(qids):
    out = {}
    for i in range(0, len(qids), 50):
        data = b.get("https://www.wikidata.org/w/api.php", {
            "action": "wbgetentities", "ids": "|".join(qids[i:i + 50]), "props": "sitelinks",
            "sitefilter": "enwiki", "format": "json"}).json()
        for q, e in data.get("entities", {}).items():
            t = e.get("sitelinks", {}).get("enwiki", {}).get("title")
            if t:
                out[q] = t
        time.sleep(0.5)
    return out


def ridertype(title):
    data = b.get(b.WP, {"action": "parse", "page": title, "prop": "wikitext", "format": "json",
                        "formatversion": 2, "redirects": 1}).json()
    if "error" in data:
        raise RuntimeError(data["error"].get("info", "error"))
    text = data["parse"]["wikitext"]
    m = re.search(r"\|\s*rider[ _]?type[ \t]*=[ \t]*(.*)", text, re.I)
    if not m:
        return None
    raw = m.group(1).strip()
    if not raw or raw.startswith("|"):
        return None
    raw = re.sub(r"<ref.*?(</ref>|/>)", "", raw)
    raw = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", raw)
    raw = re.sub(r"\{\{.*?\}\}|<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", raw).strip(" ,;/") or None


def classify(raw):
    parts = [p.strip().lower() for p in re.split(r",|/|;| and |\bor\b|&|\n", raw) if p.strip()]
    found = []
    for p in parts:
        hits = {cat for pat, cat in MAP if re.search(pat, p)}
        if not hits and re.search(NEUTRAL, p):
            continue
        found += sorted(hits)
    return sorted(set(found))


def main():
    doc = json.loads((b.DATA / "riders.json").read_text(encoding="utf-8"))
    sp_doc = json.loads((b.DATA / "specialties.json").read_text(encoding="utf-8"))
    specs = sp_doc["riders"]
    season, today = doc["season"], datetime.date.today().isoformat()
    riders = [r for r in doc["riders"] if r.get("qid")]
    titles = enwiki_titles([r["qid"] for r in riders])
    rows, assigned = [], 0
    for r in riders:
        cur = specs.get(r["id"], {})
        title = titles.get(r["qid"])
        raw, cats, url, err = None, [], "", ""
        if title:
            url = "https://en.wikipedia.org/wiki/" + title.replace(" ", "_")
            try:
                raw = ridertype(title)
            except Exception as e:  # una pàgina que falla no atura la resta
                raw, err = None, str(e)[:80]
                print("error", title, e)
            time.sleep(0.3)
        if raw:
            cats = classify(raw)
        if not title:
            result = "sense article a la Viquipèdia anglesa"
        elif err:
            result = f"error de lectura: {err}"
        elif not raw:
            result = "l'article no té el camp ridertype"
        elif not cats:
            result = "el camp no correspon a cap categoria del joc"
        elif len(cats) > 1:
            result = "ambigu: " + ", ".join(cats)
        else:
            result = cats[0]
        action = "cap"
        if len(cats) == 1 and not cur.get("spec"):
            specs[r["id"]] = {"spec": cats[0], "confidence": "probable",
                              "source": url, "evidence": f"ridertype: {raw}", "checked": today}
            action, assigned = "assignada", assigned + 1
        elif len(cats) == 1 and cur.get("spec") and cur["spec"] != cats[0]:
            action = f"discrepància amb l'actual ({cur['spec']}); no es canvia"
        elif not cur.get("spec"):
            specs.setdefault(r["id"], {"spec": None, "confidence": "unknown"})
            specs[r["id"]].update({"checked": today, "evidence": result})
            action = "continua pendent"
        rows.append({"id": r["id"], "nom": r["name"], "equip": r["team"], "actual": cur.get("spec") or "",
                     "confiança_actual": cur.get("confidence", "unknown"), "font": url,
                     "ridertype": raw or "", "resultat": result, "accio": action, "data": today})
    (b.DATA / "specialties.json").write_text(json.dumps(sp_doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    out = b.DATA / str(season) / f"specialty_evidence_{season}.csv"
    with open(out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    pending = sum(1 for r in riders if not specs.get(r["id"], {}).get("spec"))
    print(f"{len(rows)} corredors revisats; {assigned} especialitats assignades; {pending} continuen pendents")


if __name__ == "__main__":
    main()
