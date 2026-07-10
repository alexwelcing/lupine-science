# Climate Partnerships Series — Outline

## Article 1: The 0.2% Synthesis Problem

> **Type:** article
> **Proposed hero motif:** `shape-of-wrongness_wide_v6` or new generated variant: scattered error vectors resolving onto a single indigo ribbon, with a faint 0.2% annotation suggested by composition only (no text in image).
> **Target length:** 1,800–2,200 words

### Key claims (from `/home/alex/Dev/lupine/climate.md`)

- The IEA projects batteries are directly linked to ~20% of required 2030 CO₂ reductions and indirectly to another 40%.
- Clean energy investment must grow from $1.8 trillion (2023) to $4.5 trillion annually by the early 2030s; a substantial fraction of that gap is a materials gap.
- Google DeepMind's GNoME predicted 2.2 million crystals; 380,000 were computed stable; only 736 had been independently synthesized by late 2023 — a 0.2% validation rate.
- The A-Lab autonomous synthesis facility reported 63% success, but subsequent critique found two-thirds of "novel" targets were known disordered phases, reducing the true novel discovery rate to near zero.
- These failures stem from four structural barriers: defect/bulk asymmetry, combinatorial wall, metastability, and ranking inversion.
- The gap between "predicted stable" and "synthesized and functional" is the defining bottleneck in computational materials discovery.

### Structure

1. **Lead.** Open with the climate investment gap and the counterintuitive claim: we are not short of predictions; we are short of validated predictions.
2. **The 0.2% number.** Walk through GNoME's 2.2M → 380K → 736 funnel. Explain why this is not a GNoME failure but a structural pipeline failure.
3. **A-Lab as cautionary tale.** Report the 63% headline, then the critique. Use it to show that faster synthesis without better verification does not solve the bottleneck.
4. **Four barriers, briefly named.** One paragraph each: defect/bulk asymmetry, combinatorial wall, metastability, ranking inversion. This sets up Article 2.
5. **Why it matters for climate.** Connect the narrow deployment window (2025–2035) to the cost of false positives and missed positives.
6. **Transition.** Introduce Lupine Science as a correction-and-verification layer, not another generator.

---

## Article 2: A Field, Not a Neural Net

> **Type:** article
> **Proposed hero motif:** `field-gradient_wide_v10` or new generated variant: a smooth indigo field gradient over a sparse lattice, evoking a measured physical quantity rather than a learned surface.
> **Target length:** 2,000–2,500 words

### Key claims (from `/home/alex/Dev/lupine/climate.md`)

- Lupine measures systematic error as a physical field over local atomic environments, corrects it at runtime with analytic forces, and verifies claims through machine-checked proof.
- The environment error field is defined over coordination number; for fcc bulk atoms (c=12) the error is defined as zero.
- Three anchor observables (100, 111, vacancy formation energy) fix the field; a cubic spline with P(12)=0 predicts the never-fitted 110 surface energy.
- Blind prediction achieves Pearson r=0.906 (p=10⁻⁴, 95% CI [0.82, 0.96]) across 36 (model, material) combinations with zero adjustable parameters.
- Runtime correction adds 15.6% overhead in Python and will drop below 1% in a compiled LAMMPS overlay; corrected uMLIPs remain ~10⁵× faster than DFT.
- 77 build-locked Lean 4 theorems with zero sorry proofs provide machine-checked guarantees.
- The kernel-rejected claim episode: a claim that survived statistical filtering was rejected at integer precision, reducing the count from 27/36 to 26/36.
- Where correction fails, Lupine proves impossibility rather than reporting a p-value.

### Structure

1. **Lead.** The wrongness of interatomic potentials has a shape — a low-dimensional error geometry.
2. **What the field is.** Define the environment error field over coordination number. Contrast with delta-ML and fine-tuning.
3. **How it is measured, not learned.** Three anchors; cubic spline; P(12)=0; blind prediction of the 110 surface energy.
4. **The r=0.906 result.** Present the table, the confidence interval, and the null mean (r=0.44).
5. **Runtime correction.** Analytic forces, LAMMPS overlay, 15.6% overhead now, <1% soon.
6. **Formal verification.** 77 theorems, zero sorry; the kernel-rejected claim as a vignette.
7. **Impossibility proofs.** Explain the three boundary conditions where correction cannot apply and why that is actionable.
8. **The six-step loop.** Briefly describe simulate → identify → validate → generate → verify → improve.
9. **Transition to climate targets.** This method is not abstract; it maps onto five specific material bottlenecks.

---

## Article 3: Five Materials That Could Unlock 5–12 GtCO₂/Year

> **Type:** article
> **Proposed hero motif:** New generated composite: five faint indigo glyphs or lattice fragments arranged horizontally, each representing a target; or `constellation-threads_wide_v8` extended with five nodes.
> **Target length:** 2,200–2,500 words

### Key claims (from `/home/alex/Dev/lupine/climate.md`)

