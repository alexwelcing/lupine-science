# Storyboard: Investing in the Trust Layer

**Slug:** `investing-in-the-trust-layer`  
**Output prefix:** `investing-in-the-trust-layer-`

## Article core narrative

Computational materials discovery now generates candidates at machine speed—millions of crystals, interatomic potentials that run in microseconds, and autonomous labs that synthesize around the clock. Yet belief in the results is the binding constraint: only a tiny fraction of predicted structures are independently validated, and systematic predictor errors concentrate where materials depart from bulk equilibrium. Lupine Science sits between prediction and synthesis as a correction-and-verification layer. It measures uMLIP error as a physical field, corrects it at runtime, and seals quantitative claims as machine-checked proofs. The investment case is that a small, defensible set of validated predictions is more valuable than an ocean of unverified ones—and that the trust layer makes the entire climate-materials pipeline economically rational.

---

## 01 — Generation funnel

- **Filename:** `01-generation-funnel`
- **Title:** From millions of predictions to a handful of validated materials
- **Type:** data-chart
- **Single idea:** The headline abundance of AI-generated materials masks a severe validation bottleneck.
- **Data points to show:**
  - 2.2 million candidate crystals proposed by GNoME [^1]
  - 380,000 computed-stable structures reported by GNoME [^1]
  - 736 independently synthesized by late 2023 [^1]
  - 0.2% validation rate [^1]
  - A-Lab experimental success rate: 63% [^2]
  - Estimated true novel-discovery rate for A-Lab: near zero [^2]
- **Suggested form:** Funnel / stacked-bar drop-off (matplotlib).
- **Generation method:** matplotlib
- **Caption:** GNoME proposed 2.2 million candidate crystals, but only 736 had been independently synthesized by late 2023—a 0.2% validation rate that exposes the trust bottleneck in computational materials discovery.[^1]

---

## 02 — Pipeline leaks

- **Filename:** `02-pipeline-leaks`
- **Title:** The layered pipeline, and where it leaks
- **Type:** concept-diagram
- **Single idea:** Errors propagate and amplify as candidate materials move from generation through prediction, synthesis, and validation.
- **Data points to show:**
  - Generation stage: GNoME 2.2M candidates; MatterGen limited to modest unit cells and excludes disorder / compositional complexity [^1][^4]
  - Prediction stage: uMLIPs run at ~10⁻⁴ seconds per atom-step; defect-family observables (surfaces, vacancies, stacking faults) err 15–60× worse than bulk observables [^5]
  - Synthesis stage: 0.2%–63% success pattern; queue filtered by intuition and compute rather than by proof
  - Validation stage: low validated throughput; false positives waste weeks, false negatives bury viable candidates
- **Suggested form:** Sankey or left-to-right process diagram with error annotations (matplotlib/SVG).
- **Generation method:** matplotlib
- **Caption:** Each stage of the discovery pipeline—generation, prediction, synthesis, validation—introduces systematic errors that cascade downstream, turning high activity into low validated throughput.[^1][^4][^5]

---

## 03 — Error field mechanism

- **Filename:** `03-error-field`
- **Title:** Measured error field, not learned
- **Type:** concept-diagram
- **Single idea:** Lupine treats uMLIP error as a physical field over local atomic environments, fixes it with three standard observables, and transfers corrections within a structure family without retraining.
- **Data points to show:**
  - Field domain: first-shell coordination number for face-centered-cubic metals
  - Anchor observables: γ₁₀₀, γ₁₁₁, and vacancy formation energy
  - Bulk constraint: error = 0 at coordination number 12
  - Blind test observable: γ₁₁₀
  - Transfer: no per-system training required; contrasts with delta-ML retraining and fine-tuning data requirements [^6]
- **Suggested form:** Lattice + spline plot showing coordination on x-axis, error correction on y-axis, anchored points, and the bulk-zero constraint (matplotlib).
- **Generation method:** matplotlib
- **Caption:** For fcc metals, Lupine models uMLIP error as a cubic-spline field over first-shell coordination, anchored by three standard observables and constrained to zero at bulk coordination 12.[^6]

