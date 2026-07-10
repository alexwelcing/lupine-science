# Storyboard: From Predicted Crystal to Commercial Cell

**Slug:** `from-predicted-crystal-to-commercial-cell`  
**Article:** [`/articles/from-predicted-crystal-to-commercial-cell.md`](../../../articles/from-predicted-crystal-to-commercial-cell.md)  
**Visual brief:** [`/media/projects/article-visuals/BRIEF.md`](../../BRIEF.md)  
**Status:** storyboard — images not yet generated

---

## Core narrative summary

The article argues that the bottleneck in climate-materials deployment is not a shortage of computational predictions, but the absence of a trusted correction-and-verification layer between prediction and experiment. Lupine Science occupies that layer by correcting universal machine-learning interatomic potentials with a measured environment error field, deploying the correction at runtime, and verifying claims with machine-checked Lean 4 proofs. The storyboard walks from the scale of the prediction gap, through the mechanism of correction, to evidence of accuracy, then across Lupine's five target partner chains — batteries, solid-state electrolytes, direct air capture, ammonia, and solar — before closing on ecosystem economics and a call to trust the handoff.

---

## Visual 1 — Hook: The prediction-to-deployment funnel

- **Filename:** `01-prediction-funnel`
- **Title:** From 2.2 million predicted crystals to 736 synthesized
- **Type:** data-chart
- **Single idea:** Volume of predictions has outrun experimental validation by orders of magnitude, creating the gap Lupine fills.
- **Data points to show:**
  - 2.2 million crystals predicted by GNoME[^1]
  - 380,000 predicted thermodynamically stable by GNoME[^1]
  - 736 independently synthesized by late 2023[^1]
  - 0.2% validation rate (derived from 736 / 380,000)[^1]
- **Suggested form:** Funnel chart (or stacked bar descending on log scale)
- **Generation method:** matplotlib
- **Caption:** GNoME's crystal generator produced 2.2 million predictions, yet only 736 had been independently synthesized by late 2023 — a 0.2% validation rate that exposes the handoff bottleneck.[^1]

---

## Visual 2 — Problem: Handoffs where predictions die

- **Filename:** `02-handoff-chain`
- **Title:** Six handoffs, six places for a prediction to fail
- **Type:** concept-diagram
- **Single idea:** A predicted crystal must survive synthesis → coating → cell fabrication → characterization → module integration → manufacturing scale-up; each handoff introduces new error and distrust.
- **Data points to show:**
  - A-Lab: 63% reported success, but two-thirds of "novel" targets were already-known disordered phases, reducing true novel discovery to near zero[^2]
  - GNoME synthesis rate: 0.2%[^1]
- **Suggested form:** Horizontal process diagram with six linked nodes and warning flags at failure points
- **Generation method:** matplotlib/SVG
- **Caption:** Between a computational screen and a commercial product, a predicted material must survive six sequential handoffs — and current validation rates show most do not.[^1][^2]

---

## Visual 3 — Mechanism: The correction-and-verification layer

- **Filename:** `03-correction-loop`
- **Title:** How Lupine makes a uMLIP trustworthy at runtime
- **Type:** concept-diagram
- **Single idea:** Lupine measures an environment error field, applies analytic-force corrections at runtime, and wraps claims in machine-checked proofs.
- **Data points to show:**
  - 60%+ underestimation of Li⁺ migration barriers by raw uMLIPs[^chapter Batteries: From Halide Electrolyte to Solid-State Cell]
  - 5,000× change in predicted room-temperature conductivity from a 60% barrier error[^chapter Batteries: From Halide Electrolyte to Solid-State Cell]
  - 15.6% Python overhead for runtime correction; <1% target overhead in compiled LAMMPS overlay[^chapter The Verification Layer as Partnership Enabler]
- **Suggested form:** Closed-loop diagram: raw uMLIP → environment error field → corrected force → Lean 4 proof → partner handoff
- **Generation method:** matplotlib/SVG
- **Caption:** A raw universal machine-learning interatomic potential can underestimate a lithium migration barrier by 60%, shifting conductivity by 5,000×; Lupine's runtime correction and Lean 4 proofs bound that error before the next handoff.

