> **Date:** 2026-07-09
> **Deck:** Five material classes — cobalt-free cathodes, halide solid electrolytes, MOF sorbents, ammonia catalysts and lead-free perovskites — where getting a fast model wrong would cost the most, and what we would need to test.
> **Summary:** Five climate-relevant material classes whose performance depends on defects, surfaces and transition states, where machine-learned potentials are least reliable. This July 2026 piece describes the targets, the literature on why they matter, and what we have tested so far. A direction, not a result; it makes no climate-impact claim of its own.
> **Updated:** 2026-11-11
> **Status:** Direction
> **Evidence Status:** Direction, not a result. Capability statements below are hypotheses we have not tested on these materials. What we have tested: in Round 4 (July 2026) the raw models missed our barrier gate, our adsorption and lattice/elastic correction tests failed, and the magnetism test abstained; in Round 5 our barrier correction abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models). Literature figures are attributed to their sources. An earlier version of this page was titled with a 5–12 GtCO₂/year range; that range was our own sum of literature estimates, not a measured or enabled outcome, and is retired (see the corrections log).

# Five Materials Worth Getting Right: Cathodes, Electrolytes, Sorbents, Catalysts and Absorbers

The difference between a climate model and a climate outcome is usually a material. Batteries need cathodes that survive a thousand cycles. Solid-state cells need electrolytes that conduct lithium without conducting dendrites. Direct air capture needs sorbents that bind CO₂ at 400 ppm and survive humidity. Ammonia synthesis needs catalysts that split dinitrogen without the Haber-Bosch furnace. Solar needs absorbers that rival lead perovskites without the lead. None of these materials exists at the required scale and price.

We are not trying to invent these materials one at a time. The direction is narrower: to measure where fast machine-learned models of atoms go wrong in the multi-component spaces where these materials live, so that a lab can tell which predictions to trust before committing to one.

Each target was chosen because it matters for decarbonization by published estimates and because the property that decides it is set by defects, surfaces or transition states. Whether a correction would help on any of them is an open question.

## Why these targets

Each target meets three conditions.

First, **large climate relevance by published estimates**. The International Energy Agency estimates that batteries alone are directly linked to roughly 20% of the CO₂ reductions required by 2030, and indirectly to another 40%[^1]. Two of the five targets are battery materials for that reason; the other three address industrial emissions, carbon removal and solar deployment.

Second, **discovery difficulty**. In every case, the property that determines performance — ion migration, defect formation, catalytic barrier, oxidation resistance — occurs in under-coordinated atomic environments. Deng et al. document a systematic softening of the potential energy surface in universal MLIPs trained on MPtrj, with energies and forces under-predicted away from equilibrium[^2]. Raw uMLIPs are fast but may be wrong where it matters; DFT is accurate but expensive at screening scale.

Third, a **named failure mode that could be measured**. LMR cathodes depend on transition-metal migration barriers; halide electrolytes on Li⁺ hop barriers; MOFs on hydrolysis energies; ammonia catalysts on N₂ dissociation barriers and scaling relations; lead-free perovskites on Sn vacancy formation and metastable phases. For each, the first step would be measuring the model error against published references; correcting it is a hypothesis.

The five share a defect-mediated structure, which is why we group them. That does not mean progress on one transfers to the others; each would need its own measurement.

## Batteries: cathodes and electrolytes as a pair

### Cobalt-free lithium-manganese-rich cathodes

![A substation battery enclosure in cutaway beside a transformer, showing one layered cell stack with cathode, ceramic separator, and current collector as plain unmarked slabs — The thin ceramic separator carries the indigo ion path while keeping the two electrodes apart](images/five-materials-for-5-to-12-gtco2-year-inline-01.jpg)

The highest-leverage near-term target is a cobalt-free lithium-manganese-rich (LMR) cathode exceeding **300 Wh/kg cell-level energy density**, cycling stability above **1,000 cycles**, and cost below **$80/kWh**. The EaCAM consortium at Argonne National Laboratory has demonstrated cobalt-free LMR systems at approximately **270 Wh/kg** and ~$80/kWh[^3].

