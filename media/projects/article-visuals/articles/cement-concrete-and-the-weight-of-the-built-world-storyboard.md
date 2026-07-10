# Storyboard: Cement, Concrete, and the Weight of the Built World

**Article slug:** `cement-concrete-and-the-weight-of-the-built-world`  
**Output naming:** `<slug>-<nn>-<short-name>.jpg`

## Core narrative summary

Concrete is the world’s most-used manufactured material, and its binder — ordinary Portland cement — emits roughly 2.8 GtCO₂ per year, about 8% of anthropogenic CO₂. Roughly 60% of those emissions are intrinsic process emissions from limestone calcination, so decarbonization cannot be solved by clean kilns alone. The article argues that cement is a materials-discovery problem: the most promising low-carbon pathways (alternative binders, alternative clinkers, and CO₂-cured concrete) all depend on amorphous, metastable, or multi-component phases that are hard to model. Universal machine-learning interatomic potentials (uMLIPs) systematically soften the energy surface in these under-coordinated environments, corrupting rankings. Lupine’s correction-and-verification layer measures that error field, applies analytic corrections at near-uMLIP speed, and uses machine-checked theorems to draw a bright line between supported predictions and synthesis-dependent promises — turning a prediction-trust bottleneck into a scalable decarbonization platform.

## Visuals

### 01 — Global Footprint
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-01-global-footprint.jpg`
- **Title:** The 2.8-Gigaton Footprint
- **Type:** data-chart
- **Single idea:** Cement is one of the largest industrial CO₂ sources, and most of the problem is chemistry, not just fuel.
- **Data points to show:**
  - Global cement CO₂ emissions: ~2.8 GtCO₂/year [^1][^11]
  - Share of anthropogenic CO₂: ~8% [^1][^11]
  - Process emissions from limestone calcination: ~60% of total cement emissions [^1]
  - Fuel combustion emissions: ~40% of total cement emissions [^1]
- **Suggested form:** Split stacked bar or two-segment donut (process vs. fuel) in brand indigo and amber.
- **Generation:** matplotlib
- **Caption:** Global cement manufacturing emits about 2.8 GtCO₂ annually, with roughly 60% coming from limestone calcination rather than fuel combustion. *Sources: IEA/GCCA 2024; IPCC AR6.*

### 02 — The Calcination Trap
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-02-calcination-trap.jpg`
- **Title:** The Process-Emissions Trap
- **Type:** concept-diagram
- **Single idea:** As long as limestone is the calcium feedstock, CO₂ is an unavoidable product of the chemistry.
- **Data points to show:**
  - Kiln temperature for Portland cement: ~1,450 °C [^1]
  - Calcination reaction: CaCO₃ → CaO + CO₂ [^1]
  - Process emissions share: ~60% of cement CO₂ [^1]
- **Suggested form:** Process-flow diagram with limestone input, rotary kiln, clinker output, and a locked “CO₂ out” arrow that cannot be eliminated by fuel switching.
- **Generation:** matplotlib/SVG
- **Caption:** Clean energy can shrink fuel emissions, but the calcination of limestone releases CO₂ regardless of the heat source. *Source: IEA/GCCA 2024.*

### 03 — Where uMLIPs Soften
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-03-softening-field.jpg`
- **Title:** Where Universal Potentials Lose Trust
- **Type:** concept-diagram
- **Single idea:** uMLIPs systematically soften energies in the under-coordinated environments that dominate cement function.
- **Data points to show:**
  - Energy-surface softening in under-coordinated regions: 15–60% [^2]
  - Largest errors at coordination numbers: 4–8 [^2]
  - Representative coordination states: Q¹, Q², Q³ silicate species; tetrahedral/pentahedral/octahedral Al [^2]
- **Suggested form:** Lattice/error-field heatmap showing a crystalline bulk region (low error) dissolving into under-coordinated surface/gel species (high error), with a color gradient.
- **Generation:** matplotlib
- **Caption:** In dissolved silicates, gel pores, and hydrate interfaces, coordination numbers fall outside the bulk training data and uMLIPs soften energies by 15–60%. *Source: Deng et al., npj Comput. Mater. 2025.*

### 04 — Blind Prediction Accuracy
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-04-blind-accuracy.jpg`
- **Title:** Correction Restores Rank Order
- **Type:** evidence-panel
- **Single idea:** Lupine’s environment error field produces a measured, zero-parameter correction that preserves prediction rank across materials.
- **Data points to show:**
  - Pearson correlation coefficient: r = 0.906 [^3]
  - p-value: p = 10⁻⁴ [^3]
  - 95% confidence interval: [0.82, 0.96] [^3]
  - Number of (model, material) combinations: 36 [^3]
  - Runtime overhead of current Python implementation: 15.6% [^3]
- **Suggested form:** Side-by-side scatter panel: raw uMLIP vs. reference on the left (scattered), corrected vs. reference on the right (tight around identity line) with an inset metrics box.
- **Generation:** matplotlib
- **Caption:** Across 36 blind (model, material) combinations, Lupine’s correction achieves r = 0.906 with zero fitted parameters, recovering trustworthy rank order. *Source: Lupine Science, Strategic Discovery Plan.*

