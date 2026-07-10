# Storyboard: Critical Minerals, PFAS, and the Remediation Imperative

**Slug:** `critical-minerals-pfas-and-the-remediation-imperative`  
**Article date:** 2026-07-16  
**Visual count:** 10  
**Output directory:** `/media/projects/article-visuals/articles/`

---

## Core narrative summary

The energy transition and the PFAS crisis are two sides of the same atoms problem. Critical-mineral recovery and forever-chemical remediation both depend on predicting binding and activation energies in flexible, under-coordinated environments — the exact place where universal machine-learning interatomic potentials systematically soften the potential energy surface. The article argues that Lupine's correction-and-verification layer, built for climate-critical materials, applies directly to both domains: it recovers accurate site-selectivity energies for lithium sorbents and Co/Ni extractants, filters false-positive defluorination catalysts, and machine-checks which predictions can be trusted. Treating mineral recovery and PFAS destruction as one unified discovery problem is the fastest way to make progress on either.

---

## Visual 1 — `01-atoms-problem`

- **Title:** The Atoms Problem Behind the Energy Transition
- **Type:** data-chart
- **Single idea:** Clean-energy demand is projected to multiply mineral requirements several-fold by 2040, making atoms a binding constraint on decarbonization.
- **Data points to show:**
  - Projected increase in clean-energy mineral demand by 2040: **4–6×** relative to today [^1].
  - Demand driver categories: batteries, wind turbines, grid storage, electric vehicles (qualitative, from article narrative).
- **Suggested form:** Horizontal bar or area chart showing demand-multiplier ranges by mineral/application; warm-paper background with indigo bars and amber highlights.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Clean-energy technologies are expected to drive a four- to six-fold increase in mineral demand by 2040, turning atoms into a central constraint on the energy transition. *Source: IEA, The Role of Critical Minerals in Clean Energy Transitions, 2022.*

---

## Visual 2 — `02-pfas-contamination-map`

- **Title:** PFAS in the Environment: Eighty Thousand Sites and Counting
- **Type:** scene-illustration
- **Single idea:** PFAS contamination is geographically widespread, persistent, and expensive, with regulatory limits now in the nanogram-per-litre range.
- **Data points to show:**
  - EPA maximum contaminant level for PFOA and PFOS in drinking water: **4 ng L⁻¹** [^2].
  - Identified PFAS contamination sites in the United States: **>80,000** [^9].
  - Remediation cost per site per year: **$1–5 million USD** [^9].
  - Global PFAS remediation market by 2030: **$5–10 billion USD** [^10].
- **Suggested form:** Stylized U.S. map with graduated markers for contamination density, overlaid with a small inset showing the 4 ng/L drinking-water threshold; use soft indigo wash background with rose-alert markers.
- **Generation:** MiniMax image client
- **Caption:** More than eighty thousand PFAS contamination sites have been identified in the United States, with remediation costs reaching one to five million dollars per site per year. *Sources: Environmental Working Group / U.S. EPA; industry analyst estimates.*

---

## Visual 3 — `03-carbon-fluorine-backbone`

- **Title:** The Bond That Makes PFAS Forever
- **Type:** concept-diagram
- **Single idea:** The carbon–fluorine bond is one of the strongest in organic chemistry, which gives PFAS its utility and its environmental persistence.
- **Data points to show:**
  - C–F bond dissociation energy: **≈485 kJ mol⁻¹** [^7].
  - Comparison bond energies (optional context): C–H ≈ 413 kJ mol⁻¹, C–C ≈ 348 kJ mol⁻¹.
- **Suggested form:** Molecular lattice / ball-and-stick diagram of a short PFAS chain with the C–F bond highlighted and annotated with dissociation energy; include a small bar comparing C–F to common organic bonds.
- **Generation:** Programmatic (matplotlib/SVG)
- **Caption:** The carbon–fluorine bond, with a dissociation energy of roughly 485 kJ mol⁻¹, is what makes PFAS both extraordinarily useful and extraordinarily persistent. *Source: B. E. Smart, Kirk-Othmer Encyclopedia of Chemical Technology, 4th ed., Wiley, 1994.*

---

## Visual 4 — `04-umlip-softening-error`

