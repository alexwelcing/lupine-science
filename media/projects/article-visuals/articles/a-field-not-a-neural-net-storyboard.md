# Storyboard: A Field, Not a Neural Net

Slug: `a-field-not-a-neural-net`

## Core narrative summary

Universal machine-learning interatomic potentials (uMLIPs) are fast but systematically wrong in under-coordinated atomic environments. Lupine Science treats that wrongness as a smooth, geometry-driven "environment error field" that is measured from a few anchor observables and added as a runtime correction. The result is DFT-like defect accuracy without per-system retraining, backed by machine-checked proofs that also say when correction is impossible.

## Visuals

### 1. 01-synthesis-funnel
- **Title:** The synthesis validation bottleneck
- **Type:** data-chart
- **Single idea:** Vast computational discovery pipelines collapse to a trickle of independently validated materials, exposing the gap between prediction and experiment.
- **Data points to show:**
  - GNoME predicted 2.2 million crystals; 736 independently synthesized by late 2023 → 0.033% validation rate [^1]
  - A-Lab reported 63% autonomous synthesis success [^2]
  - Critique: two-thirds of A-Lab "novel" targets were already-known disordered phases → true discovery rate near zero [^2]
- **Suggested form:** Funnel chart (wide top: predicted structures; narrow middle: claimed successes; narrowest bottom: validated novel discoveries).
- **Generation:** Programmatic (matplotlib)
- **Caption:** Predicted materials vastly outrun verified discoveries: GNoME’s 2.2 million crystals produced only 736 confirmed syntheses, while A-Lab’s headline success rate collapsed once duplicates were removed. Sources: Merchant et al., *Nature* 624, 80–85 (2023); Szymanski et al., *Nature* 624, 86–91 (2023); Leeman et al., *PRX Energy* 3, 011002 (2024).

### 2. 02-coordination-error-curve
- **Title:** Errors are not noise — they have a shape
- **Type:** data-chart
- **Single idea:** uMLIP errors grow smoothly as local coordination number falls, exposing a low-dimensional geometry that training data has hidden.
- **Data points to show:**
  - Bulk formation-energy MAE: 29–81 meV/atom near bulk coordination [^3]
  - Ion migration barriers underestimated by >60% in under-coordinated transition states [^4]
  - Defect formation energies carry large percentage errors [^4]
- **Suggested form:** Line or area chart: x-axis coordination number (c = 7–12), y-axis signed uMLIP error; shaded regions for surfaces, vacancies, transition states.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Where atoms are under-coordinated — surfaces, vacancies, and transition states — universal potentials drift predictably away from reference energies, not randomly. Sources: Deng et al., *npj Comput. Mater.* 11, 9 (2025).

### 3. 03-field-anchors-spline
- **Title:** Three anchors fix the field
- **Type:** concept-diagram
- **Single idea:** A cubic spline through three measured coordination-deficit anchors, fixed at zero in the bulk, defines the entire correction.
- **Data points to show:**
  - Anchor observables: (100) surface at c = 8, (111) surface at c = 9, vacancy formation at c = 11
  - Boundary condition: P(12) = 0 (perfect fcc bulk)
  - Extrapolation: linear continuation below c = 8 predicts c = 7 (110) surface energy blind
- **Suggested form:** Lattice + spline overlay: small atom coordination icons along the x-axis; cubic spline passing through knots; shaded blind-prediction region.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Lupine measures the error field from three standard observables and fixes it to zero in the bulk; everything below the lowest anchor is a true blind prediction.

### 4. 04-blind-prediction-scatter
- **Title:** r = 0.906 blind prediction
- **Type:** data-chart
- **Single idea:** The field predicts the signed error of never-fitted (110) surface energies across models and materials with near-linear accuracy.
- **Data points to show:**
  - All models combined: Pearson r = 0.906, p = 10⁻⁴, 95% CI [0.82, 0.96] (36 model/material combinations)
  - CHGNet v0.4.2: r = 0.86, p < 0.01
  - MACE-MP-0 small: r = 0.90, p < 0.01
  - MACE-MPA-0: r = 0.96, p < 0.001
  - MACE-MP-0 medium: r = 0.47, p = 0.10 (non-significant, bounds the domain)
  - Permutation null mean: r = 0.44 (10,000 draws)
- **Suggested form:** Scatter plot of predicted vs. observed signed error; one subplot per model; 1:1 line and r annotations.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Across 36 independent combinations, the measured field predicts blind (110) surface-energy errors with r = 0.906, surviving a structurally aware permutation null.

### 5. 05-runtime-correction
- **Title:** Additive correction, analytic forces
- **Type:** concept-diagram
- **Single idea:** The field is inverted into a correction energy whose forces derive analytically, so MD and relaxations remain physically consistent.
- **Data points to show:**
  - E_corr = −Σᵢ P(cᵢ)
  - F_corr = Σᵢ P′(cᵢ) ∇cᵢ
  - Force accuracy verified to 10⁻⁶ eV/Å on rattled slabs
  - Overhead: 15.6% on CHGNet steps (Python); <1% projected in compiled LAMMPS pair-style overlay
- **Suggested form:** Diagram showing uMLIP calculator feeding energies into a coordination-neighbor-list correction block, with arrows for energy and force flow.
- **Generation:** Programmatic (matplotlib)
- **Caption:** The correction layer sits beside any existing uMLIP, adds analytic forces, and keeps molecular dynamics conservative while adding only single-digit overhead.