The remaining barrier is voltage fade. LMR cathodes derive excess capacity from oxygen redox, but oxygen redox triggers oxygen loss, transition-metal migration from octahedral to tetrahedral sites, and surface reconstruction into spinel or rock-salt phases that block lithium diffusion[^4]. Removing cobalt—essential for supply-chain security, since the Democratic Republic of Congo produces roughly 70% of global cobalt[^5]—exacerbates the instability.

The compositional space is enormous: when concentration gradients, coatings and doping profiles are included, the candidate count runs to millions. The migration barriers that govern voltage fade involve under-coordinated metal ions far from bulk configurations. A **100 meV** barrier error changes the hopping rate by roughly e^(E/kBT) ≈ 50× at room temperature, enough to reorder candidate compositions by ionic mobility.

Whether such barrier errors can be measured and corrected is the hypothesis. Our only barrier tests so far are on Li-ion migration paths: in Round 4 four foundation MLIPs missed a 40 meV gate (MAE 135.0–242.5 meV on completed paths), and in Round 5 a direction-gated correction abstained for all four ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).

### Earth-abundant halide solid electrolytes

The second battery target is a halide solid electrolyte in the Li–Zr–Cl or Li–Fe–Cl family with ionic conductivity above **10 mS/cm**, electrochemical stability against lithium metal, and moisture tolerance. Solid-state batteries with lithium metal anodes are a leading path to **>400 Wh/kg** without flammable liquid electrolytes.

Current halide electrolytes such as Li₃InCl₆ and Li₃YCl₆ achieve **1–12 mS/cm**[^6], but indium and yttrium are critical raw materials. Replacing them with Zr, Fe, Al, or Mg could cut cost by roughly an order of magnitude while preserving the moisture tolerance that sulfides lack.

The computational challenge has the same shape as the cathode problem, but the property is the Li⁺ hop barrier. Because ionic conductivity depends exponentially on the barrier — σ ∝ e^(−Eₐ/kBT) — a barrier error of a hundred meV or more changes predicted conductivity by orders of magnitude at room temperature. On our 30-path Li-ion migration panel (Round 4), the four foundation MLIPs we tested missed the published DFT-NEB barriers by 135.0–242.5 meV on average, so this is not a hypothetical concern; two of the four under-predicted most barriers and two were mixed ([the Z1 barrier panel](/articles/the-materials-we-test-against/)).

A correction for halide barriers is untested. The two halide paths in our panel were part of the Round-4 miss and the Round-5 abstention; we have no halide-specific result. Grain-boundary screening, which needs supercells of hundreds of atoms where DFT is expensive, would only become useful with potentials whose barrier errors had been measured there.

## Carbon removal: MOFs for direct air capture

Direct air capture is the only technology that can address legacy emissions regardless of source sector. The IPCC AR6 estimates cumulative carbon dioxide removal needs of **100–1,000 GtCO₂ by 2100**, with annual rates approaching **10 GtCO₂/year** by mid-century[^8]. The material bottleneck is the sorbent.

The target is a metal-organic framework (MOF) with CO₂ working capacity above **2 mmol/g at 400 ppm**, stability under **40–70% relative humidity**, and scalable synthesis cost below **$50/kg**. Amine-functionalized MOF-808 has reached **1.2 mmol/g** at 400 ppm and 50% relative humidity[^9].

The MOF design space spans trillions of structures, yet only a small fraction are experimentally synthesized. Stability is the harder problem than capacity. Water competes with CO₂ for binding sites and hydrolyzes metal-linker bonds; predicting humidity-stable frameworks requires evaluating defect formation energies at metal-linker bonds—exactly the under-coordinated environments where uMLIPs are least accurate[^10].

Metal–linker bond dissociation energies are the key determinant of hydrolytic stability, and frameworks with mixed-metal nodes create coordination environments far from anything a fast model was trained on. A useful screen would need measured errors on those bonds, and would report frameworks outside the measured domain as unsupported rather than ranked. We have not tested MOF hydrolysis.

## Industrial decarbonization: electrochemical ammonia catalysts

Ammonia synthesis via the Haber-Bosch process consumes **1–2% of global energy** and emits more than **450 MtCO₂/year**, primarily through steam methane reforming[^11]. Electrochemical synthesis at ambient conditions, powered by renewable electricity, could eliminate those emissions while enabling distributed fertilizer production.