---

## Visual 4 — Evidence: Blind prediction accuracy of the error field

- **Filename:** `04-blind-accuracy`
- **Title:** Zero-parameter blind prediction of surface energies
- **Type:** evidence-panel
- **Single idea:** The environment error field predicts surface energies it was never fitted to, with high correlation.
- **Data points to show:**
  - r = 0.906 blind prediction across 36 (model, material) combinations with zero adjustable parameters[^chapter The Verification Layer as Partnership Enabler]
- **Suggested form:** Scatter plot of predicted vs. measured surface energies with 1:1 line and inset correlation coefficient
- **Generation method:** matplotlib
- **Caption:** Across 36 model-material combinations, Lupine's environment error field achieves r = 0.906 in zero-parameter blind prediction of surface energies.[^chapter The Verification Layer as Partnership Enabler]

---

## Visual 5 — Solution: The battery cathode partner chain

- **Filename:** `05-battery-partner-chain`
- **Title:** From predicted LMR cathode to GM/LG prismatic cell
- **Type:** concept-diagram
- **Single idea:** Lupine's corrected barriers seed a four-partner chain that closes the cathode-to-cell gap.
- **Data points to show:**
  - >10⁶ compositional space ranked by corrected migration and oxygen-vacancy energies[^chapter Batteries: From Cathode Prediction to Pack Integration]
  - TexPower NMA cathodes: >230 mAh/g; 300-ton plant planned by 2027[^5]
  - Forge Nano ALD coatings: >30% cycle-life improvement, 5× resistance reduction[^6]
  - Battery500: 350 Wh/kg pouch cells, >600 cycles[^7]
  - GM/LG: prismatic LMR cells targeted for commercial production by 2028[^4]
- **Suggested form:** Sankey or left-to-right partner-chain diagram
- **Generation method:** matplotlib
- **Caption:** Lupine ranks candidates across more than a million compositions, then passes corrected cathodes through TexPower, Forge Nano, Battery500, and GM/LG toward 2028 production.[^4][^5][^6][^7]

---

## Visual 6 — Scale: Climate impact across five target markets

- **Filename:** `06-climate-scale`
- **Title:** Cumulative climate opportunity by target
- **Type:** data-chart
- **Single idea:** The five partner chains address gigatonne-scale climate problems.
- **Data points to show:**
  - LMR cathodes: 2–5 GtCO₂ cumulative avoidance potential by 2050[^chapter Batteries: From Cathode Prediction to Pack Integration]
  - Direct air capture: 100–1,000 GtCO₂ cumulative removal needed by 2100; ~10 GtCO₂/year by mid-century[^13]
  - Haber-Bosch ammonia: ~450 MtCO₂/year and 1–2% of global energy[^16]
  - Solid-state battery market: projected >10× growth over the next decade[^chapter Batteries: From Halide Electrolyte to Solid-State Cell]
- **Suggested form:** Horizontal bar chart of annual or cumulative CO₂/impact potential, grouped by target
- **Generation method:** matplotlib
- **Caption:** Lupine's five target chains — batteries, solid-state electrolytes, carbon removal, ammonia, and solar — map onto gigatonne-scale climate opportunities.[^13][^16]

---

## Visual 7 — Risk: What gets flagged before it wastes lab budget

- **Filename:** `07-impossibility-flags`
- **Title:** When correction says "no" — impossibility, not just uncertainty
- **Type:** evidence-panel
- **Single idea:** Lupine can prove a candidate lies outside the correction domain or violates a materials constraint, saving synthesis budget.
- **Data points to show:**
  - 77 build-locked Lean 4 theorems providing machine-checked guarantees[^chapter The Verification Layer as Partnership Enabler]
  - Examples to flag:
    - MOF framework outside hydrolysis-correction domain
    - Tin perovskite phase metastable by convex-hull proof
    - Ammonia catalyst requiring higher-level treatment for scaling-relation breaking[^chapter The Verification Layer as Partnership Enabler]
