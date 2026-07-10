# Storyboard: Beyond Carbon — The Error Geometry of Environmental Materials

## Article core narrative

The article argues that the failure of computational materials discovery in climate-critical systems is not climate-specific; it is **coordination-specific**. Universal machine-learning interatomic potentials (uMLIPs) are accurate for bulk, high-coordination environments but systematically soften under-coordinated regions—pores, surfaces, vacancies, and transition states—by **15–60%**. This defect/bulk asymmetry, combined with the combinatorial wall, metastability, and ranking inversion, corrupts predictions across water, air, methane, refrigerants, critical minerals, PFAS, and cement. Lupine's response is a correction-and-verification layer: a measured environment error field, analytic force corrections added at runtime, and machine-checked proof boundaries that separate supported predictions from unsupported ones. The same layer that fixes climate-critical materials therefore becomes a platform for any material whose function is governed by under-coordinated atomic environments.

---

## Visuals

### 1. `01-seven-domains-one-error`
- **Title:** One Geometry, Seven Planetary Boundaries
- **Type:** scene-illustration
- **Single idea:** A shared under-coordination error corrupts discovery in seven environmental domains at once.
- **Data points to show:**
  - Water scarcity affects ~2 billion people; a 40% global freshwater deficit is projected by 2030 [^3].
  - Outdoor air pollution causes 4–7 million premature deaths annually [^6].
  - Methane is responsible for ~30% of current global warming; GWP₂₀ = 80–85× CO₂ [^8].
  - HFC phase-down under the Kigali Amendment could avoid up to 0.5 °C of warming by 2100 [^10].
  - Clean-energy mineral demand is projected to rise 4–6× by 2040 [^11].
  - The C–F bond dissociation energy is ~485 kJ mol⁻¹ [^12].
  - Cement production emits ~2.8 GtCO₂ yr⁻¹, ~8% of global CO₂ [^13].
- **Suggested form:** Split globe / radial lattice scene showing a central coordination-error field radiating into the seven target areas.
- **Generation:** MiniMax image client
- **Caption:** The same coordination error radiates from bulk equilibrium into the under-coordinated environments that control water, air, methane, refrigerants, minerals, PFAS, and cement.

### 2. `02-coordination-error-curve`
- **Title:** Error Grows as Coordination Drops
- **Type:** data-chart
- **Single idea:** uMLIPs systematically soften under-coordinated environments, with the largest errors exactly where functional materials operate.
- **Data points to show:**
  - Bulk reference coordination number (CN) = 12 → defined as 0% error [^1].
  - CN = 4–8 → 15–60% softening of the potential energy surface [^2].
  - Error is systematic, not random; it grows as coordination drops and local chemistry deviates from the training distribution [^2].
- **Suggested form:** Line chart or scatter with a shaded 15–60% band, CN on the x-axis, percent softening on the y-axis.
- **Generation:** matplotlib
- **Caption:** A systematic survey shows uMLIPs soften the potential energy surface by 15–60% in under-coordinated regions, precisely the coordination range of pores, surfaces, and transition states [^2].

### 3. `03-four-filters`
- **Title:** From Predicted Structure to Buried Breakthrough
- **Type:** concept-diagram
- **Single idea:** Four filters convert bulk-trained accuracy into experimental failure.
- **Data points to show:**
  - Filter 1 — Defect/bulk asymmetry: CN 4–8, 15–60% softening [^2].
  - Filter 2 — Combinatorial wall: millions of refrigerant candidates, multi-component cement oxides (CaO–SiO₂–Al₂O₃–Fe₂O₃–MgO–SO₃), thousands of MOF linkers [article].
  - Filter 3 — Metastability: hydrated cement phases, amorphous sorbents, carbonated silicates, caloric alloys [article].
  - Filter 4 — Ranking inversion: systematic errors reorder candidates; experiments are sent to false priorities and true breakthroughs are buried [^1].
- **Suggested form:** Vertical funnel or four-stage flow diagram.
- **Generation:** matplotlib
- **Caption:** Defect/bulk asymmetry, the combinatorial wall, metastability, and ranking inversion turn a small systematic error into wrong experimental priorities [^1][^2].

### 4. `04-blind-prediction-panel`
- **Title:** Measured Correction, Machine-Checked Proof
- **Type:** evidence-panel
- **Single idea:** The correction layer transfers blindly across models and materials, and its claims are bounded by formal proof.
- **Data points to show:**
  - Pearson r = 0.906, p = 10⁻⁴, 95% CI [0.82, 0.96], across 36 (model, material) combinations, zero adjustable parameters [^1].
  - Runtime overhead = 15.6% in Python; expected <1% in a compiled LAMMPS overlay [^1].
  - Corrected uMLIPs remain ~10⁵× faster than DFT [^1].
  - 77 build-locked Lean 4 theorems, zero sorry proofs [^1].
- **Suggested form:** Side-by-side panel: scatter plot of predicted vs observed error, three metric cards, and a proof-badge tile.
- **Generation:** matplotlib
- **Caption:** Across 36 blind model–material pairs the error field predicts corrections with r = 0.906, while a build-locked library of 77 Lean 4 theorems bounds what can be believed [^1].

