# Storyboard: Methane and Refrigerants — Cutting the Non-CO₂ Climate Forcers

**Article slug:** `methane-and-refrigerants-cutting-the-non-co2-climate-forcers`  
**Article date:** 2026-07-16  
**Visual spec:** see `/media/projects/article-visuals/BRIEF.md`

## Core narrative summary

Methane and hydrofluorocarbon refrigerants are the two largest non-CO₂ climate levers, together capable of avoiding 0.5–1 °C of warming. Both are constrained by materials that do not yet exist: low-temperature methane-conversion catalysts and safe, high-performance refrigerants. The article argues that the bottleneck is not chemistry but a shared computational failure mode — universal machine-learning interatomic potentials (uMLIPs) systematically soften the potential energy surface in under-coordinated environments by 15–60%, inverting candidate rankings and producing false-positive catalysts. Lupine's measured environment error field corrects those predictions at uMLIP speed, while a Lean 4 verification layer machine-checks which claims can be believed. The same correction geometry applies to direct methane-to-methanol catalysis, methane pyrolysis, fluorine-free refrigerant design, and solid-state caloric materials.

---

## Visuals

### 01. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-01-non-co2-warming-lever.jpg`

- **Title:** The Non-CO₂ Warming Lever
- **Type:** data-chart
- **Single idea:** Methane and HFC refrigerants are comparable to the entire energy-sector decarbonization problem in near-term climate leverage.
- **Data points to show:**
  - Cutting anthropogenic methane 30% by 2030 could avoid roughly **0.3 °C** of warming by 2040 [^1].
  - Full Kigali Amendment compliance could avoid up to **0.5 °C** by 2100 [^2].
  - Methane is responsible for roughly **30%** of current global warming.
  - Methane's 20-year global warming potential is **80–85×** that of CO₂ [^4].
  - Anthropogenic methane emissions: **~360 Mt CH₄/year**, equivalent to **~10 GtCO₂e** at 20-year GWP [^5].
- **Suggested form:** Grouped horizontal bar chart comparing warming avoided (°C) and current warming contribution (%), with methane and refrigerants side by side.
- **Generation:** matplotlib
- **Caption:** Methane and HFC refrigerants together offer warming avoidance comparable to the entire energy-sector transition, yet both depend on materials that do not yet exist. *Sources: UNEP Global Methane Assessment, 2021; UNEP / US EPA Kigali Amendment impact estimates; IPCC AR6.*

---

### 02. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-02-umlip-softening-error.jpg`

- **Title:** Where uMLIPs Fail: Systematic Softening in Under-Coordinated Environments
- **Type:** evidence-panel
- **Single idea:** uMLIPs are accurate in bulk but systematically soften the potential energy surface where catalysis and materials function actually happen.
- **Data points to show:**
  - uMLIPs soften the potential energy surface by **15–60%** in under-coordinated environments [^3].
  - Consequences: inverted candidate rankings, false-positive catalysts, discarded metastable phases.
  - Environments affected: surfaces, transition states, radical fragments, phase boundaries.
- **Suggested form:** Split evidence panel: left side shows coordination-number axis with error magnitude as a diverging heatmap; right side shows a before/after ranking scatter (raw uMLIP vs DFT) with inverted rankings highlighted.
- **Generation:** matplotlib
- **Caption:** Universal machine-learning potentials soften the energy surface by 15–60% at surfaces, transition states, and radical fragments — the exact environments that determine catalyst and refrigerant performance. *Source: Deng et al., npj Computational Materials, 2025.*

---

### 03. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-03-environment-error-field.jpg`

- **Title:** Lupine's Measured Environment Error Field
- **Type:** concept-diagram
- **Single idea:** Three anchored observables plus a bulk constraint let Lupine correct uMLIP errors at runtime for low-coordination environments the field was never directly fitted to.
- **Data points to show:**
  - Reference bulk environment: fcc metal with coordination number **12**, error defined as zero.
  - **Three anchor observables** fix the field.
  - Cubic spline predicts correction at lower-coordination environments [^11].
  - Current Python overhead: **15.6%**, expected to drop below **1%** in a compiled overlay [^11].
