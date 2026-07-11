> **Type:** article
> **Date:** 2026-07-16
> **Scope:** Why the same under-coordination error that corrupts climate-materials predictions also corrupts water, air, methane, refrigerant, mineral, PFAS, and cement discovery.
> **Description:** The first article in the environmental-expansion series shows that the Lupine correction-and-verification layer is a platform for any material whose function is controlled by under-coordinated environments.
> **Audience:** sophisticated materials, mechanical, and chemical engineers; climate-tech investors
> **Status:** Draft



# Beyond Carbon: The Error Geometry of Environmental Materials

The climate series made a case about predicted materials that do not become made materials. The deeper argument, and the one this series starts from, is that the bottleneck is not climate-specific. It is coordination-specific. Water desalination membranes, methane-to-methanol catalysts, low-GWP refrigerants, PFAS sorbents, low-CO₂ cements, lithium-recovery frameworks, and low-temperature exhaust catalysts all fail for the same reason: their useful behavior is set in under-coordinated, non-equilibrium atomic environments that universal machine-learning interatomic potentials (uMLIPs) systematically misrepresent. The climate problem was one instance of a geometry of wrongness that extends across the periodic table.


![One Geometry, Seven Planetary Boundaries](images/beyond-carbon-the-error-geometry-of-environmental-materials-01-seven-domains-one-error.jpg)
*The same coordination error radiates from bulk equilibrium into the under-coordinated environments that control water, air, methane, refrigerants, minerals, PFAS, and cement.*

This article introduces the environmental-expansion series by mapping that geometry onto seven target areas outside direct CO₂ abatement. The goal is not to claim that computational discovery will solve water scarcity or eliminate forever chemicals on its own. It is to show that each target is (a) materials-limited, (b) corrupted by the same structural failure modes, and (c) addressable by the same correction-and-verification layer that Lupine has built for climate-critical materials.

![From Predicted Structure to Buried Breakthrough](images/beyond-carbon-the-error-geometry-of-environmental-materials-03-four-filters.jpg)
*Defect/bulk asymmetry, the combinatorial wall, metastability, and ranking inversion turn a small systematic error into wrong experimental priorities.*


## The same four filters, new planetary boundaries

The climate series identified four filters between a predicted structure and a working material: defect/bulk asymmetry, the combinatorial wall, metastability, and ranking inversion[^1]. Each filter is present in environmental materials, often more severely than in batteries or solar absorbers because the composition spaces are broader and the functional environments are further from bulk equilibrium.

**Defect/bulk asymmetry** is the dominant error. uMLIPs are trained on near-equilibrium bulk configurations where every atom has a high, regular coordination number. Functional materials, by contrast, do their work at surfaces, vacancies, pore windows, and transition states where coordination is low. A recent systematic survey found that uMLIPs soften the potential energy surface by 15–60% in these under-coordinated regions, with the largest errors at coordination numbers of four to eight[^2]. For a water-membrane pore, that error changes the binding free energy of Na⁺ and Cl⁻; for a methane-oxidation catalyst, it changes the C–H activation barrier; for a cement hydrate, it changes the dissolution energy of an under-coordinated silicate chain. The error is not random. It has a shape: it grows as coordination drops and as local chemistry deviates from the training distribution.

![Error Grows as Coordination Drops](images/beyond-carbon-the-error-geometry-of-environmental-materials-02-coordination-error-curve.jpg)
*A systematic survey shows uMLIPs soften the potential energy surface by 15–60% in under-coordinated regions, precisely the coordination range of pores, surfaces, and transition states.*


**The combinatorial wall** follows immediately. A low-GWP refrigerant search must screen millions of candidate molecules against vapor pressure, flammability, toxicity, and compatibility constraints. A low-CO₂ cement search must explore multi-component oxide spaces that include CaO–SiO₂–Al₂O₃–Fe₂O₃–MgO–SO₃ and their amorphous hydrates. A selective sorbent for direct lithium extraction must rank thousands of MOF linkers and window geometries. DFT is accurate enough for any one candidate but economically impossible across the whole space. Raw uMLIPs are fast enough but carry the defect/bulk error into the ranking.

**Metastability** is the third filter. The best-performing materials are often kinetically trapped. Hydrated cement phases, amorphous sorbents, carbonated silicates, and certain caloric alloys are not on the convex hull of equilibrium stability. Standard screens discard them because stability-only ranking cannot distinguish a useful metastable phase from an unmakeable one.