### 05 — The Correction Loop
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-05-correction-loop.jpg`
- **Title:** Measure, Correct, Prove
- **Type:** concept-diagram
- **Single idea:** The platform closes the loop between fast uMLIP screening and machine-checked trust.
- **Data points to show:**
  - uMLIP speedup vs. DFT: ~10⁵× [^3]
  - Correction runtime overhead: 15.6% (Python), target <1% (compiled LAMMPS overlay) [^3]
  - Build-locked Lean 4 theorems: 77, zero `sorry` proofs [^3]
- **Suggested form:** Circular loop diagram: anchor observables → error field → analytic correction → molecular dynamics/screening → verification theorem → claim boundary.
- **Generation:** matplotlib/SVG
- **Caption:** Lupine measures the error field, applies an analytic correction at nearly uMLIP speed, and proves which predictions are supported by 77 build-locked theorems. *Source: Lupine Science, Strategic Discovery Plan.*

### 06 — Three Routes to Lower-CO₂ Cement
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-06-three-routes.jpg`
- **Title:** Three Discovery Fronts
- **Type:** data-chart
- **Single idea:** Alternative binders, alternative clinkers, and CO₂ curing each cut emissions by different mechanisms and amounts.
- **Data points to show:**
  - LC³ (calcined clay + limestone): 30–50% reduction in clinker factor [^4]
  - CSA clinker: firing temperature 1,200–1,300 °C vs. 1,450 °C for OPC; 20–35% lower process emissions [^6]
  - CO₂-cured concrete: 5–25% CO₂ uptake by mass of binder [^7][^8]
- **Suggested form:** Grouped horizontal bar chart with three categories (binders, clinkers, curing) and two metrics each (emissions cut / clinker reduction, temperature, or uptake).
- **Generation:** matplotlib
- **Caption:** Low-carbon cement routes range from LC³’s 30–50% clinker reduction to CSA clinkers fired 150–250 °C cooler and CO₂-cured systems that sequester 5–25% binder-mass CO₂. *Sources: Scrivener et al. 2018; Habert et al. 2020; Skocek et al. 2021; Sanna et al. 2013.*

### 07 — Metastability Is Not a Bug
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-07-metastability.jpg`
- **Title:** The Metastability Problem
- **Type:** concept-diagram
- **Single idea:** The most useful cement phases sit above the convex hull; equilibrium-only screens discard the best candidates.
- **Data points to show:**
  - Key metastable functional phases: ettringite, AFm phases, certain C-S-H compositions [^3]
  - Synthesis-validated predicted materials: ~0.2% (the “0.2% synthesis problem”) [^3]
- **Suggested form:** Convex-hull free-energy scatter with equilibrium hull line and a shaded “functional but metastable” zone containing labeled phases.
- **Generation:** matplotlib
- **Caption:** Essential phases such as ettringite and AFm are metastable, so convex-hull thermodynamics alone discards the very materials a low-carbon screen must evaluate. *Source: Lupine Science, Strategic Discovery Plan.*

### 08 — From Lab Bench to Kiln
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-08-lab-to-kiln.jpg`
- **Title:** The Partnership Chain
- **Type:** scene-illustration
- **Single idea:** Trustworthy predictions create a shared reference point for modelers, experimentalists, plant operators, and investors.
- **Data points to show:**
  - Stakeholders to depict: computational chemists, experimental materials labs, rotary-kiln operators, climate-tech investors, offtake partners
- **Suggested form:** Narrative scene: a lab bench with screens and molecular models in the foreground, a kiln and precast plant in the midground, and investors/offtakers reviewing a verification report in the background, tied together by a single pipeline.
- **Generation:** MiniMax image client
- **Caption:** A machine-checked boundary between supported and unsupported claims lets modelers, plant operators, and investors speak the same language.

### 09 — The 100,000× Speed Advantage
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-09-speed-advantage.jpg`
- **Title:** The Computational Moat
- **Type:** data-chart
- **Single idea:** uMLIP screening makes multi-component composition spaces searchable, and the correction keeps those searches trustworthy.
- **Data points to show:**
  - Candidate clinker compositions when dopants/substituents/processing are included: >10⁵ [^3]
  - uMLIP speedup vs. DFT: ~10⁵× [^3]
  - Correction runtime overhead: 15.6% [^3]
- **Suggested form:** Log-scale bar chart comparing DFT, raw uMLIP, and corrected uMLIP cost per composition, plus a small inset showing searchable space size.
- **Generation:** matplotlib
- **Caption:** With >10⁵ candidate compositions to explore and a ~10⁵× speed advantage over DFT, corrected uMLIP screening turns an intractable search into a routine one. *Source: Lupine Science, Strategic Discovery Plan.*

### 10 — The Trust Bottleneck
- **Filename:** `cement-concrete-and-the-weight-of-the-built-world-10-trust-bottleneck.jpg`
- **Title:** From Candidates to Deployed Binders
- **Type:** data-chart
- **Single idea:** The real bottleneck is not a shortage of candidates but a shortage of trustworthy, verifiable predictions.
- **Data points to show:**
  - Predicted crystal structures in large databases: millions [^3]
  - Independently synthesis-validated fraction: ~0.2% [^3]
  - Cement sector emissions at stake: ~2.8 GtCO₂/year [^1][^11]
- **Suggested form:** Funnel chart: millions of candidate materials → corrected predictions → verified formulations → deployed low-carbon binders, with the synthesis gap highlighted.
- **Generation:** matplotlib
- **Caption:** Millions of candidate materials have been predicted, yet only about 0.2% have been validated by synthesis — closing that trust gap is what unlocks cement’s 2.8 GtCO₂ problem. *Sources: Lupine Science, Strategic Discovery Plan; IEA/GCCA 2024; IPCC AR6.*

## Visual type counts

- **Data charts:** 4 (01, 06, 09, 10)
- **Concept diagrams:** 4 (02, 03, 05, 07)
- **Evidence panels:** 1 (04)
- **Scene illustrations:** 1 (08)
