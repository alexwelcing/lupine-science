# Storyboard: The 0.2% Synthesis Problem

## Article core narrative

Computational materials discovery is generating candidates faster than labs can validate them, but the real bottleneck is not synthesis skill — it is a set of four structural filters that structure generators and fast predictors routinely skip. If those filters stay unenforced, climate-critical materials will miss their narrow deployment windows and gigatonnes of CO₂ abatement will be lost. Lupine closes the gap by learning and applying a local environment error field that makes predicted energy landscapes trustworthy enough to route only synthesizable candidates to experimental partners and commercial production.

---

## 01 — Synthesis funnel

- **Filename:** `01-synthesis-funnel`
- **Title:** The 0.2% Synthesis Funnel
- **Type:** data-chart
- **Single idea:** Computational stability has become abundant, but experimental validation has not.
- **Data points to show:**
  - 380,000 computationally stable inorganic structures reported by GNoME by late 2023 [^1]
  - 736 independently synthesized and structurally confirmed by late 2023 [^1]
  - Resulting validation rate: 0.2% [^1]
  - A-Lab: 41 of 58 targets reported synthesized, but independent review found two-thirds were already-known disordered phases [^2]
- **Suggested form:** funnel chart or Sankey showing predicted → independently synthesized, with a second branch for A-Lab's reported vs. true novelty
- **Generation method:** matplotlib
- **Caption:** Of 380,000 computationally stable structures reported by GNoME, only 736 had been independently synthesized by late 2023 — a 0.2% validation rate.

---

## 02 — Four filters

- **Filename:** `02-four-filters`
- **Title:** Four Filters Between Prediction and Synthesis
- **Type:** concept-diagram
- **Single idea:** The 0.2% rate is caused by four predictable filters, not by bad experiments.
- **Data points to show:**
  - Filter 1: computed stability ≠ synthesizability — convex-hull candidates can lack a precursor path [article §Filter 1]
  - Filter 2: uMLIPs soften the energy surface away from equilibrium [^5]
  - Filter 3: real materials contain disorder, vacancies, and non-stoichiometry [article §Filter 3]
  - Filter 4: each failed campaign costs weeks of lab time and thousands of dollars [article §Filter 4]
- **Suggested form:** horizontal gated flow diagram / four sequential gates between "predicted crystal" and "made material"
- **Generation method:** matplotlib
- **Caption:** Four structural filters separate a predicted crystal from a made material.

---

## 03 — uMLIP softening

- **Filename:** `03-umlip-softening`
- **Title:** Where Universal Potentials Soften
- **Type:** evidence-panel
- **Single idea:** Universal ML potentials trained on near-equilibrium bulk structures systematically soften under-coordinated environments.
- **Data points to show:**
  - Error source: surfaces, vacancies, transition states [^5]
  - Systematic softening of the potential energy surface in under-coordinated environments [^5]
  - Consequence: defect and migration-barrier errors large enough to invert rankings
- **Suggested form:** side-by-side potential-energy-surface plots (reference vs. uMLIP) or an error heat map over coordination environments
- **Generation method:** matplotlib
- **Caption:** Universal machine-learning interatomic potentials systematically soften the potential energy surface away from equilibrium.

---

## 04 — Barrier error

- **Filename:** `04-barrier-error`
- **Title:** A 100 meV Barrier Error Changes Everything
- **Type:** data-chart
- **Single idea:** Small errors in computed barriers translate into exponential errors in kinetic rates and can flip material classifications.
- **Data points to show:**
  - 100 meV barrier error → ~50× change in hopping rate at room temperature [article §Filter 2]
  - Fast-ion conductor can be misclassified as an insulator [article §Filter 2]
- **Suggested form:** line chart of hopping-rate multiplier vs. barrier error at 300 K
- **Generation method:** matplotlib
- **Caption:** A 100 meV barrier error changes ionic hopping rates by roughly 50× at room temperature — enough to misclassify a conductor as an insulator.

---

## 05 — Error field correction

- **Filename:** `05-error-field`
- **Title:** Learning the Environment Error Field
- **Type:** concept-diagram
- **Single idea:** Lupine does not train a bigger model; it learns a local error field that corrects the predicted landscape at runtime.
- **Data points to show:**
  - Correction is a function of local atomic coordination [article §What correction looks like]
  - Applied at runtime with analytic forces [article §What correction looks like]
  - Molecular dynamics and relaxations then follow proper gradients [article §What correction looks like]
- **Suggested form:** lattice diagram overlaid with correction vectors / field arrows, plus a before/after relaxation path
- **Generation method:** matplotlib
- **Caption:** Lupine applies a local environment error field at runtime so molecular dynamics follows corrected gradients.

---