- **Suggested form:** Side-by-side before/after cards: "uncorrected claim" vs. "verified/ruled-out claim"
- **Generation method:** matplotlib
- **Caption:** Seventy-seven Lean 4 theorems let Lupine flag unsupported frameworks or metastable phases before they consume experimental time.[^chapter The Verification Layer as Partnership Enabler]

---

## Visual 8 — Partnership / ecosystem: Cross-cutting institutions

- **Filename:** `08-ecosystem-map`
- **Title:** NREL, UC Berkeley, and ARPA-E create economies of scope
- **Type:** concept-diagram
- **Single idea:** Three institutions span multiple target chains and multiply Lupine's partner leverage.
- **Data points to show:**
  - NREL spans four of five targets: cathodes, halide electrolytes, ammonia catalysts, perovskites[^chapter Cross-Cutting Architecture: NREL, UC Berkeley, and ARPA-E]
  - UC Berkeley spans two targets: Ceder group (batteries), Yaghi/Long groups (MOF DAC)[^chapter Cross-Cutting Architecture: NREL, UC Berkeley, and ARPA-E]
  - ARPA-E programs: REFUEL (ammonia), IONICS (halide electrolytes), OPEN (MOF DAC)[^chapter Cross-Cutting Architecture: NREL, UC Berkeley, and ARPA-E]
- **Suggested form:** Network diagram with Lupine at center, five targets as nodes, and three cross-cutting institutions as overlapping halos
- **Generation method:** matplotlib/networkx
- **Caption:** A single NREL master CRADA and one UC Berkeley campus partnership give Lupine coverage across four of five target chains, while coordinated ARPA-E submissions provide non-dilutive validation.[^chapter Cross-Cutting Architecture: NREL, UC Berkeley, and ARPA-E]

---

## Visual 9 — Economics / moat: The value of trusted materials infrastructure

- **Filename:** `09-materials-genome-value`
- **Title:** The economic case for a verification layer
- **Type:** data-chart
- **Single idea:** The market values the infrastructure that turns predictions into products.
- **Data points to show:**
  - NIST Materials Genome Initiative analysis: $123 billion–$270 billion in annual value from improved materials innovation infrastructure[^23]
  - ARPA-E portfolio: catalyzed billions of dollars in private follow-on funding[^22]
- **Suggested form:** Range bar or simple comparison chart
- **Generation method:** matplotlib
- **Caption:** The NIST Materials Genome Initiative estimates $123 billion–$270 billion in annual value from better materials innovation infrastructure, while ARPA-E's portfolio has catalyzed billions in follow-on funding.[^22][^23]

---

## Visual 10 — Call to action: Trust as the scarce resource

- **Filename:** `10-crystal-to-cell`
- **Title:** The scarce resource is trust
- **Type:** scene-illustration
- **Single idea:** A predicted crystal becomes a commercial cell only when every handoff carries a bounded, documented error budget.
- **Data points to show:**
  - 0.2% GNoME validation rate without trust layer[^1]
  - r = 0.906 blind surface-energy prediction with correction[^chapter The Verification Layer as Partnership Enabler]
  - 77 Lean 4 theorems[^chapter The Verification Layer as Partnership Enabler]
- **Suggested form:** MiniMax-generated scene: a crystal lattice morphing through a pipeline of lab benches, manufacturing equipment, and a final cell/module, with a shield/badge symbolizing verification
- **Generation method:** MiniMax image client
- **Caption:** In a discovery ecosystem that must scale from thousands to millions of validated materials per year, the scarce resource is the trust that turns a predicted crystal into a commercial cell.[^1]

---

## Visual type tally

| Type              | Count |
|-------------------|-------|
| data-chart        | 4     |
| concept-diagram   | 4     |
| evidence-panel    | 1     |
| scene-illustration| 1     |
| **Total**         | **10**|

---

## Narrative arc check

| Required beat          | Visual(s) |
|------------------------|-----------|
| Hook                   | 1         |
| Problem                | 2         |
| Mechanism              | 3         |
| Evidence               | 4         |
| Solution               | 5         |
| Scale                  | 6         |
| Risk                   | 7         |
| Partnership / ecosystem| 8         |
| Economics / moat       | 9         |
| Call to action         | 10        |
