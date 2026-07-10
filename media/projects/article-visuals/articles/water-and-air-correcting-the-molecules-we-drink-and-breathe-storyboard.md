# Storyboard: Water and Air — Correcting the Molecules We Drink and Breathe

## Article core narrative

Water scarcity and air pollution are global, deadly, and materials-limited. The membranes, sorbents, ion-selective frameworks, and catalysts that would solve them all function in under-coordinated atomic environments — pore windows, metal-linker bonds, exchanged cations, single-atom sites — that universal machine-learning interatomic potentials (uMLIPs) systematically misrepresent. Lupine's coordination-specific correction layer measures the environment error field, adds analytic forces at runtime, and verifies the supported claims with machine-checked proof. The result is a single platform that recovers accurate binding and barrier predictions across desalination, atmospheric water harvesting, lithium extraction, and air-quality catalysts, making high-throughput screening trustworthy enough to guide synthesis.

---

## 01 — `01-global-stakes`

- **Title:** The Human Scale of Water and Air Failure
- **Type:** data-chart
- **Single idea:** Water and air problems are already measured in billions of people and millions of deaths, so the cost of inaccurate materials discovery is not academic.
- **Data points:**
  - 97 million m³/day of desalinated water produced globally[^1]
  - ~2 billion people affected by water scarcity[^2]
  - 40% projected global freshwater deficit by 2030 under business-as-usual[^2]
  - 4–7 million premature deaths per year linked to outdoor air pollution[^3]
- **Suggested form:** Split bar chart — left panel "Water" (current desalination supply vs. unmet need), right panel "Air" (annual premature deaths with NOx / PM₂.₅ / VOC contributors). Indigo for supply, amber for gap/deaths.
- **Generation:** matplotlib
- **Caption:** Water scarcity already touches about two billion people and air pollution is linked to millions of premature deaths each year, yet the materials we need to fix both are still designed with computational tools that misread their atomic environments.[^1][^2][^3]

---

## 02 — `02-coordination-error-field`

- **Title:** The Error Is Coordination, Not Chemistry
- **Type:** concept-diagram
- **Single idea:** uMLIPs soften the potential energy surface where coordination is low (4–8), which is exactly the regime that controls water and air materials.
- **Data points:**
  - 15–60% softening of the potential energy surface in under-coordinated environments[^4]
  - Largest errors at coordination numbers between 4 and 8[^4]
  - Examples mapped to coordination regimes: membrane pore linings, MOF metal centres, zeolite exchanged cations, single-atom catalysts
- **Suggested form:** Line plot with shaded envelope: x-axis coordination number (2–12), y-axis percent error in energy / barrier height; annotate the 4–8 danger zone and overlay icons for each material class.
- **Generation:** matplotlib
- **Caption:** A recent survey of leading uMLIPs shows the potential energy surface is softened by 15–60% in under-coordinated environments, with the worst errors in the coordination range that governs pores, metal centres, and single-atom sites.[^4]

---

## 03 — `03-correction-layer`

- **Title:** The Correction Layer, Applied at Runtime
- **Type:** concept-diagram
- **Single idea:** Lupine measures an environment error field from anchor observables, adds analytic forces to uMLIP gradients, and forces zero error in a bulk reference state.
- **Data points:**
  - Three anchor observables define the error field[^5]
  - Cubic spline enforces zero error in a reference bulk environment[^5]
  - Analytic forces are added to uMLIP gradients at runtime[^5]
- **Suggested form:** Flow diagram: raw uMLIP potential surface → anchor observables → cubic-spline error field → corrected gradients → MD / NEB / high-throughput relaxation. Use boxes, arrows, and a small lattice inset showing a low-coordination site.
- **Generation:** matplotlib / SVG
- **Caption:** The correction is built from measured anchor observables, enforced to vanish in bulk environments, and applied as analytic forces so every molecular dynamics or barrier calculation follows the corrected surface.[^5]

---

## 04 — `04-blind-prediction`

- **Title:** Blind Prediction Accuracy Across Models and Materials
- **Type:** data-chart
- **Single idea:** Corrected uMLIPs reproduce reality without fitting: 36 combinations, r = 0.906, zero adjustable parameters.
- **Data points:**
  - 36 (model, material) combinations[^5]
  - Pearson r = 0.906[^5]
  - p = 10⁻⁴[^5]
  - 95% CI [0.82, 0.96][^5]
  - Zero adjustable parameters[^5]
- **Suggested form:** Scatter plot: corrected uMLIP prediction on x-axis, reference value on y-axis, unity line, marginal histograms, annotation box with r, p, CI, and n.
- **Generation:** matplotlib
- **Caption:** Across 36 blind (model, material) combinations, corrected uMLIPs achieve r = 0.906 with zero adjustable parameters, closing the gap between fast screening and trustworthy energies.[^5]

---

## 05 — `05-water-rankings`

- **Title:** What Corrected Screening Changes in Water
- **Type:** evidence-panel
- **Single idea:** Raw uMLIPs misrank binding, diffusion, and hydrolysis barriers for desalination membranes, atmospheric water sorbents, and lithium-selective frameworks; corrected energies recover the true priorities.
- **Data points:**
  - Membranes: ~99.5% NaCl rejection, ~10 L m⁻² h⁻¹ bar⁻¹ permeability, 3–4 kWh m⁻³ total energy consumption[^1]
  - Atmospheric water harvesting: MOF-808/LiCl capacity approaching 0.25 g g⁻¹ at 20% relative humidity[^6]
  - Lithium extraction: current Li⁺/Mg²⁺ selectivity 10–50, target >100 with permeance >10⁻⁶ mol m⁻² s⁻¹[^8]