---

## 04 — Blind-test correlation

- **Filename:** `04-blind-test-correlation`
- **Title:** Predicting the error on a never-fitted observable
- **Type:** data-chart
- **Single idea:** The measured error field generalizes: it predicts the blind γ₁₁₀ error across 36 model-material combinations with high correlation and no adjustable parameters.
- **Data points to show:**
  - 36 independent (model, material) combinations
  - Pearson r = 0.906
  - Material-clustered 95% CI: [0.82, 0.96]
  - p = 10⁻⁴
  - Zero adjustable parameters
  - Example corrections: Ni(110) relative error 9.7% → 1.5%; Cu(110) 28.0% → 13.7%
- **Suggested form:** Scatter plot of predicted vs. actual γ₁₁₀ error with identity line, confidence band, and annotated examples (matplotlib).
- **Generation method:** matplotlib
- **Caption:** Across 36 model-material combinations, the measured error field predicts the never-fitted γ₁₁₀ surface-energy error with Pearson r = 0.906 (95% CI [0.82, 0.96], p = 10⁻⁴) and zero adjustable parameters.

---

## 05 — Runtime overlay

- **Filename:** `05-runtime-overlay`
- **Title:** Runtime compatibility: correct without retraining
- **Type:** evidence-panel
- **Single idea:** Lupine deploys as a lightweight LAMMPS overlay that keeps the user's existing uMLIP simulator while measurably improving accuracy.
- **Data points to show:**
  - Wall-time overhead in Python: +15.6%
  - Expected compiled C/C++ or CUDA overhead: <1%
  - Corrected uMLIPs remain many orders of magnitude faster than DFT for structurally complex cells
  - Ni(110) relative error before correction: 9.7%; after: 1.5%
  - Cu(110) relative error before correction: 28.0%; after: 13.7%
- **Suggested form:** Split panel: left side bar chart of runtime overhead (Python vs. compiled target vs. DFT reference), right side before/after error bars for Ni(110) and Cu(110) (matplotlib).
- **Generation method:** matplotlib
- **Caption:** Lupine deploys beside existing CHGNet or MACE calculators as a LAMMPS overlay, adding 15.6% overhead in Python and cutting relative error on blind facets by up to an order of magnitude.

---

## 06 — Climate scale

- **Filename:** `06-climate-scale`
- **Title:** Why accuracy matters in gigatonnes
- **Type:** data-chart
- **Single idea:** Batteries and climate materials operate on a timeline where a few years of delay translate into tens of gigatonnes of additional CO₂.
- **Data points to show:**
  - Batteries directly linked to ~20% of CO₂ reductions required by 2030 [^3]
  - Batteries indirectly linked to another ~40% of required 2030 CO₂ reductions [^3]
  - Materials-development timeline compression: 10–20 years → 2–5 years
  - Cumulative emissions difference between deployment in 2035 vs. 2045: tens of gigatonnes
- **Suggested form:** Two-panel chart: top bar/ donut showing battery-linked 2030 CO₂ reduction share; bottom timeline band showing 10–20 year vs. 2–5 year development windows (matplotlib).
- **Generation method:** matplotlib
- **Caption:** Batteries are directly tied to roughly 20% of the CO₂ reductions needed by 2030 and indirectly to another 40%, so false positives and false negatives in materials screening carry climate-scale consequences.[^3]

---

## 07 — Phase Zero risk map

- **Filename:** `07-phase-zero-risk`
- **Title:** What is proven, what is on the critical path
- **Type:** concept-diagram
- **Single idea:** The fcc field is established; extending it to bcc, hcp, and layered structures is the engineered next step, with a clear go/no-go gate.
- **Data points to show:**
  - Established: fcc metals error field
  - Phase 0 critical path: extension to bcc, hcp, and layered structures
  - Go/no-go gate: Month 3
  - Open technical risk: possible second-shell correction where first-shell coordination alone does not resolve error geometry
  - Partnership risk: industrial validation partners targeted but not yet contracted; transfer claims remain computational until synthesis data arrive