![Raw Rankings Hide True Breakthroughs](images/beyond-carbon-the-error-geometry-of-environmental-materials-07-ranking-inversion.jpg)
*A soft potential surface can promote the wrong membrane pore or catalyst site; corrected barriers restore the ranking that experiments should follow.*


**Ranking inversion** is the result. Systematic errors do not merely add noise; they reorder candidates. A membrane with the correct selectivity drops below a softer, less selective pore. A methane-oxidation catalyst with the right barrier is passed over for one whose barrier only looks low because the potential surface is softened. Experiments are sent to false priorities and true breakthroughs are buried[^1].

## Water, air, and the molecules we live next to

Water scarcity affects roughly two billion people, and the UN projects a 40% global freshwater deficit by 2030 under business-as-usual[^3]. Seawater desalination already produces around 97 million cubic metres per day, but reverse-osmosis membranes consume 3–4 kWh m⁻³ and are limited by the selectivity–permeability trade-off[^4]. The active layer of a polyamide membrane is a nanoporous network whose pores are lined with under-coordinated functional groups. uMLIPs trained on bulk polymers cannot accurately predict the binding free energy of ions and water in those pores, so screens misrank pore size and charge density.

![Runtime Correction with Proof Boundaries](images/beyond-carbon-the-error-geometry-of-environmental-materials-05-correction-verification-layer.jpg)
*A coordination-based error field, three anchor observables, and analytic force corrections let molecular dynamics follow the corrected surface, while proof boundaries stop unsupported claims.*


Atmospheric water harvesting sorbents face a different manifestation of the same error. Metal–organic frameworks such as MOF-808 with LiCl reach useful capacities at low relative humidity, but cycle life is limited by hydrolysis of metal–linker bonds at under-coordinated metal centres[^5]. The transition states have coordination numbers of four to seven, precisely the region where uMLIPs underestimate barrier heights. Corrected barriers predict cycle life before synthesis.

Air quality is similarly bound by under-coordinated active sites. Outdoor air pollution causes an estimated 4–7 million premature deaths annually, with NOx, PM₂.₅, and volatile organic compounds as the leading contributors[^6]. Low-temperature NH₃-SCR catalysts for diesel and gasoline exhaust need high NOx conversion below 150 °C because cold-start emissions, before the catalyst reaches light-off, can account for 50–80% of trip emissions[^7]. Those conversions depend on activation barriers for N–O bond cleavage and C–H activation at exchanged cations and single-atom sites that raw uMLIPs misrank.

## Methane and refrigerants: the non-CO₂ climate forcers

Methane is responsible for roughly 30% of current global warming. Over a twenty-year horizon its global warming potential is 80–85× that of CO₂[^8]. Cutting anthropogenic methane emissions 30% by 2030 — the Global Methane Pledge target — could avoid approximately 0.3 °C of warming by 2040[^9]. Yet low-temperature methane-to-methanol catalysts remain below commercial selectivity, and methane pyrolysis for turquoise hydrogen still requires temperatures well above 800 °C. Both routes are limited by C–H activation and carbon diffusion at under-coordinated metal sites.

![The Combined Addressable Impact](images/beyond-carbon-the-error-geometry-of-environmental-materials-06-addressable-impact-sankey.jpg)
*The seven application areas together span billions of people, gigatonnes of CO₂, and trillion-dollar supply chains.*


The scaling-relation problem is familiar from ammonia catalysis. Sites that bind CHₓ intermediates strongly enough to activate methane also bind oxygenates too strongly, leading to over-oxidation. Corrected barriers prevent false-positive low-temperature catalysts, while selective field failure — the cases where the measured error field itself departs from its smooth trend — flags unusual electronic structures that may break the scaling relation[^1].

Hydrofluorocarbon refrigerants add a second non-CO₂ lever. The Kigali Amendment to the Montreal Protocol aims to reduce HFC consumption 80% by 2047, avoiding up to 0.5 °C of warming by 2100[^10]. Fluorine-free replacements must match thermophysical properties and safety constraints across millions of candidate molecules, including radical transition states where C–H and C–F bond dissociation controls flammability and atmospheric lifetime. Solid-state refrigerants based on caloric effects eliminate fluids entirely but require low-hysteresis first-order phase transitions whose twin-boundary and transition-state energies uMLIPs misrank.

