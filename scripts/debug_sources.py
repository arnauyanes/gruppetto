#!/usr/bin/env python3
"""Diagnòstic: desa a data/debug/ mostres de les fonts per ajustar build_data.py."""
import json, re
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))
import build_data as b

OUT = b.DATA / "debug"
OUT.mkdir(exist_ok=True)

page = "List of 2026 UCI WorldTeams and riders"
wt = b.get(b.WP, {"action": "parse", "page": page, "prop": "wikitext", "format": "json", "formatversion": 2}).json()
text = wt["parse"]["wikitext"]
i = text.find("Riders")
(OUT / "roster_wikitext.txt").write_text(f"total chars: {len(text)}\n\n" + text[:3000] + "\n\n=====RIDERS=====\n\n" + text[i:i + 12000])

html = b.get(b.WP, {"action": "parse", "page": page, "prop": "text", "format": "json", "formatversion": 2}).json()["parse"]["text"]
from bs4 import BeautifulSoup
soup = BeautifulSoup(html, "html.parser")
lines = []
for el in soup.find_all(["h2", "h3", "h4", "table", "caption"])[:120]:
    lines.append(f"<{el.name} class={el.get('class')}> {el.get_text(' ', strip=True)[:120]}")
first_tables = soup.find_all("table")[:4]
(OUT / "roster_html.txt").write_text("\n".join(lines) + "\n\n=====TABLES=====\n\n" + "\n\n".join(str(t)[:4000] for t in first_tables))

ids = b.wikidata_ids(["Tour de France", "2025 Tour de France", "Paris–Roubaix", "2025 Paris–Roubaix", "Tadej Pogačar"])
res = {"ids": ids}
for name in ["2025 Tour de France", "2025 Paris–Roubaix"]:
    q = ids.get(name)
    if q:
        res[name] = b.sparql(f"""
SELECT ?p ?pLabel ?v ?vLabel WHERE {{
  wd:{q} ?pd ?v . ?p wikibase:directClaim ?pd .
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}} LIMIT 200""")
        res[name + " winner statements"] = b.sparql(f"""
SELECT ?w ?wLabel ?pq ?qv ?qvLabel WHERE {{
  wd:{q} p:P1346 ?st . ?st ps:P1346 ?w .
  OPTIONAL {{ ?st ?pq ?qv . ?qp wikibase:qualifier ?pq . }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}""")
p = ids.get("Tadej Pogačar")
if p:
    res["pogacar claims"] = b.sparql(f"""
SELECT ?p ?pLabel ?v ?vLabel WHERE {{
  wd:{p} ?pd ?v . ?p wikibase:directClaim ?pd .
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}} LIMIT 300""")
(OUT / "wikidata.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
print("ok")