### 6. 06-discovery-loop
- **Title:** The six-step discovery loop
- **Type:** concept-diagram
- **Single idea:** Simulation, validation, correction, and proof close into a repeatable cycle that flags failures as rigorously as successes.
- **Data points to show:**
  - Step 1: Simulate — equation of state, slabs, vacancy supercells
  - Step 2: Identify — compare to 228-value provenance-annotated reference database
  - Step 3: Validate — three anchors predict a fourth blind observable
  - Step 4: Generate — cubic spline P(c) deployed as additive correction
  - Step 5: Verify — every quantitative claim as Lean 4 theorem
  - Step 6: Improve — corrected calculator re-run; failures become impossibility proofs
- **Suggested form:** Circular six-step flowchart with alternating simulation (indigo), measurement (amber), and proof (sage) nodes.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Lupine closes field measurement, runtime correction, and machine-checked proof into a six-step loop that terminates in either a certified candidate or a provable reason to stop.

### 7. 07-impossibility-boundaries
- **Title:** Where correction cannot work, Lupine proves it
- **Type:** concept-diagram
- **Single idea:** Formal verification is most valuable at the boundary: it proves ranking inversions, noise-floor redundancy, and domain violations cannot be fixed by monotone correction.
- **Data points to show:**
  - Ranking inversions: no monotone correction can reconcile both model and reference orderings simultaneously
  - Already-converged cells: MACE-MPA-0 on certain surfaces sits at the noise floor; correction refused
  - Domain violations: planar faults, charged defects, strongly correlated oxides require second-shell or electronic-structure treatment
- **Suggested form:** Decision-tree diagram: three branches from a "submit claim" node to "prove / refuse / flag domain violation" leaves, with example witnesses.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Instead of silent failures, the verification layer returns machine-checked impossibility proofs for ranking inversions, noise-floor cells, and out-of-domain structures.

### 8. 08-climate-targets-map
- **Title:** From geometry to gigatonnes
- **Type:** scene-illustration
- **Single idea:** The same coordination-dependent defects that the field corrects sit at the center of the highest-impact climate material families.
- **Data points to show:**
  - Five target classes from the article: cobalt-free Li-Mn-rich cathodes; earth-abundant halide solid electrolytes; MOFs for direct air capture; electrochemical ammonia catalysts; lead-free perovskite absorbers
  - Cumulative potential impact: 5–12 GtCO₂/year (Lupine estimate / unaudited)
  - Connection: each property is a coordination-dependent defect property (migration barrier, hydrolysis, vacancy formation, surface N≡N cleavage, Sn²⁺ oxidation)
- **Suggested form:** Stylized global/climate scene with five labeled material icons arranged around a central coordination-geometry motif; no realistic rendering.
- **Generation:** MiniMax image client
- **Caption:** The defects that break climate-critical materials — ion hops, surface catalytic sites, hydrolysis nodes — are exactly the under-coordinated environments the field measures.

### 9. 09-speed-accuracy-panel
- **Title:** Accuracy without the DFT price tag
- **Type:** evidence-panel
- **Single idea:** A corrected uMLIP recovers DFT-level defect accuracy at a tiny fraction of the cost, widening the economic window for large-scale screening.
- **Data points to show:**
  - Ni (110) surface energy error: 9.7% → 1.5% (6.5× improvement)
  - Cu (110) surface energy error: 28.0% → 13.7% (2.0× improvement)
  - Bulk lattice constants unchanged (correction vanishes at c = 12)
  - Overhead: 15.6% Python; <1% compiled LAMMPS
  - Corrected uMLIP still many orders of magnitude faster than DFT
  - 10⁶-structure screening campaign needs zero DFT calls
- **Suggested form:** Split evidence panel: left side bar chart of before/after % errors; right side cost/speed ladder comparing DFT, raw uMLIP, and corrected uMLIP.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Selective correction cuts surface-energy errors several-fold while leaving bulk lattice constants untouched, preserving uMLIP speed at near-DFT defect accuracy.

### 10. 10-field-vs-neural-net
- **Title:** A field, not a neural net
- **Type:** concept-diagram
- **Single idea:** The strategic choice is not a bigger model or more training data; it is a measured geometric correction layer plus machine-checked proof.
- **Data points to show:**
  - Neural-net path: delta-ML requires per-system retraining and abundant reference data [^6]; fine-tuning requires curated training sets that do not exist for unexplored spaces [^7]
  - Field path: three anchors transfer within a crystal-structure family; no retraining of uMLIP weights
  - Proof layer: 8 Lean 4 modules, 77 build-locked theorems, ~225 declarations, zero `sorry` proofs
- **Suggested form:** Two-column comparison diagram contrasting the "train a bigger net" loop with the "measure a field + prove claims" loop.
- **Generation:** Programmatic (matplotlib)
- **Caption:** Lupine replaces the arms race for bigger models with a measured field and formal verification, eliminating per-system retraining while raising the standard of evidence.

## Visual type counts

| Type | Count |
|------|-------|
| data-chart | 3 |
| concept-diagram | 5 |
| evidence-panel | 1 |
| scene-illustration | 1 |
| **Total** | **10** |
