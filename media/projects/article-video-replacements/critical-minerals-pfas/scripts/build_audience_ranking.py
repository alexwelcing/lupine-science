#!/usr/bin/env python3
"""Build the transparent audience-priority ranking for remaining article films.

Placement is based on generated public HTML at base commit e0cccac. Topic and public-
relevance scores are explicitly editorial proxies, not analytics or search-volume claims.
Readiness/urgency use the dated 2026-08-11 replacement inventory as discovery evidence.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEIGHTS = {
    "firstPartyPlacement": 0.30,
    "topicAccessibility": 0.25,
    "publicRelevance": 0.20,
    "replacementUrgency": 0.15,
    "releaseReadiness": 0.10,
}
# Scores are 0..5. Comments are mandatory because two dimensions are editorial.
ROWS = [
    ("critical-minerals-pfas-and-the-remediation-imperative", "Critical Minerals, PFAS, and the Remediation Imperative", [5.0,5.0,5.0,4.0,5.0], "Homepage feature; PFAS public-search hook plus critical-mineral/battery reach; passing audio; current film is chart/flowchart dominated."),
    ("cement-concrete-and-the-weight-of-the-built-world", "Cement, Concrete, and the Weight of the Built World", [5.0,4.8,5.0,4.0,5.0], "Homepage feature; universal built-environment relevance; passing audio; deterministic rebuild ready."),
    ("methane-and-refrigerants-cutting-the-non-co2-climate-forcers", "Methane and Refrigerants: Cutting the Non-CO₂ Climate Forcers", [5.0,4.7,5.0,4.0,5.0], "Homepage feature; strong climate/policy and household-refrigeration hook; passing audio; deterministic rebuild ready."),
    ("five-materials-for-5-to-12-gtco2-year", "Five Materials That Could Unlock 5–12 GtCO₂/Year", [5.0,4.7,4.8,5.0,2.0], "Homepage feature and broad list-format appeal; known obscured-text defects; claim-heavy treatment requires a new source-bound scene contract."),
    ("why-lupi", "Why LUPI?", [2.2,4.7,4.2,3.0,2.0], "Core product-intent search; published; audio true-peak defect requires remaster before release."),
    ("why-lupine-science", "Why Lupine Science?", [2.0,4.6,4.2,3.5,5.0], "Core institutional-intent search; published; passing audio and deterministic rebuild ready."),
    ("beyond-carbon-the-error-geometry-of-environmental-materials", "Beyond Carbon: The Error Geometry of Environmental Materials", [4.7,4.0,4.6,5.0,2.0], "Homepage-prominent umbrella topic; known weak opening, undersized type, collision, and empty-transition defects; requires authored contract."),
    ("the-trust-layer", "The Trust Layer", [2.5,4.0,4.0,3.0,2.0], "Central product thesis and published route; audio loudness defect requires remaster."),
    ("the-02-percent-synthesis-problem", "The 0.2% Synthesis Problem", [2.7,4.5,4.2,3.5,5.0], "Strong curiosity/title hook and makeability problem; passing audio; deterministic rebuild ready."),
    ("from-predicted-crystal-to-commercial-cell", "From Predicted Crystal to Commercial Cell", [3.0,4.2,4.3,3.5,5.0], "Accessible lab-to-market story; passing audio; deterministic rebuild ready."),
    ("lupi-hfc-refrigerant-research-payloads", "Lupi Gains HFC Refrigerant Research Payloads", [3.4,4.0,4.5,3.0,5.0], "Upper video-index placement and refrigerant relevance; narrower product-update framing; passing audio."),
    ("investing-in-the-trust-layer", "Investing in the Trust Layer", [2.8,4.1,3.8,5.0,2.0], "Clear investor intent; known timing, typography, collision, and terminal-hold defects; requires authored contract."),
    ("from-fantasy-frameworks-to-makeable-materials", "From Fantasy Frameworks to Makeable Materials", [4.0,3.6,3.7,3.5,5.0], "Homepage-prominent and strong makeability hook; MOF-specific audience; passing audio."),
    ("a-field-not-a-neural-net", "A Field, Not a Neural Net", [3.2,3.7,3.8,2.5,5.0], "Strong conceptual title and upper-mid video placement; passing automated gates but narrower MLIP audience."),
    ("a-smooth-environment-resolved-error-field", "A Smooth Environment-Resolved Error Field", [2.4,2.8,3.3,3.0,2.0], "Published foundational result but highly technical title; true-peak remaster required."),
    ("the-materials-we-test-against", "The Z1 Barrier Panel", [4.2,2.8,3.2,3.0,2.0], "High video-index placement but specialist benchmark intent; audio loudness remaster required."),
    ("the-savings-stack", "The Savings Stack", [4.3,3.7,3.6,3.0,1.5], "High video-index/homepage placement and accessible savings hook; frozen-economics conflict plus audio remaster lower readiness."),
    ("an-order-of-effort", "An Order of Effort", [4.2,3.0,3.3,3.0,2.0], "High video-index/homepage placement but abstract title; audio loudness remaster required."),
    ("the-order-is-right-the-size-is-wrong", "The Order Is Right, the Size Is Wrong", [3.8,3.5,3.4,3.0,1.5], "Homepage-visible and curiosity-led title; evidence-heavy status plus true-peak remaster lower readiness."),
    ("rhizo-non-co2-climate-forcers-lean", "Non-CO₂ Climate Forcers, Now Formalized in Lean", [3.3,3.2,4.0,3.0,2.0], "Climate hook but formal-methods framing narrows audience; true-peak remaster required."),
    ("z1-union-debrief", "The Union Verdict: A De-brief on the Z1 Campaign", [4.5,2.6,2.8,3.0,1.0], "First video-index position but editor-review status, specialist campaign context, economics guardrails, and audio remaster make it a poor early replacement."),
]

def main() -> None:
    ranked=[]
    for slug,title,vals,rationale in ROWS:
        scores=dict(zip(WEIGHTS,vals))
        weighted=sum(scores[k]*WEIGHTS[k] for k in WEIGHTS)
        ranked.append({"slug":slug,"title":title,"score":round(weighted*20,1),"scores":scores,"rationale":rationale})
    ranked.sort(key=lambda x:(-x["score"],x["slug"]))
    for i,row in enumerate(ranked,1): row["rank"]=i
    payload={
      "schemaVersion":1,
      "baseCommit":"e0cccacca7e8050d6fb6d208cce3248689653532",
      "status":"planning-proxy-not-analytics",
      "analyticsAvailable":False,
      "disclaimer":"No first-party pageview analytics were found. Topic accessibility and public relevance are editorial proxies, not measured traffic or search volume.",
      "weights":WEIGHTS,
      "scoreRange":"0..100",
      "completedExcluded":["water-and-air-correcting-the-molecules-we-drink-and-breathe"],
      "ranking":ranked
    }
    (ROOT/"audience-priority-ranking.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n")
    lines=["# Remaining article-film audience priority","",payload["disclaimer"],"", "| Rank | Score | Film | Readiness note |","|---:|---:|---|---|"]
    for r in ranked: lines.append(f"| {r['rank']} | {r['score']:.1f} | {r['title']} | {r['rationale']} |")
    lines += ["","## Rubric",""]+[f"- {int(v*100)}% `{k}`" for k,v in WEIGHTS.items()]
    (ROOT/"audience-priority-ranking.md").write_text("\n".join(lines)+"\n")
    print(json.dumps({"decision":"pass","films":len(ranked),"topFive":[{"rank":r['rank'],"slug":r['slug'],"score":r['score']} for r in ranked[:5]]},indent=2))
if __name__=="__main__": main()