### 5. `05-correction-verification-layer`
- **Title:** Runtime Correction with Proof Boundaries
- **Type:** concept-diagram
- **Single idea:** Lupine adds measured analytic forces to uMLIP gradients and marks the line between supported and unsupported predictions.
- **Data points to show:**
  - Environment error field anchored at bulk CN = 12 with error defined as zero [^1].
  - Three anchor observables fix the field; a cubic spline with the bulk constraint predicts error at unseen environments [^1].
  - Out-of-domain or genuinely synthesis-dependent cases are flagged as unsupported rather than sold as predicted [^1].
- **Suggested form:** Layered architecture diagram: uMLIP base → error-field overlay → analytic-force correction → Lean proof boundary.
- **Generation:** matplotlib
- **Caption:** A coordination-based error field, three anchor observables, and analytic force corrections let molecular dynamics follow the corrected surface, while proof boundaries stop unsupported claims [^1].

### 6. `06-addressable-impact-sankey`
- **Title:** The Combined Addressable Impact
- **Type:** data-chart
- **Single idea:** Correcting the same error geometry opens planetary-scale impact across all seven targets.
- **Data points to show:**
  - Water: ~2 billion people affected; 40% global freshwater deficit by 2030 [^3].
  - Air: 4–7 million premature deaths annually from outdoor air pollution [^6].
  - Methane: ~30% of current warming; a 30% emissions cut by 2030 could avoid ~0.3 °C by 2040 [^8][^9].
  - Refrigerants: Kigali Amendment HFC reductions avoid up to 0.5 °C by 2100 [^10].
  - Critical minerals: 4–6× demand increase by 2040 [^11].
  - Cement: 2.8 GtCO₂ yr⁻¹ [^13].
- **Suggested form:** Sankey or grouped bubble chart from "one correction layer" to the seven impact domains.
- **Generation:** matplotlib
- **Caption:** The seven application areas together span billions of people, gigatonnes of CO₂, and trillion-dollar supply chains [^3][^6][^8][^9][^10][^11][^13].

### 7. `07-ranking-inversion`
- **Title:** Raw Rankings Hide True Breakthroughs
- **Type:** evidence-panel
- **Single idea:** Systematic error does not add noise—it inverts candidate rankings, sending experiments to false positives.
- **Data points to show:**
  - 15–60% softening in under-coordinated regions [^2].
  - Raw barriers can make membranes, catalysts, and sorbents appear better than they are.
  - Corrected barriers restore true ranking and flag selective field failures that may break scaling relations [^1].
- **Suggested form:** Side-by-side bar chart comparing raw-uMLIP vs corrected ranking for a set of candidate materials.
- **Generation:** matplotlib
- **Caption:** A soft potential surface can promote the wrong membrane pore or catalyst site; corrected barriers restore the ranking that experiments should follow [^1][^2].

### 8. `08-platform-ecosystem`
- **Title:** One Layer, Many Industrial Workflows
- **Type:** concept-diagram
- **Single idea:** The same correction-and-verification layer plugs into membrane, catalyst, sorbent, refrigerant, mineral, and cement workflows.
- **Data points to show:**
  - Seven target modules: desalination membranes; atmospheric-water harvesting; low-temperature NH₃-SCR; methane-to-methanol / pyrolysis; low-GWP refrigerants and caloric solids; critical-mineral recovery and PFAS remediation; cement and CO₂-cured concrete [article].
  - Each module consumes corrected binding energies, activation barriers, insertion/migration/site-selectivity energies, or amorphous-network energetics [article].
- **Suggested form:** Hub-and-spoke architecture diagram with the correction layer at the center.
- **Generation:** matplotlib
- **Caption:** Corrected energies for binding, barriers, insertion, migration, and site selectivity feed a single platform that serves seven distinct industrial stacks.

### 9. `09-economics-moat`
- **Title:** Speed That Scales Where DFT Cannot
- **Type:** data-chart
- **Single idea:** Runtime correction keeps uMLIPs fast enough to screen millions of candidates, while DFT is economically impossible at that scale.
- **Data points to show:**
  - Corrected uMLIPs ~10⁵× faster than DFT [^1].
  - Runtime overhead 15.6% in Python, target <1% compiled LAMMPS overlay [^1].
  - Combinatorial spaces: millions of refrigerant molecules, thousands of MOF linkers, multi-component cement oxides [article].
- **Suggested form:** Log-scale bar chart comparing relative time per candidate or cost-per-candidate funnel.
- **Generation:** matplotlib
- **Caption:** At roughly 10⁵× the speed of DFT and only modest runtime overhead, corrected potentials can search spaces that brute-force quantum chemistry cannot afford [^1].

### 10. `10-platform-roadmap`
- **Title:** The Path From Measured Error to Trust
- **Type:** scene-illustration
- **Single idea:** The series will walk each target through measuring error, correcting it, and proving which predictions can be believed.
- **Data points to show:**
  - Step 1 — Measure: error field defined over local coordination, CN = 12 = 0, spline interpolation [^1].
  - Step 2 — Correct: analytic forces added to uMLIP gradients at runtime [^1].
  - Step 3 — Prove: 77 build-locked Lean 4 theorems, zero sorry proofs [^1].
  - Apply to water, air, methane, refrigerants, critical minerals, PFAS, and cement.
- **Suggested form:** Narrative roadmap scene: an ascending path or laboratory montage moving from raw error to verified prediction.
- **Generation:** MiniMax image client
- **Caption:** Every article in the series will follow the same arc: measure the shape of the error, correct it with analytic forces, and prove which predictions can be believed.

---

## Type counts

- **data-chart:** 3
- **concept-diagram:** 3
- **evidence-panel:** 2
- **scene-illustration:** 2