- **Suggested form:** Three-column before/after panel: raw uMLIP ranking (false priority highlighted in rose) → correction applied → corrected ranking (true priority in sage). Include mini structural schematics for the nanopore, MOF metal-linker bond, and ion-sieving window.
- **Generation:** matplotlib
- **Caption:** In desalination membranes, atmospheric-water sorbents, and lithium-selective frameworks, corrected binding and barrier energies overturn the false priorities that raw uMLIPs produce.[^1][^6][^8]

---

## 06 — `06-market-scale`

- **Title:** The Markets Touched by Corrected Discovery
- **Type:** data-chart
- **Single idea:** Correct predictions matter because the addressable markets for water, air, and lithium materials are measured in billions of dollars and strategic supply chains.
- **Data points:**
  - Global atmospheric water generator market projected at ~$9 billion by 2030
  - Automotive catalyst market already exceeds $20 billion annually
  - Global lithium demand projected at ~2.4 million tonnes LCE by 2030[^12]
- **Suggested form:** Horizontal bar chart: market / demand category on y-axis, value on x-axis, with separate scales noted as labels. Use indigo for water, sage for air, amber for lithium.
- **Generation:** matplotlib
- **Caption:** The materials that corrected discovery could improve sit inside multi-billion-dollar markets: atmospheric water generation, automotive catalysts, and the lithium supply chain for batteries.[^12]

---

## 07 — `07-hidden-risks`

- **Title:** Hidden Risks: When Soft Barriers Become Real Failures
- **Type:** concept-diagram
- **Single idea:** The same coordination error that misranks candidates also hides the failure modes that kill devices in the field.
- **Data points:**
  - AWH hydrolysis: barriers underestimated 15–60% at coordination numbers 4–7[^4][^6]
  - Cold-start NOx: 50–80% of total trip NOx emitted before the catalyst reaches ~200 °C[^9]
  - Soot filter regeneration: fuel penalty 3–7%, must stay below ~500 °C to protect substrate[^10]
  - VOC oxidation: formaldehyde and benzene conversion often requires temperatures above 150 °C[^11]
- **Suggested form:** Four-quadrant diagram, one risk per quadrant: structural icon + raw-barrier illusion (short, rose) vs. corrected barrier reality (tall, sage) + field failure consequence. Connect back to the 4–8 coordination regime.
- **Generation:** matplotlib
- **Caption:** Underestimated hydrolysis, redox, and activation barriers translate into collapsed sorbents, cold-start NOx, filter regeneration penalties, and inefficient VOC oxidation in real devices.[^4][^6][^9][^10][^11]

---

## 08 — `08-proof-ecosystem`

- **Title:** From Peer-Reviewed Anchors to Machine-Checked Proofs
- **Type:** concept-diagram
- **Single idea:** Trust comes from a closed loop: measured anchors, formal verification, and bounded claims.
- **Data points:**
  - 77 build-locked Lean 4 theorems with zero sorry proofs[^5]
  - Anchor observables tied to peer-reviewed sources[^4]
  - Boundary conditions for impossibility proofs documented[^5]
- **Suggested form:** Circular ecosystem diagram: peer-reviewed data → error-field measurement → runtime correction → formal proof library → impossibility / bounded-uncertainty claims → back to experiment. Centered on a lock icon.
- **Generation:** matplotlib / SVG
- **Caption:** The correction layer is backed by peer-reviewed anchors and 77 build-locked Lean 4 theorems, so claims that fall outside the measured domain are flagged as bounded uncertainty rather than sold as prediction.[^4][^5]

---

## 09 — `09-speed-moat`

- **Title:** Accuracy at Screening Speed
- **Type:** data-chart
- **Single idea:** Corrected uMLIPs keep the speed advantage of uMLIPs over DFT with only a small runtime overhead, creating the economic moat for million-candidate screens.
- **Data points:**
  - Corrected uMLIPs remain ~10⁵× faster than DFT[^5]
  - Runtime correction overhead: 15.6%[^5]
  - Enables 10⁵–10⁶ candidate screens
- **Suggested form:** Log-scale bar chart: DFT cost per candidate vs. raw uMLIP vs. corrected uMLIP, with a secondary annotation showing 15.6% overhead and throughput arrow from 10⁵ to 10⁶ candidates.
- **Generation:** matplotlib
- **Caption:** Corrected uMLIPs stay roughly 10⁵× faster than DFT while adding only 15.6% runtime overhead, making hundred-thousand- to million-candidate screens economically feasible.[^5]

---

## 10 — `10-platform-thesis`

- **Title:** One Correction Layer for Every Pore and Every Breath
- **Type:** scene-illustration
- **Single idea:** The same coordination-specific correction spans batteries, direct air capture, water, and air — a single platform for climate-critical materials.
- **Data points:**
  - Same low-coordination environments: pore windows, metal-linker interfaces, exchanged cations, single-atom sites[^5]
  - Same correction transfers from battery cathodes and DAC MOFs to water and air targets[^5]
- **Suggested form:** Narrative scene: a single lattice / molecular surface in the foreground with visual threads extending to four application domains (clean water droplet, atmospheric harvester, exhaust catalyst, lithium ion). Soft indigo wash background, indigo accent threads.
- **Generation:** MiniMax image client
- **Caption:** Because the failure mode is coordination-specific, not climate-specific, one measured and verified correction layer can raise the reliability of discovery across water, air, batteries, and direct air capture.[^5]

---

## Visual type summary

| Type              | Count |
|-------------------|-------|
| data-chart        | 4     |
| concept-diagram   | 4     |
| evidence-panel    | 1     |
| scene-illustration| 1     |
| **Total**         | **10**|

## Output path

`/home/alex/Dev/lupine/lupine-science/media/projects/article-visuals/articles/water-and-air-correcting-the-molecules-we-drink-and-breathe-storyboard.md`