| Target | Climate impact | Market / context | Key barrier | Lupine mechanism |
|---|---|---|---|---|
| Cobalt-free LMR cathodes | 2–5 GtCO₂ avoided | $400B+ Li-ion chain; 4.7 TWh by 2030 | Voltage fade; TM migration; oxygen redox | Corrected migration barriers preserve ionic mobility ranking across 10⁶ compositions |
| Earth-abundant halide solid electrolytes | 1–3 GtCO₂ avoided | $886M → $24.3B by 2034 | Li⁺ hop barriers underestimated 60%+; In/Sc/Y scarcity | Corrected barriers recover DFT accuracy; 10⁵-composition screen |
| MOFs for direct air capture | 0.5–2 GtCO₂/year | $4.3B DAC market by 2034 | Humidity stability; synthesis cost >$50/kg | Corrected hydrolysis barriers; impossibility proofs for unsupported frameworks |
| Electrochemical ammonia catalysts | ~0.45 GtCO₂/year | $221.6B green NH₃ by 2035 | N≡N activation; HER competition; Li-mediated efficiency stuck at ~28% | Corrected N₂ dissociation barriers; selective field failure flags scaling-relation breakers |
| Lead-free perovskite solar absorbers | 0.5–1 GtCO₂/year | $11B PV market by 2033 | Sn²⁺ oxidation; metastability | Corrected Sn vacancy formation energies; provable boundaries for metastable phases |
| **Combined** | **5–12 GtCO₂/year** | **>$650B** | — | Correction + verification across all five |

### Structure

1. **Lead.** Introduce the aggregate number: 5–12 GtCO₂/year across five targets. Explain why a correction layer unlocks a portfolio rather than a single material.
2. **Selection criteria.** Each target was chosen for climate impact, discovery difficulty, and a precise Lupine mechanism.
3. **Batteries (cathodes + electrolytes).** Treat as a pair: LMR cathodes and halide SEs are the two largest levers and share a Li-ion transport theme. Include the 300 Wh/kg / >1,000 cycles / <$80/kWh target and the >10 mS/cm conductivity target.
4. **Carbon removal (MOFs for DAC).** Explain why sorbent cost and humidity stability are the gate; tie to the $10/tCO₂ = $10B/year arithmetic.
5. **Industrial decarbonization (ammonia).** Contrast Haber-Bosch's 450 MtCO₂/year with Li-mediated electrochemical NRR's ~28% energy efficiency; introduce the >60% target.
6. **Solar (lead-free perovskites).** Lead toxicity as the deployment barrier; 20% efficiency + 25-year stability target.
7. **Synthesis.** The targets are not independent: they all involve defect-mediated properties in multi-component spaces where uncorrected uMLIPs systematically soften the PES.
8. **Transition to partners.** Predictions are necessary but not sufficient; the path to impact runs through named experimental collaborators.

---

## Article 4: From Predicted Crystal to Commercial Cell

> **Type:** article
> **Proposed hero motif:** New generated variant: a lattice fragment on the left resolving into a simplified cell/pack form on the right, connected by an indigo thread — "bits → atoms → cells." Alternatively, `bits-to-atoms_wide_v5` with a commercial-cell silhouette subtly implied.
> **Target length:** 2,000–2,500 words

### Key claims (from `/home/alex/Dev/lupine/partnerships.md`)

**Cobalt-free LMR cathodes**
- Tier 1 immediate: Manthiram Lab / UT Austin & TexPower EV Technologies; Battery500 Consortium (PNNL-led); Forge Nano, Inc.
- Tier 2 (6–12 months): POSCO Future M; General Motors / Ultium Cells LLC; LG Energy Solution; Argonne National Laboratory / APS.
- Key metrics: >250 mAh/g reversible capacity; <0.5% voltage fade per 100 cycles; cost parity with LFP.
- TexPower 15-ton/year pilot producing NMA cathodes at >230 mAh/g; GM targeting 2028 LMR deployment.

**Earth-abundant halide solid electrolytes**
- Tier 1 immediate: CEDER Group / UC Berkeley & LBNL; University of Münster (Janek/Zeier); Argonne National Laboratory; Solid Power Inc.
- Tier 2 (6–12 months): University of Waterloo / Nazar Group; Factorial Energy; Ion Storage Systems; Battery500 Consortium.
- Key metrics: >10 mS/cm conductivity; stability vs. Li metal; mechanochemical synthesis compatibility.

**MOFs for direct air capture**
- Tier 1 immediate: UC Berkeley / Yaghi Group; UC Berkeley / Long Group / Baker Hughes Institute; Northwestern / Farha Group; BASF SE.
- Tier 2 (6–12 months): Svante Technologies; NETL; Climeworks; Atoco.
- Key metrics: >2 mmol/g CO₂ working capacity at 400 ppm; humidity-stable over >10,000 cycles; DAC at <$50/tCO₂.