## 06 — Cobalt and climate scale

- **Filename:** `06-cobalt-climate`
- **Title:** Cobalt Supply and the Net-Zero Abatement Gap
- **Type:** data-chart
- **Single idea:** The bottleneck matters because cobalt-free cathodes and clean-energy hardware are essential to gigatonne-scale CO₂ abatement.
- **Data points to show:**
  - Democratic Republic of Congo produces roughly 70% of global cobalt [^6]
  - Clean-energy hardware investment: $1.8 trillion in 2023 → ~$4.5 trillion/year by early 2030s [^4]
  - Batteries linked to ~20% of required 2030 CO₂ reductions and indirectly to another 40% [^3]
  - Five Lupine material areas could abate 5–12 Gt CO₂ yr⁻¹, roughly 10–25% of the IEA net-zero hardware requirement [^7]
- **Suggested form:** split panel: bar chart of cobalt concentration by country + area chart of clean-energy investment trajectory
- **Generation method:** matplotlib
- **Caption:** Cobalt-free cathodes remove a supply-chain chokepoint, while clean-energy investment must more than double this decade.

---

## 07 — Deployment window

- **Filename:** `07-deployment-window`
- **Title:** The Narrow Deployment Window
- **Type:** scene-illustration
- **Single idea:** Material discoveries have a use-by date; delay locks in emissions that later innovation cannot recover.
- **Data points to show:**
  - Material discovered in 2035 can shape 2040 deployment [article §The climate math]
  - Material discovered in 2045 cannot [article §The climate math]
  - Cumulative emissions become unrecoverable [article §The climate math]
- **Suggested form:** timeline scene showing two paths diverging at 2035 vs. 2045, with a closing door or shrinking window
- **Generation method:** MiniMax image client
- **Caption:** A material discovered too late cannot recover cumulative emissions already locked in.

---

## 08 — Commercial endpoints

- **Filename:** `08-commercial-endpoints`
- **Title:** The Correction Layer Must Feed Real Production
- **Type:** scene-illustration
- **Single idea:** The endpoints are already in commercial pipelines; corrected screening must connect to them.
- **Data points to show:**
  - POSCO Future M: lithium-manganese-rich cathode materials, mass production preparation in 2025 [^8]
  - GM / LG Energy Solution: prismatic lithium-manganese-rich cells, commercial production target 2028 [^9]
  - Solid Power: automotive-scale solid-state cells supplied to BMW for qualification testing [^10]
  - Factorial Energy: 100+ Ah quasi-solid-state cells delivered to Mercedes-Benz, EQS road testing [^11]
- **Suggested form:** ecosystem network map / world map with partner nodes and product milestones
- **Generation method:** MiniMax image client
- **Caption:** Corrected screening must feed partners who are already scaling cobalt-free cathodes and solid-state cells.

---

## 09 — Failure economics

- **Filename:** `09-failure-economics`
- **Title:** The Economics of a Failed Campaign
- **Type:** data-chart
- **Single idea:** Even Lupine's lower failure rate is too high for brute-force screening to be economical; filtering earlier is the moat.
- **Data points to show:**
  - Lupine validation studies: 40–60% failure rate [article §Filter 4]
  - Each failed campaign wastes weeks of lab time and thousands of dollars [article §Filter 4]
  ~75% of all predictions would drop out before reaching a factory if the four filters were enforced globally [article §Filter 4]
- **Suggested form:** Sankey or stacked bar showing prediction flow with loss nodes before and after applying the filters
- **Generation method:** matplotlib
- **Caption:** Enforcing the four filters would flag roughly three-quarters of predictions before they reach a furnace.

---

## 10 — Predictions to partners

- **Filename:** `10-predictions-to-partners`
- **Title:** From Predictions to Partners
- **Type:** concept-diagram
- **Single idea:** The path from a corrected energy landscape to a commercial material runs through named experimental collaborators, not another generation cycle.
- **Data points to show:**
  - Next article in series: how Lupine measures the environment error field [article §From predictions to partners]
  - Why the field is measured rather than learned [article §From predictions to partners]
  - How machine-checked proof prevents false positives in autonomous pipelines [article §From predictions to partners]
- **Suggested form:** pipeline diagram: Predictions → Correction Layer → Machine-Checked Proof → Synthesis → Characterization → Scale Partners
- **Generation method:** matplotlib
- **Caption:** Corrected predictions must flow into synthesis, characterization, and scale partners — not into another generation cycle.

---

## Type count

- **data-chart:** 4 (01, 04, 06, 09)
- **concept-diagram:** 3 (02, 05, 10)
- **evidence-panel:** 1 (03)
- **scene-illustration:** 2 (07, 08)
- **Total:** 10