- **Suggested form:** Gantt-style risk roadmap with status color coding (proven / in-progress / open) and the Month 3 gate marked (matplotlib/SVG).
- **Generation method:** matplotlib
- **Caption:** The fcc error field is established; the Phase 0 critical path extends it to bcc, hcp, and layered structures, with a Month 3 go/no-go gate and honest caveats about second-shell corrections and pending validation partners.

---

## 08 — Partner flywheel

- **Filename:** `08-partner-flywheel`
- **Title:** Partnership architecture that deepens the moat
- **Type:** concept-diagram
- **Single idea:** A network of generators, national labs, and experimental groups feeds measured errors and synthesis results back into Lupine's field database and theorem library.
- **Data points to show:**
  - Master CRADA with NREL spanning 4 of 5 priority targets
  - 5 priority targets: cobalt-free cathodes, halide solid electrolytes, MOF sorbents, electrochemical ammonia catalysts, lead-free perovskites
  - Tier-1 experimental collaborators:
    - Manthiram Laboratory and TexPower → cobalt-free cathodes
    - Ceder group at UC Berkeley and LBNL → halide electrolytes
    - University of Münster → Li-metal interface analytics
    - DTU Chorkendorff group → ammonia verification
    - Yaghi and Long groups at UC Berkeley → MOF direct air capture
- **Suggested form:** Circular flywheel diagram: Lupine at center, partner segments around the rim, arrows showing data → field database → theorem library → better predictions (matplotlib/SVG).
- **Generation method:** matplotlib
- **Caption:** A master CRADA with NREL and tier-1 experimental collaborators close the loop between prediction and synthesis, turning every validated measurement into a more trustworthy next prediction.

---

## 09 — Economics leverage

- **Filename:** `09-economics-leverage`
- **Title:** Infrastructure leverage against a trillion-dollar prize
- **Type:** data-chart
- **Single idea:** A modest 36-month budget is justified by the scale of the materials-innovation prize and the breadth of the priority target portfolio.
- **Data points to show:**
  - NIST Materials Genome Initiative estimated annual value to U.S. industry: $123 billion–$270 billion [^7]
  - ARPA-E portfolio catalyzed billions of dollars in private follow-on funding [^8]
  - Lupine cumulative 36-month budget: ~$3.2 million
  - Priority targets: 5
  - Development timeline compression: 10–20 years → 2–5 years
- **Suggested form:** Log-scale bar chart comparing $3.2M budget to $123B–$270B annual value opportunity, with annotation for the five-target portfolio (matplotlib).
- **Generation method:** matplotlib
- **Caption:** Lupine's ~$3.2 million, 36-month budget is tiny against the NIST-estimated $123 billion–$270 billion annual value of improved materials innovation infrastructure, so even one successful target among five justifies the spend.[^7][^8]

---

## 10 — Trust-loop call to action

- **Filename:** `10-trust-loop-cta`
- **Title:** The trust layer for a real-world Replicator
- **Type:** scene-illustration
- **Single idea:** The end state is a closed loop in which AI-designed matter is made, measured, believed, and fed back—accelerating because errors are characterized, not hidden.
- **Data points to show:**
  - Loop stages: generators propose → Lupine corrects and verifies → experimental partners synthesize → field database and theorem library grow → next generation is more trustworthy
  - Climate window: material discovered in 2035 vs. 2045 can mean tens of gigatonnes of CO₂
  - Final contrast: abundance of predicted crystals → scarcity of validated, actionable predictions
- **Suggested form:** Narrative scene showing a stylized lab/facility/pipeline with data flowing from AI generators through Lupine's correction layer to synthesis partners, with a feedback arc returning to a growing library (MiniMax image client).
- **Generation method:** MiniMax image client
- **Caption:** The trust layer closes the loop between AI-generated candidates, corrected simulations, and experimental validation—turning an abundance of predicted materials into a scarce, defensible set that labs can act on before the climate window closes.

---

## Type counts

- **Data chart:** 4 (01, 04, 06, 09)
- **Concept diagram:** 4 (02, 03, 07, 08)
- **Evidence panel:** 1 (05)
- **Scene illustration:** 1 (10)