**Electrochemical ammonia catalysts**
- Tier 1 immediate: DTU / Chorkendorff; Stanford / SUNCAT; Jupiter Ionics; ARPA-E REFUEL.
- Tier 2 (6–12 months): Caltech / Manthiram Group; Nitricity.
- Tier 3 (12–24 months): CF Industries; NREL.
- Key metrics: >60% energy efficiency; >300 mA/cm² partial current density.

**Lead-free perovskite solar absorbers**
- Tier 1 immediate: NREL; University of Queensland / Wang Group; Tandem PV Inc.; Northwestern / Kanatzidis Group.
- Tier 2 (6–12 months): University of Oxford / Snaith Group; Swift Solar; Stanford / Karunadasa Group.
- Tier 3 (12–24 months): Oxford Photovoltaics.
- Key metrics: >20% certified PCE; >25-year stability; scalable manufacturing.

**Cross-cutting partners**
- NREL spans four of five targets; highest-value master CRADA candidate.
- UC Berkeley covers cathodes, halide SEs, and MOF DAC via Ceder, Yaghi, and Long groups.
- ARPA-E should be approached with a portfolio strategy (REFUEL, IONICS, OPEN).

### Structure

1. **Lead.** The difference between a predicted crystal and a commercial cell is a chain of partners. Computational discovery is only the first link.
2. **The partnership-first thesis.** Lupine does not compete with generators, labs, or databases; it corrects and verifies their outputs, creating value at every layer.
3. **Batteries: cathodes to cells.** Walk through Manthiram/TexPower, Battery500, Forge Nano, GM/Ultium, POSCO. Show how computational screening → synthesis → coating → cell testing → OEM integration.
4. **Batteries: electrolytes to cells.** Ceder/UC Berkeley, Münster, Argonne, Solid Power, Factorial, Ion Storage. Emphasize the earth-abundant Zr/Fe/Al/Mg pathway.
5. **Carbon removal: MOFs to gigafactories.** Yaghi/Long at Berkeley, Farha at Northwestern, BASF, Svante, Climeworks. Show how a sorbent moves from linker design to filter manufacturing to field deployment.
6. **Industrial decarbonization: ammonia to market.** DTU/Chorkendorff for rigorous verification, Stanford/SUNCAT for screening, Jupiter Ionics for cell engineering, ARPA-E REFUEL for funding benchmarks.
7. **Solar: lead-free absorbers to tandem modules.** NREL certified testing, UQ world-record validation, Tandem PV integration, Oxford PV scale-up.
8. **Cross-cutting architecture.** NREL, UC Berkeley, ARPA-E as multi-target hubs; the case for a master CRADA and portfolio funding strategy.
9. **Transition to moat.** Partners validate the science; the verification layer makes the science trustworthy at scale.

---

## Article 5: Investing in the Trust Layer

> **Type:** article
> **Proposed hero motif:** `error-vector-alignment_quiet_v6` or new generated variant: many near-parallel error vectors collapsing to one direction, with the Lupine mark as a recurring corner element.
> **Target length:** 1,500–2,000 words

### Key claims (from `/home/alex/Dev/lupine/climate.md`)

- Lupine's competitive position is a correction-and-verification layer between structure generation and experimental synthesis.
- The three pillars of defensibility: (1) measured error field, not learned; (2) 77 build-locked Lean 4 theorems with zero sorry proofs; (3) runtime overlay compatible with LAMMPS and any uMLIP.
- The moat deepens with use: each screening campaign adds validated field measurements; each impossibility proof sharpens the boundary of applicability; each experimental validation tightens the feedback loop.
- Comparison with alternatives: DFT (accurate but 10⁵× slower); raw uMLIPs (fast but 15–60% defect errors); delta-ML (requires per-system retraining); fine-tuning (requires curated target-system data).
- The NIST MGI economic analysis estimates $123B–$270B in annual value from improved materials innovation infrastructure.
- ARPA-E's $3.5B portfolio catalyzed $11.8B in private follow-on funding.
- Speed without accuracy wastes experiments; accuracy without speed misses the climate window. Lupine aims to provide both.

### Structure

1. **Lead.** In a market flooded with predicted materials, the scarce resource is trust. The winning platform is the one that de-risks the lab queue.
2. **The layered pipeline.** Generation (MatterGen, GNoME) → prediction (CHGNet, MACE, Materials Project) → synthesis (A-Lab, manual labs) → validation (national labs, startups). Show where each layer fails and where Lupine sits.
3. **Three pillars of defensibility.** Measured field; formal verification; runtime compatibility. One section each.
4. **Why the moat deepens with use.** Reference database of systematic biases; transfer to adjacent systems; theorem families expanding to bcc, hcp, layered structures.
5. **The economic case.** NIST MGI and ARPA-E leverage numbers; Lupine's $3.2M 36-month budget versus the value at stake.
6. **Risk and honesty.** Name what is still open: field extension to bcc/hcp/layered systems; second-shell corrections; industrial validation. This reinforces the proof-first voice.
7. **Closing vision.** The trust layer for a real-world Replicator: a world where AI-designed matter can be made, measured, and believed.
