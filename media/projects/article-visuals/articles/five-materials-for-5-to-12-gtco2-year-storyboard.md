# Storyboard: Five Materials That Could Unlock 5–12 GtCO₂/Year

**Article slug:** `five-materials-for-5-to-12-gtco2-year`  
**Output file naming prefix:** `<slug>-<nn>-<short-name>.jpg`

---

## Core narrative summary

Five computationally intractable material classes—cobalt-free cathodes, halide solid electrolytes, MOF sorbents, ammonia catalysts, and lead-free perovskites—are the gatekeepers to gigatonne-scale emissions reductions. Each fails in the same way: universal machine-learning interatomic potentials (uMLIPs) systematically soften the potential energy surface at the under-coordinated atomic environments that govern performance, so predicted candidates look stable and fail in the lab. Lupine Science does not chase bigger models; it measures that systematic error as a physical field over local atomic environments, corrects it at runtime, and verifies the result with machine-checked proof. The five targets were chosen because they are large enough to sum to 5–12 GtCO₂/year, hard enough that raw uMLIPs mis-rank candidates, and precise enough that a single correction layer can apply to all of them. The storyboard walks from the headline impact through the failure mechanism, the correction method, the proof of accuracy, the target-by-target mapping, the scale funnel, the ranking-inversion risk, the partner ecosystem, the deepening economic moat, and finally the deployment roadmap.

---

## Visual 1: Hook — aggregate climate potential

- **Filename:** `01-five-materials-climate-impact`
- **Title:** Five Material Classes Could Unlock 5–12 GtCO₂/Year
- **Type:** data-chart
- **Idea:** The headline figure is the sum of five independently grounded estimates, not a fundraising flourish.
- **Data points:**
  - Cobalt-free LMR cathodes: ~1–3 GtCO₂/year avoided via EV grid/storage decarbonization (derived from IEA battery-linked reductions of 20% direct + 40% indirect of 2030 CO₂ reductions)[^1].
  - Halide solid electrolytes: enables >400 Wh/kg solid-state batteries; market and emissions avoided scale with EV and grid storage deployment.
  - MOF direct-air-capture sorbents: 10 GtCO₂/year annual removal by mid-century per IPCC AR6[^8].
  - Electrochemical ammonia catalysts: >450 MtCO₂/year from Haber-Bosch today[^11].
  - Lead-free perovskites: terawatt-scale solar deployment; lead-based cells already at >26% single-junction and ~34.6% tandem[^14].
  - Aggregate range: **5–12 GtCO₂/year**.
- **Form:** Horizontal stacked bar showing low/high estimate per material, with aggregate range callout.
- **Generation:** matplotlib
- **Caption:** Five independently sized material targets sum to an aggregate climate potential of 5–12 GtCO₂/year.

---

## Visual 2: Problem — systematic softening at under-coordinated sites

- **Filename:** `02-umlip-softening-error`
- **Title:** Why Promising Candidates Fail in the Synthesis Vessel
- **Type:** concept-diagram
- **Idea:** Raw uMLIPs soften the potential energy surface where atoms are under-coordinated, so the transition states and defects that control real performance are predicted incorrectly.
- **Data points:**
  - uMLIPs systematically soften the PES at under-coordinated atomic environments[^2].
  - A **100 meV** barrier error changes the hopping rate by ~50× at room temperature, enough to invert ionic-mobility rankings (article text).
  - Raw uMLIPs underestimate migration barriers by **60%+** in halide electrolytes[^7].
- **Form:** Schematic PES curve with true barrier vs uMLIP-softened barrier at an under-coordinated transition state; inset coordination-number axis.
- **Generation:** matplotlib
- **Caption:** Universal machine-learning potentials systematically soften the energy surface at under-coordinated sites, inverting the rankings that determine which candidates reach the lab.

---

## Visual 3: Mechanism — the correction-and-verification layer

- **Filename:** `03-correction-field-loop`
- **Title:** Measuring Error as a Physical Field, Then Correcting It
- **Type:** concept-diagram
- **Idea:** Lupine treats systematic uMLIP error as a smooth field over local atomic environments, applies analytic-force corrections at runtime, and uses formal proofs to bound where predictions are valid.
- **Data points:**
  - Error field anchored to measurable observables across local atomic environments.
  - Runtime correction adds modest overhead now; target overhead **<1%** in compiled LAMMPS overlay.
  - **77 build-locked Lean 4 theorems with zero sorry proofs** provide machine-checked guarantees.