![A modular direct-air-capture contactor standing alone on a concrete pad, its front panel cut away to reveal a pleated porous sorbent sheet — Sparse indigo airflow passes through the pleated sorbent and exits the rear plenum](images/five-materials-for-5-to-12-gtco2-year-inline-02.jpg)

Lithium-mediated electrochemical nitrogen reduction has achieved **>90% Faradaic efficiency** at ambient conditions, but energy efficiency is stuck near **28%** because lithium plating requires very negative potentials, dissipating more than 70% of input energy as heat[^12]. The U.S. Department of Energy target is **>60% energy efficiency** at current densities above **300 mA/cm²**[^13].

The challenge is N≡N triple-bond activation — dissociation energy **945 kJ/mol** — under conditions where the hydrogen evolution reaction is thermodynamically favored. DFT screening of N₂ adsorption on stepped surfaces spans a wide range of coordination environments. If fast potentials mis-estimate those binding energies, scaling relations between N₂ and NHₓ binding energies would propagate the error and could invert turnover-frequency rankings.

Our only adsorption-correction test so far (Round 4, a catalyst-adsorption panel) made errors worse for every selected Δ-correction ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)). A correction for N₂ dissociation on under-coordinated sites would need its own preregistered test.

## Solar: lead-free perovskite absorbers

Lead-based halide perovskites have climbed from ~3% efficiency in 2009 to **>26% single-junction** and ~34.6% in perovskite-silicon tandems[^14]. But lead toxicity threatens to limit terawatt-scale deployment, and the EU RoHS and REACH frameworks are progressively restricting lead.

The target is a lead-free perovskite absorber with certified power conversion efficiency above **20%** and operational stability above **25 years**. Tin perovskites are the most promising alternative, but Sn²⁺ oxidizes to Sn⁴⁺ in minutes under ambient conditions, and lead-free tin efficiencies have until recently been far below the >26% reached by lead cells[^15].

The central degradation mechanism is oxygen insertion through Sn vacancy formation, the accepted oxidation gateway[^16]. In our own measurement on lead-free halide perovskites, four uMLIPs disagreed on neutral B-site vacancy formation energies by 0.5–1.8 eV ([The Correction That Hurt](/articles/the-correction-that-hurt-and-the-theorem-that-stopped-it/)), so ranking candidates on any single raw potential is not yet meaningful there.

Metastability adds a second layer of difficulty. Many high-efficiency perovskites are kinetically trapped during solution processing; the equilibrium phase is often a non-perovskite polymorph with poor photovoltaic properties. Standard convex-hull screening discards these metastable phases, eliminating the compositions that achieve the highest efficiencies, so any screen would have to flag synthesis-dependent phases rather than rank them.

## One failure mode, five targets

The five targets span batteries, carbon removal, industrial chemicals, and solar, but they share a common structure. In every case, functional performance is determined by defect-mediated properties in multi-component spaces. In every case, the softening Deng et al. report for universal MLIPs away from equilibrium would fall on the under-coordinated configurations that govern those properties; we have not measured it on these materials. And in every case, brute-force DFT is too slow to screen the required compositional space.

![A compact ammonia reactor skid with an insulated reaction tube, heat exchanger, and one catalyst cartridge visible through a clean cutaway — The catalyst cartridge enables ammonia conversion inside the single reaction tube](images/five-materials-for-5-to-12-gtco2-year-inline-03.jpg)

## What we have tested so far

None of the five materials in this piece has been tested by us. The capability described above is a hypothesis. These are the results that bear on it:

- **Barriers.** In Round 4 (July 2026), MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV gate on 30 Li-ion migration paths (MAE 135.0–242.5 meV on completed paths). In Round 5 a direction-gated barrier correction abstained for all four models, so none was applied. See [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the Z1 barrier panel](/articles/the-materials-we-test-against/).
- **Adsorption.** Every selected Δ-correction made catalyst-adsorption holdout error worse ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).
- **Surfaces of fcc metals.** For nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models). Used as an energy-only correction beside CHGNet, it improved one facet on two metals ([the fcc error field](/articles/a-smooth-environment-resolved-error-field/)).
- **Lean checks** cover the arithmetic and stated inequalities behind published numbers; they do not check the physics, the reference data or the pipeline.