- **Title:** Why Raw uMLIPs Misrank Candidates in Under-Coordinated Environments
- **Type:** evidence-panel
- **Single idea:** Universal ML interatomic potentials systematically soften the potential energy surface at low-coordination sites, corrupting the binding and barrier energies that control sorbent, extractant, and catalyst performance.
- **Data points to show:**
  - Potential-energy-surface softening in under-coordinated regions: **15–60%** [^11].
  - Coordination-number range of largest errors: **4–8** [^11].
  - Reference bulk coordination (error defined as zero): **12** (fcc) [^12].
- **Suggested form:** Two-panel figure — left panel scatter of predicted vs. reference energy with softening bias at low coordination, right panel error magnitude vs. coordination number; annotate CN = 4–8 danger zone.
- **Generation:** Programmatic (matplotlib)
- **Caption:** A systematic survey found that universal machine-learning interatomic potentials soften the potential energy surface by 15–60% in under-coordinated regions, with the largest errors at coordination numbers of four to eight. *Source: B. Deng et al., npj Computational Materials 11, 9 (2025).*

---

## Visual 5 — `05-correction-layer`

- **Title:** The Lupine Correction Layer
- **Type:** concept-diagram
- **Single idea:** An environment error field, anchored to high-fidelity reference observables and interpolated with a bulk constraint, adds analytic corrections to uMLIP forces and energies at runtime.
- **Data points to show:**
  - Bulk reference coordination number: **12** (error = 0) [^12].
  - Number of anchor observables: **3** [^12].
  - Blind prediction Pearson r across 36 (model, material) combinations: **r = 0.906** (p = 10⁻⁴, 95% CI [0.82, 0.96]) [^12].
  - Speed advantage over DFT retained by corrected uMLIPs: **≈5 orders of magnitude** [^12].
  - Build-locked Lean 4 theorems: **77** with zero sorry proofs [^12].
- **Suggested form:** Funnel / flow diagram showing raw uMLIP → local environment descriptor → error-field lookup → corrected forces/energies → verification gate (Lean theorems); inset scatter of r = 0.906.
- **Generation:** Programmatic (matplotlib/SVG)
- **Caption:** Lupine's environment error field corrects uMLIP predictions at runtime, achieving a Pearson correlation of 0.906 in blind tests while retaining a roughly five-order-of-magnitude speed advantage over DFT. *Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.*

---

## Visual 6 — `06-unified-campaign`

- **Title:** One Discovery Campaign for Two Imperatives
- **Type:** concept-diagram
- **Single idea:** Critical-mineral recovery and PFAS remediation share the same computational primitives, so a single three-layer campaign can screen, prioritize, and verify candidates for both.
- **Data points to show:**
  - Shared primitives: corrected binding energies, corrected activation barriers, metastable-phase ranking, machine-checked domain boundaries.
  - Application examples mapped to each layer: Li⁺/Mg²⁺ sorbents, Co/Ni extractants, PFAS sorbents, C–F defluorination catalysts.
- **Suggested form:** Three-layer horizontal process diagram (screen → selective field failure → synthesis-aware verification), with vertical branches showing critical minerals on one side and PFAS on the other converging on the same primitives.
- **Generation:** Programmatic (matplotlib/SVG)
- **Caption:** The same corrected binding energies, activation barriers, and verification discipline apply whether the goal is recovering critical minerals or destroying PFAS.

---

## Visual 7 — `07-supply-risk-landscape`

- **Title:** The Geopolitical and Technical Risks of Mineral Supply
- **Type:** data-chart
- **Single idea:** Concentrated primary supply and blunt recycling flowsheets make critical-mineral availability a price, ethical, and energy-risk problem.
- **Data points to show:**
  - Share of mined cobalt from the Democratic Republic of Congo: **≈70%** [^3].
  - Conventional brine evaporation lithium recovery: **30–50%** over **12–24 months** [^6].
  - Projected global battery recycling market by 2030: **$35–50 billion USD** [^4].
  - Direct-recycling energy savings vs. conventional routes: **50–80%** [^5].