- **Form:** Circular workflow: measured observables → error-field fit → runtime correction → formal verification/impossibility proof → experimental validation → field update.
- **Generation:** matplotlib
- **Caption:** Systematic error is measured as a physical field over local environments, corrected at runtime, and verified through machine-checked proof rather than p-values.

---

## Visual 4: Evidence — blind prediction accuracy

- **Filename:** `04-blind-prediction-accuracy`
- **Title:** Blind Prediction of Surface Energies Across 36 Model–Material Pairs
- **Type:** data-chart
- **Idea:** The correction layer has been validated blindly on never-fitted data with high correlation and zero adjustable parameters.
- **Data points:**
  - **Pearson r = 0.906** blind prediction of never-fitted surface energies.
  - **36 (model, material)** combinations.
  - **Zero adjustable parameters** in the blind test.
- **Form:** Scatter plot of predicted vs measured surface energy with 1:1 line, annotated r and sample count.
- **Generation:** matplotlib
- **Caption:** Across 36 model–material combinations, the environment error field predicts never-fitted surface energies with Pearson r = 0.906 and zero adjustable parameters.

---

## Visual 5: Solution — one failure mode mapped to five targets

- **Filename:** `05-target-defect-matrix`
- **Title:** The Same Defect-Mediated Failure, Five Different Materials
- **Type:** concept-diagram
- **Idea:** Each target maps a known failure mode onto the same correction mechanism, making the platform transferable across material families.
- **Data points:**
  - LMR cathodes: corrected transition-metal migration barriers; voltage fade driven by oxygen loss and TM migration[^4].
  - Halide electrolytes: corrected Li⁺ hop barriers; current Li₃InCl₆/Li₃YCl₆ achieve **1–12 mS/cm**[^6].
  - MOFs: corrected metal-linker hydrolysis energies; target >**2 mmol/g at 400 ppm**, MOF-808 reached **1.2 mmol/g**[^9].
  - Ammonia catalysts: corrected N₂ dissociation barriers; N≡N bond energy **945 kJ/mol** (article text); DOE target >**60% energy efficiency** at >**300 mA/cm²**[^13].
  - Lead-free perovskites: corrected Sn vacancy formation energies; certified tin-halide record **16.65%**[^22].
- **Form:** 5-row lattice/matrix: material | defect property | uMLIP failure | Lupine correction | experimental outcome.
- **Generation:** matplotlib
- **Caption:** Each target is a different expression of the same defect-mediated problem, and each is addressed by the same runtime correction and verification layer.

---

## Visual 6: Scale — from materials to gigatonnes

- **Filename:** `06-impact-funnel`
- **Title:** How a 100 meV Correction Translates to Gigatonne Impact
- **Type:** data-chart
- **Idea:** Small energy corrections change material rankings, which change which candidates are synthesized, scaled, and deployed, ultimately shifting sector-level emissions.
- **Data points:**
  - Barrier correction: ~60–100 meV.
  - Conductivity/selectivity improvement: orders of magnitude at room temperature because σ ∝ e^(−Eₐ/kBT) (article text).
  - Sector emissions addressed: batteries (IEA 20% direct + 40% indirect of 2030 reductions)[^1], DAC (10 GtCO₂/year by mid-century)[^8], ammonia (>450 MtCO₂/year)[^11], solar (terawatt-scale deployment).
  - Aggregate: **5–12 GtCO₂/year**.
- **Form:** Funnel/Sankey from atomic barrier → material property → device performance → sector deployment → annual CO₂ impact.
- **Generation:** matplotlib
- **Caption:** A sub-0.1 eV correction at the atomic scale propagates into orders-of-magnitude device improvements and gigatonne-scale climate impact.

---

## Visual 7: Risk — ranking inversion before and after correction

- **Filename:** `07-ranking-inversion-risk`
- **Title:** Raw Rankings Discard the Best Candidates
- **Type:** evidence-panel
- **Idea:** Without correction, uMLIPs can rank fast-ion conductors as insulators and stable MOFs as unstable, sending experimental effort to the wrong targets.
- **Data points:**
  - Raw uMLIP barrier underestimation: **60%+**[^7].
  - 100 meV error → ~50× rate change at 300 K (article text).
  - Demonstrative ranking list: top-5 candidates reordered between raw uMLIP and corrected barriers.