![One Layer, Many Industrial Workflows](images/beyond-carbon-the-error-geometry-of-environmental-materials-08-platform-ecosystem.jpg)
*Corrected energies for binding, barriers, insertion, migration, and site selectivity feed a single platform that serves seven distinct industrial stacks.*


## Critical minerals, PFAS, and the remediation imperative

The energy transition is mineral-intensive. The IEA projects that clean-energy technologies will drive a four- to six-fold increase in mineral demand by 2040, with cobalt, nickel, and lithium supply-constrained and geographically concentrated[^11]. Recycling, direct lithium extraction, and urban mining are therefore not optional. They are also materials-limited: selective sorbents, extractants, and direct-recycling reconstruction conditions are discovered largely by trial and error.

The ion-selectivity problem is the same binding-energy problem that appears in membranes and catalysts. Li⁺, Na⁺, K⁺, Mg²⁺, Co²⁺/³⁺, Ni²⁺, and Fe³⁺ must be separated in complex mixed streams. Guest-host binding energies in flexible, under-coordinated sorbent pores and organic extractant pockets fall outside the bulk training distribution of uMLIPs, so raw models misrank candidates by 15–60%[^2]. Corrected insertion and site-selectivity energies identify high-selectivity frameworks.

![Measured Correction, Machine-Checked Proof](images/beyond-carbon-the-error-geometry-of-environmental-materials-04-blind-prediction-panel.jpg)
*Across 36 blind model–material pairs the error field predicts corrections with r = 0.906, while a build-locked library of 190 Lean 4 theorems bounds what can be believed.*


PFAS remediation adds the strongest bond in organic chemistry. The C–F bond dissociation energy is approximately 485 kJ mol⁻¹[^12]. Catalytic defluorination at low temperature requires highly active metal sites that also resist conversion to stable metal fluorides. Predicting C–F activation barriers and metal-fluoride thermodynamics at under-coordinated sites is exactly the correction task. A sorbent that removes PFOA and PFOS at nanogram-per-litre levels, meanwhile, needs fluorophilic pockets of precise size; corrected host-guest binding energies rank MOFs and porous polymers for selectivity over competing ions and natural organic matter.

## Cement: the weight of the built world

Cement production is responsible for roughly 8% of global CO₂ emissions, about 2.8 GtCO₂ yr⁻¹, and approximately 60% of those emissions are process emissions from calcining limestone that cannot be eliminated by renewable electricity alone[^13]. Alternative binders, alternative clinkers, and CO₂-cured concrete are promising, but many of the best performers are amorphous or metastable. Blast-furnace slag, fly ash, calcined clay, and geopolymers form disordered hydrated networks; standard DFT struggles with disorder, and raw uMLIPs mispredict the energetics of under-coordinated Si–O and Al–O bonds.

![Speed That Scales Where DFT Cannot](images/beyond-carbon-the-error-geometry-of-environmental-materials-09-economics-moat.jpg)
*At roughly 10⁵× the speed of DFT and only modest runtime overhead, corrected potentials can search spaces that brute-force quantum chemistry cannot afford.*


CO₂-cured concrete depends on rapid carbonation of calcium silicates. The reaction fronts involve carbonate formation at under-coordinated surface sites and CO₂ diffusion through increasingly dense product layers. Corrected carbonate formation and diffusion barriers rank candidate calcium-silicate compositions for uptake and strength gain. Here the verification layer matters as much as the correction: provable boundaries separate supported predictions from synthesis-dependent metastable phases, so experiments are not launched on the basis of an equilibrium stability that the material will never reach[^1].

## The Lupine response: a measured field and machine-checked proof

The common thread across all seven areas is that the error is not a model failure to be fixed by more training data. It is a geometrically regular departure that can be measured, parameterized, and corrected at runtime. Lupine's environment error field is defined over local atomic coordination; for a reference bulk environment, such as fcc atoms with coordination number twelve, the error is defined as zero. Three anchor observables fix the field, and a cubic spline with the bulk constraint predicts the error at environments the field was never directly fitted to[^1].

Blind prediction across 36 (model, material) combinations achieves Pearson r = 0.906 (p = 10⁻⁴, 95% CI [0.82, 0.96]) with zero adjustable parameters[^1]. Runtime correction adds analytic forces to the uMLIP gradients, so molecular dynamics and relaxations follow the corrected potential energy surface. The overhead is currently 15.6% in Python and is expected to drop below 1% in a compiled LAMMPS overlay, while corrected uMLIPs remain roughly 10⁵× faster than DFT[^1].