- **Suggested form:** Grouped bar chart or Sankey showing supply concentration, recovery losses, and market potential side by side; use rose for risk, sage for recycling opportunity.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Roughly seventy percent of mined cobalt comes from a single jurisdiction, while direct recycling could cut energy use by fifty to eighty percent — if the materials science can be solved. *Sources: U.S. Geological Survey / Benchmark Mineral Intelligence; ReCell Center / U.S. DOE; industry analyst estimates.*

---

## Visual 8 — `08-recovery-ecosystem`

- **Title:** The Critical-Mineral Recovery Ecosystem
- **Type:** concept-diagram
- **Single idea:** Selective sorbents, extractants, and direct-recycling reconstruction conditions form an integrated ecosystem whose economics depend on the same corrected local-environment energetics.
- **Data points to show:**
  - Direct lithium extraction target recovery: **>80%** in hours [^6].
  - Ions to discriminate in brine: Li⁺, Na⁺, K⁺, Mg²⁺, Ca²⁺ [^6].
  - Key Co/Ni separation reagent class: phosphinic-acid extractants (e.g., Cyanex 272).
  - Direct-recycling control knobs: re-lithiation, transition-metal reordering, oxygen-vacancy healing [^5].
- **Suggested form:** Sankey / process-flow diagram linking spent batteries and brine to recycling, DLE, and direct-recycling outputs, with annotation boxes showing where corrected binding energies and migration barriers enter each step.
- **Generation:** Programmatic (matplotlib/SVG)
- **Caption:** Selective sorbents, phosphinic-acid extractants, and direct-recycling reconstruction conditions all rely on accurate binding and migration energies in flexible, under-coordinated environments. *Sources: J. E. Plevin et al., Resources, Conservation and Recycling (2024); ReCell Center / U.S. DOE.*

---

## Visual 9 — `09-market-opportunity`

- **Title:** The Economics of Trustworthy Prediction
- **Type:** data-chart
- **Single idea:** The combined market opportunity and performance upside justifies a unified prediction-trust platform because the underlying problems are materials-limited and the limitation is prediction accuracy.
- **Data points to show:**
  - Clean-energy mineral demand growth by 2040: **4–6×** [^1].
  - Global battery recycling market by 2030: **$35–50 billion USD** [^4].
  - Global PFAS remediation market by 2030: **$5–10 billion USD** [^10].
  - Potential catalytic PFAS destruction cost reduction vs. incineration: **50–80%** (article narrative; labeled as illustrative scenario).
- **Suggested form:** Funnel or grouped horizontal bar chart comparing current-state losses/costs to corrected-state market sizes and recovery rates; indigo for mineral markets, amber for PFAS markets.
- **Generation:** Programmatic (matplotlib)
- **Caption:** A prediction-trust platform that addresses both critical-mineral recovery and PFAS remediation sits at the intersection of two multi-billion-dollar markets driven by four- to six-fold demand growth. *Sources: IEA (2022); industry analyst estimates.*

---

## Visual 10 — `10-one-geometry-two-imperatives`

- **Title:** One Geometry, Two Imperatives
- **Type:** scene-illustration
- **Single idea:** The same local-geometry problem links two urgent missions — putting scarce atoms back into use and removing harmful atoms from circulation.
- **Data points to show:**
  - Conceptual pairing: mineral recovery (scarce atoms in) and PFAS remediation (harmful atoms out).
  - Shared correction layer as the bridge.
- **Suggested form:** Split narrative scene — left side showing lithium ions moving through a selective sorbent lattice, right side showing PFAS molecules approaching a catalytic surface, both converging toward a central "correction field" represented as a glowing lattice or field lines; warm paper and soft indigo wash background.
- **Generation:** MiniMax image client
- **Caption:** Critical-mineral recovery and PFAS remediation sit on opposite sides of the industrial metabolism, but they share the same geometry of binding and barrier energies in under-coordinated environments.

---

## Type tally

| Type | Count |
|------|-------|
| data-chart | 3 |
| concept-diagram | 4 |
| evidence-panel | 1 |
| scene-illustration | 2 |
| **Total** | **10** |

---

## Generation method tally

| Method | Count |
|--------|-------|
| Programmatic (matplotlib / SVG) | 8 |
| MiniMax image client | 2 |