- **Form:** Side-by-side top-N lists or heatmap: raw rank vs corrected rank, with false negatives highlighted.
- **Generation:** matplotlib
- **Caption:** Before correction, the highest-performing candidates can be ranked below also-rans; the correction layer recovers the true ordering and prevents wasted synthesis runs.

---

## Visual 8: Partnership/ecosystem — experimental partner map

- **Filename:** `08-partner-ecosystem-map`
- **Title:** From Corrected Predictions to Named Experimental Partners
- **Type:** scene-illustration
- **Idea:** Computational discovery only matters if it is coupled to synthesis, characterization, cell/module testing, and scale-up partners.
- **Data points:**
  - LMR cathodes: Manthiram Lab (UT Austin), TexPower EV Technologies (>230 mAh/g)[^17], Battery500 Consortium / PNNL (350 Wh/kg pouch cells at >600 cycles)[^18], Forge Nano (ALD coatings +30% cycle life)[^19].
  - Halide electrolytes: CEDER Group (UC Berkeley/LBNL), Janek/Zeier Group (Münster), Argonne National Laboratory, Solid Power Inc.
  - MOFs: Yaghi and Long groups (UC Berkeley), Farha Group (Northwestern), BASF (first commercial-scale producer, several hundred tons/year)[^20].
  - Ammonia catalysts: DTU Chorkendorff group (Ca-mediated NRR, *Nature Materials* 2024)[^21], Stanford SUNCAT.
  - Lead-free perovskites: NREL, University of Queensland Wang Group (certified 16.65% tin-halide record)[^22], Tandem PV Inc.
- **Form:** Stylized global/lab map with material-family nodes connected to partner logos/institutions.
- **Generation:** MiniMax image client
- **Caption:** Each target is anchored to named labs and companies that can synthesize, characterize, and scale the corrected top candidates.

---

## Visual 9: Economics/moat — feedback loop and widening defensibility

- **Filename:** `09-moat-feedback-loop`
- **Title:** Every Screen Deepens the Moat
- **Type:** concept-diagram
- **Idea:** Each campaign adds validated field measurements, sharpens impossibility boundaries, and tightens experimental feedback, creating compounding defensibility.
- **Data points:**
  - Each screen adds validated field measurements.
  - Each impossibility proof sharpens the boundary of applicability.
  - Each experimental validation tightens the feedback loop.
  - Cost lever example: each **$10/tCO₂** reduction in DAC sorbent cost saves billions of dollars annually at gigatonne scale.
- **Form:** Flywheel/loop diagram: screen → validate → prove → update field → next screen, with widening barrier curve over time.
- **Generation:** matplotlib
- **Caption:** Every screen, proof, and validation feeds back into the error field, deepening the platform’s moat and lowering the cost of each subsequent discovery campaign.

---

## Visual 10: Call to action — five-year deployment roadmap

- **Filename:** `10-five-year-roadmap`
- **Title:** From Correction Layer to Deployable Materials
- **Type:** concept-diagram
- **Idea:** The 5–12 GtCO₂/year figure is reachable only if corrected predictions are coupled to a staged chain of synthesis, characterization, testing, and scale-up.
- **Data points:**
  - Year 1–2: field validation and partner-screen launch for LMR cathodes and halide electrolytes (Lupine estimate / unaudited).
  - Year 2–3: MOF hydrolysis correction + DAC partner campaigns (Lupine estimate / unaudited).
  - Year 3–4: ammonia catalyst scaling-relation breaker screens (Lupine estimate / unaudited).
  - Year 4–5: lead-free perovskite metastability proofs and tandem module path (Lupine estimate / unaudited).
  - Milestone chain: predicted crystal → synthesis → characterization → cell/module test → scale-up.
- **Form:** Horizontal timeline with stage gates and partner handoffs.
- **Generation:** matplotlib
- **Caption:** The path to gigatonne impact runs through a staged chain of corrected predictions, partner synthesis, and device-scale validation.

---

## Output path

`/home/alex/Dev/lupine/lupine-science/media/projects/article-visuals/articles/five-materials-for-5-to-12-gtco2-year-storyboard.md`

## Visual type tally

| Type            | Count |
|-----------------|-------|
| data-chart      | 3     |
| concept-diagram | 5     |
| evidence-panel  | 1     |
| scene-illustration | 1  |
| **Total**       | **10**|