If you synthesize or characterize any of these five classes and want to test whether fast models can be trusted on them, we would like to hear from you; our record and methods are open.

## Where this is aimed

Predictions are necessary but not sufficient. The path from a better-understood model to a made material runs through groups that synthesize, characterize and scale candidates. We do not have partners in any of these five areas. We would like to work with labs and companies that do this work and want an independent, preregistered measurement of how far the models they use can be trusted on their systems.

The climate-scale figures in the literature cited here (IEA, IPCC) describe the size of the problems. They are not outcomes we have measured or enabled.

## Footnotes

[^1]: International Energy Agency, *Batteries and Secure Energy Transitions*, IEA, 2024.

[^2]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025). https://doi.org/10.1038/s41524-024-01500-6

[^3]: Argonne National Laboratory, "Cobalt-Free and Manganese-Rich Batteries Offer Improved Energy at a Lower Cost," U.S. Department of Energy / EaCAM consortium, January 2026; J. Chen *et al.*, "Defining Electrode-Level Metrics for Enabling Earth-Abundant Cathodes," *J. Electrochem. Soc.* (2026).

[^4]: E. Hu *et al.*, "Evolution of redox couples in Li- and Mn-rich cathode materials and mitigation of voltage fade by reducing oxygen release," *Nature Energy* **3**, 690–698 (2018); J.-J. Marie *et al.*, "Trapped O₂ and the origin of voltage fade in layered Li-rich cathodes," *Nature Materials* **23**, 310–317 (2024). https://doi.org/10.1038/s41560-018-0207-z; https://doi.org/10.1038/s41563-024-01833-z

[^5]: International Energy Agency, *The Role of Critical Minerals in Clean Energy Transitions*, IEA, 2022.

[^6]: X. Li *et al.*, "Water-mediated synthesis of a superionic halide solid electrolyte," *Angewandte Chemie International Edition* **58**, 16427–16432 (2019); "Halide-Based Solid Electrolytes for Advanced All-Solid-State Batteries: Design, Interfaces, and Electrochemical Performance," *Nano-Micro Letters* **18**, 225 (2026).


[^8]: IPCC, *Climate Change 2022: Mitigation of Climate Change*, Working Group III Contribution to AR6, Cambridge University Press, 2022.

[^9]: X. Chen *et al.*, "Computational Screening of Amino-Functionalized Molecules for Direct Air Capture of CO₂," *J. Phys. Chem. A* (2026); P. Chen *et al.*, functionalized MOF-808 DAC study cited therein (1.2 mmol/g at 400 ppm, 50% RH).

[^10]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025).

[^11]: Royal Society, *Ammonia: Zero-Carbon Fertiliser, Fuel and Energy Store*, policy briefing, 2020; International Energy Agency, *Ammonia Technology Roadmap*, IEA, 2021.

[^12]: W. Chang *et al.*, "Lithium-mediated nitrogen reduction to ammonia via the solvation-enabled N₂ activation," *Nature Catalysis* **7**, 342–352 (2024); X. Cai *et al.*, "Lithium-mediated electrochemical nitrogen reduction: mechanistic insights to enhance performance," *iScience* **24**, 103105 (2021).

[^13]: ARPA-E REFUEL program, "Renewable Energy to Fuels Through Utilization of Energy-Dense Liquids," U.S. Department of Energy, program targets: >60% energy efficiency, >300 mA/cm², >90% Faradaic efficiency.

[^14]: NREL, "Best Research-Cell Efficiency Chart," National Renewable Energy Laboratory, updated 2025; LONGi 34.85% perovskite-silicon tandem record, NREL-certified, April 2025.

[^15]: P. Chen *et al.*, "2D/3D tin-halide perovskite solar cell with certified 16.65% efficiency," *Nature Nanotechnology* **20**, 742–749 (2025).

[^16]: T. Leijtens *et al.*, "Mechanism of tin oxidation and stabilization by lead substitution in tin halide perovskites," *ACS Energy Letters* **2**, 2159–2165 (2017).