![The Path From Measured Error to Trust](images/beyond-carbon-the-error-geometry-of-environmental-materials-10-platform-roadmap.jpg)
*Every article in the series will follow the same arc: measure the shape of the error, correct it with analytic forces, and prove which predictions can be believed.*


Formal verification is what prevents corrected predictions from becoming a new kind of false confidence. Lupine's claims are accompanied by build-locked Lean 4 theorems; the current library contains 190 build-locked theorems with zero sorry proofs[^1]. Where the correction cannot be applied — for example, where the local environment falls outside the measured domain, or where a phase is genuinely synthesis-dependent — the system proves impossibility or bounded uncertainty rather than reporting a p-value. That discipline transfers directly to environmental targets: a cement hydrate phase whose stability cannot be separated from curing conditions is flagged as unsupported, not sold as predicted.

## A platform thesis

The seven areas in this document share the same computational pathology and the same response. Corrected binding energies rank desalination membranes, atmospheric-water sorbents, and ion-selective frameworks. Corrected activation barriers filter low-temperature catalysts for NOx, VOCs, methane, and PFAS. Corrected intermolecular potentials and bond-dissociation energies screen refrigerants. Corrected insertion, migration, and site-selectivity energies enable critical-mineral recovery. Corrected amorphous-network and carbonation energetics guide cement decarbonization. In every case the correction is anchored to measured error, and in every case the verification layer distinguishes what is supported from what is not.

The combined addressable impact is comparable to the climate series. Water and air quality affect billions of people. Methane and refrigerants together could avoid 0.5–1 °C of warming. Critical-mineral recycling and PFAS remediation address trillion-dollar supply-chain and public-health risks. Cement decarbonization is a 2.8 GtCO₂ yr⁻¹ problem. A single correction layer that improves discovery reliability across all of them is the platform thesis.

The next articles in this series walk through the targets in detail. They share one premise: the materials bottleneck is, at its root, a prediction-trust bottleneck. Trust comes from measuring the shape of the error, correcting it with analytic forces, and proving which predictions can be believed.

## Footnotes

[^1]: Lupine Science, *Strategic Discovery Plan*, Sections 2–3. The plan documents the 0.2% synthesis problem, the environment error field, the r = 0.906 blind-prediction result, the 15.6% runtime overhead, the 190 build-locked Lean 4 theorems, and the boundary conditions for impossibility proofs.

[^2]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025). https://doi.org/10.1038/s41524-024-01500-6

[^3]: UN Water, *United Nations World Water Development Report 2024: Water for Prosperity and Peace*, UNESCO, 2024.

[^4]: International Desalination Association, *IDA Global Desalination Inventory* (2023); G. Micale, L. Rizzuti, and A. Cipollina, *Seawater Desalination: Conventional and Renewable Energy Processes*, Springer, 2009.

[^5]: N. Hanikel *et al.*, "Evolution of water-harvesting systems in metal-organic frameworks," in *ACS Central Science* review literature on MOF hydrolysis and cycling stability (2019–2024).

[^6]: World Health Organization, *Ambient Air Quality and Health* fact sheet (2024); Health Effects Institute, *State of Global Air 2024*.

[^7]: U.S. Environmental Protection Agency and European Environment Agency NOx inventories; automotive emissions literature on cold-start contribution to trip emissions.

[^8]: IPCC, *Climate Change 2021: The Physical Science Basis*, Contribution of Working Group I to the Sixth Assessment Report, Cambridge University Press, 2021.

[^9]: UNEP, *Global Methane Assessment: Benefits and Costs of Mitigating Methane Emissions*, 2021.

[^10]: G. J. M. Velders *et al.*, "Projections of hydrofluorocarbon (HFC) emissions and the resulting global warming based on recent trends in observed abundances and current policies," *Climatic Change* **169**, 35 (2021); UNEP / US EPA Kigali Amendment impact estimates.

[^11]: International Energy Agency, *The Role of Critical Minerals in Clean Energy Transitions*, IEA, 2022.

[^12]: B. E. Smart, "Organofluorine Chemistry," in *Kirk-Othmer Encyclopedia of Chemical Technology*, 4th ed., Wiley, 1994; C–F bond dissociation energy reference data.

[^13]: International Energy Agency, *Cement Technology Roadmap 2024 — Routes to Net Zero*, IEA and Global Cement and Concrete Association, 2024.