- **Suggested form:** Concept diagram with a horizontal coordination-number axis, anchor points, cubic-spline correction curve, and inset showing force-correction vectors on a lattice fragment.
- **Generation:** matplotlib
- **Caption:** The environment error field uses three anchor observables and a bulk constraint to correct under-coordinated predictions without retraining the underlying potential. *Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.*

---

### 04. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-04-blind-prediction-correlation.jpg`

- **Title:** Blind Prediction Accuracy Across 36 (Model, Material) Combinations
- **Type:** data-chart
- **Single idea:** The correction layer achieves DFT-level accuracy with zero adjustable parameters, making it reliable enough for capital decisions.
- **Data points to show:**
  - Pearson correlation coefficient **r = 0.906**.
  - p-value **p = 10⁻⁴**.
  - 95% confidence interval **[0.82, 0.96]**.
  - **36** (model, material) combinations [^11].
- **Suggested form:** Scatter plot of corrected prediction vs reference value with unity line, annotated with r, p, CI, and n.
- **Generation:** matplotlib
- **Caption:** Blind tests across 36 model-material combinations yield r = 0.906 with no adjustable parameters, giving capital decisions a DFT-accurate signal at uMLIP speed. *Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.*

---

### 05. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-05-methane-to-methanol-scaling.jpg`

- **Title:** Breaking the Scaling Relation in Direct Methane-to-Methanol
- **Type:** concept-diagram
- **Single idea:** The direct route to methanol is blocked by a scaling relation between C–H activation and over-oxidation; corrected barriers reveal candidates that break it.
- **Data points to show:**
  - C–H bond dissociation energy in methane: **~439 kJ mol⁻¹** [^6].
  - Industrial syngas route operates at **800–1000 °C**.
  - Direct route could cut energy use by **20–30%** [^8].
  - Global methanol demand: **~110 Mt/year**, market value **~$40 billion/year** [^9].
  - Fe/Cu-zeolite systems achieve high selectivity but low single-pass conversion because methanol must be extracted before further oxidation [^10].
- **Suggested form:** Reaction-coordinate diagram with two curves: one showing the scaling-relation trap (high activity → over-oxidation) and one showing the corrected low-barrier, selective path.
- **Generation:** matplotlib
- **Caption:** Corrected transition-state barriers can escape the scaling relation that forces active methane catalysts to over-oxidize methanol. *Sources: Berkowitz et al., J. Phys. Chem., 1994; IEA / Methanol Institute technology assessments; Grundner et al., Nat. Commun., 2015.*

---

### 06. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-06-methane-pyrolysis-temperature.jpg`

- **Title:** Methane Pyrolysis: Lower Temperature, Useful Carbon
- **Type:** data-chart
- **Single idea:** Molten-metal and molten-salt catalysts lower methane pyrolysis temperatures while producing a sequesterable solid carbon co-product.
- **Data points to show:**
  - Conventional thermal pyrolysis: **>1000 °C**.
  - Molten-metal / molten-salt catalysts: **700–900 °C** [^12].
  - Products: hydrogen + graphitic carbon / carbon black.
  - If carbon is durable or sequestered, the process can be near-zero-emission.
- **Suggested form:** Horizontal bar chart comparing process temperature ranges for thermal pyrolysis, molten-metal catalytic pyrolysis, and target low-temperature operation, with product icons.
- **Generation:** matplotlib
- **Caption:** Molten-metal catalysts can cut methane pyrolysis temperatures from above 1000 °C to 700–900 °C, producing hydrogen and a storable solid carbon product. *Source: Abánades, Int. J. Hydrogen Energy, 2012.*

---

### 07. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-07-refrigerant-gwp-landscape.jpg`

- **Title:** The Refrigerant Trade-Off: GWP, Performance, and Safety
- **Type:** data-chart
- **Single idea:** No current refrigerant satisfies low GWP, high performance, and safety simultaneously; the design space needs a corrected computational screen.
- **Data points to show:**
  - R-32: **GWP = 675**.
  - R-1234yf: **GWP < 1**, but patented, costly, and raises decomposition and flammability questions [^14].
  - Uncontrolled HFC emissions could rise to **5–9 GtCO₂e/year** by mid-century [^13].
  - Target: fluorine-free refrigerant with **GWP < 10**, **COP within 10% of R-410A**, acceptable safety classification.
  - Global HVAC refrigerant market: **~$20 billion/year**.
- **Suggested form:** Scatter plot of GWP (log x-axis) vs COP relative to R-410A (y-axis), with safety-classification zones and current refrigerants labeled.
- **Generation:** matplotlib
- **Caption:** Today's refrigerants force a choice between low GWP, high efficiency, and safety; computational screening must explore millions of candidates to find one that satisfies all three. *Sources: ASHRAE Standard 34; Velders et al., Climatic Change, 2021.*

---

### 08. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-08-caloric-verification-workflow.jpg`

- **Title:** Caloric Materials: From Correction to Verified Discovery
- **Type:** concept-diagram
- **Single idea:** For caloric materials, correction plus proof separates supported predictions of transition temperature and entropy from synthesis-dependent microstructure claims.
- **Data points to show:**
  - Solid-state refrigeration can exceed vapor-compression efficiency by **20–50%** [^15].
  - Hysteresis losses come from nucleation, twin boundaries, and metastable intermediate phases.
  - **77** build-locked Lean 4 theorems prove correction bounds and impossibility conditions [^11].
- **Suggested form:** Workflow diagram showing the pipeline: uMLIP screen → error-field correction → candidate ranking by entropy change and hysteresis → Lean 4 verification of supported claims → synthesis/operating-condition boundary check.
- **Generation:** matplotlib
- **Caption:** Caloric materials promise 20–50% efficiency gains, but only a verified correction pipeline can separate genuine thermodynamic predictions from microstructure assumptions. *Sources: Gutfleisch et al., Adv. Mater., 2011; DOE / ARPA-E; Lupine Science, Strategic Discovery Plan, Sections 2–3.*

---

### 09. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-09-market-and-timeline.jpg`

- **Title:** Policy Timelines and Addressable Markets
- **Type:** data-chart
- **Single idea:** The policy windows are short and the product markets are large, so materials discovery must accelerate beyond brute-force experiment.
- **Data points to show:**
  - Global methanol market: **~$40 billion/year** [^9].
  - Global HVAC refrigerant market: **~$20 billion/year**.
  - Global Methane Pledge target: **2030** [^1].
  - Kigali Amendment target: **~80% HFC consumption reduction by 2047** [^2].
  - Combined warming avoidance potential: **0.5–1 °C**.
- **Suggested form:** Dual-axis chart: bars for market size ($B/year) and timeline arrows/markers for policy deadlines, with a shaded band indicating cumulative warming avoidance.
- **Generation:** matplotlib
- **Caption:** Tens of billions of dollars in annual product markets and 2030–2047 policy deadlines make fast, verified materials discovery an economic and climate imperative. *Sources: Methanol Institute; UNEP Global Methane Assessment, 2021; UNEP / US EPA Kigali Amendment impact estimates.*

---

### 10. `methane-and-refrigerants-cutting-the-non-co2-climate-forcers-10-common-correction-geometry.jpg`

- **Title:** One Correction Geometry, Many Climate Targets
- **Type:** concept-diagram
- **Single idea:** The same structural correction geometry unifies methane conversion, refrigerant design, caloric materials, batteries, direct air capture, and the next targets in the series.
- **Data points to show:**
  - Applications sharing the same failure mode: C–H activation transition states, metal-carbon binding sites, refrigerant radical transition states, caloric twin boundaries.
  - The same field also corrects battery cathodes and direct-air-capture sorbents [^11].
  - Next articles in the series: critical minerals, PFAS, and cement.
- **Suggested form:** Hub-and-spoke concept diagram with the environment error field at the center and spokes for each application domain, color-coded by climate target.
- **Generation:** matplotlib
- **Caption:** Methane, refrigerants, caloric materials, batteries, and direct air capture share the same under-coordination failure mode — and the same correction geometry. *Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.*

---

## Visual type tally

| Type | Count | Visual numbers |
|------|-------|----------------|
| data-chart | 5 | 01, 04, 06, 07, 09 |
| concept-diagram | 4 | 03, 05, 08, 10 |
| evidence-panel | 1 | 02 |
| scene-illustration | 0 | — |

**Generation method:** All 10 visuals should be generated programmatically with matplotlib per the visual brief. None require the MiniMax image client; the concepts are technical and better served by data charts, evidence panels, and concept diagrams.
