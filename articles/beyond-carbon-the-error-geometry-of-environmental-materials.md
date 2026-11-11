> **Date:** 2026-07-16
> **Deck:** Why water, air, methane, refrigerant, mineral, PFAS and cement materials may share the failure mode that makes machine-learned potentials unreliable, and what we would need to test.
> **Summary:** The opening piece of a July 2026 series on environmental materials. It argues that their useful chemistry happens in under-coordinated environments, where machine-learned potentials are least reliable, and sets out what we would need to test. A direction, not a result.
> **Updated:** 2026-11-11
> **Status:** Direction
> **Evidence Status:** Direction, not a result. Capability statements below are hypotheses we have not tested on these materials. What we have tested: in Round 4 (July 2026) our barrier, adsorption and lattice/elastic correction tests failed and the magnetism test abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models). Literature figures are attributed to their sources.

# Beyond Carbon: The Error Geometry of Environmental Materials

The climate series made a case about predicted materials that do not become made materials. The hypothesis this series starts from is that the bottleneck is not climate-specific but coordination-specific. Water desalination membranes, methane-to-methanol catalysts, low-GWP refrigerants, PFAS sorbents, low-CO₂ cements, lithium-recovery frameworks and low-temperature exhaust catalysts all do their useful work in under-coordinated, non-equilibrium atomic environments, and those are where universal machine-learning interatomic potentials (uMLIPs) are least reliable. We have measured that pattern on fcc metals; whether it holds for these materials is untested.

![One Geometry, Seven Planetary Boundaries](images/beyond-carbon-the-error-geometry-of-environmental-materials-01-seven-domains-one-error.jpg)
*Seven application areas whose useful chemistry happens in under-coordinated environments.*

The environmental-expansion series opens by mapping that hypothesis onto seven target areas outside direct CO₂ abatement. The goal is not to claim that computational discovery will solve water scarcity or eliminate forever chemicals on its own. It is to ask whether each target is (a) materials-limited, (b) exposed to the same structural failure modes, and (c) a place where the same kind of measurement could be tested.

![From Predicted Structure to Buried Breakthrough](images/beyond-carbon-the-error-geometry-of-environmental-materials-03-four-filters.jpg)
*Defect/bulk asymmetry, the combinatorial wall, metastability, and ranking inversion turn a small systematic error into wrong experimental priorities.*

## The same four filters, new planetary boundaries

The climate series identified four filters between a predicted structure and a working material: defect/bulk asymmetry, the combinatorial wall, metastability, and ranking inversion[^1]. Each filter is present in environmental materials, often more severely than in batteries or solar absorbers because the composition spaces are broader and the functional environments are further from bulk equilibrium.

**Defect/bulk asymmetry** is the first filter. uMLIPs are trained mostly on near-equilibrium bulk configurations where every atom has a high, regular coordination number. Functional materials, by contrast, do their work at surfaces, vacancies, pore windows and transition states where coordination is low. Deng et al. document a systematic softening of the potential energy surface in universal MLIPs trained on MPtrj, with energies and forces under-predicted away from equilibrium[^2]. In our own benchmark of four uMLIPs on 21 mostly metallic materials, defect-family observables (surfaces, vacancies, stacking faults) erred 15–60 times more than bulk observables; whether the same holds at the pores, active sites and hydrate surfaces discussed here is untested. If it does, the error would change the binding free energy of Na⁺ and Cl⁻ in a membrane pore, the C–H activation barrier of a methane-oxidation catalyst, and the dissolution energy of an under-coordinated silicate chain in a cement hydrate.

**The combinatorial wall** follows immediately. A low-GWP refrigerant search must screen millions of candidate molecules against vapor pressure, flammability, toxicity, and compatibility constraints. A low-CO₂ cement search must explore multi-component oxide spaces that include CaO–SiO₂–Al₂O₃–Fe₂O₃–MgO–SO₃ and their amorphous hydrates. A selective sorbent for direct lithium extraction must rank thousands of MOF linkers and window geometries. DFT is accurate enough for any one candidate but economically impossible across the whole space. Raw uMLIPs are fast enough but carry the defect/bulk error into the ranking.

**Metastability** is the third filter. The best-performing materials are often kinetically trapped. Hydrated cement phases, amorphous sorbents, carbonated silicates, and certain caloric alloys are not on the convex hull of equilibrium stability. Standard screens discard them because stability-only ranking cannot distinguish a useful metastable phase from an unmakeable one.

**Ranking inversion** would be the result. Systematic errors can do more than add noise: they can reorder candidates. A membrane with the correct selectivity could drop below a softer, less selective pore; a methane-oxidation catalyst with the right barrier could be passed over for one whose barrier only looks low because the potential surface is softened. Experiments would then be sent to the wrong priorities.

## Water, air, and the molecules of the ambient environment

Water scarcity affects roughly two billion people, and the UN projects a 40% global freshwater deficit by 2030 under business-as-usual[^3]. Seawater desalination already produces around 97 million cubic metres per day, but reverse-osmosis membranes consume 3–4 kWh m⁻³ and are limited by the selectivity–permeability trade-off[^4]. The active layer of a polyamide membrane is a nanoporous network whose pores are lined with under-coordinated functional groups. We expect uMLIPs trained on bulk configurations to be unreliable for the binding free energy of ions and water in those pores; that is untested.

![A recirculating corrosion-test loop with four metal coupons mounted along one pipe and a single scanning probe moving across their exposed surfaces — The scanning probe measures local surface error against the same flowing environment](images/beyond-carbon-the-error-geometry-of-environmental-materials-inline-02.jpg)

Atmospheric water harvesting sorbents face a different version of the same question. Metal–organic frameworks such as MOF-808 with LiCl reach useful capacities at low relative humidity, but cycle life is limited by hydrolysis of metal–linker bonds at under-coordinated metal centres[^5]. If barrier errors there could be measured and corrected, cycle life could be screened before synthesis; our only barrier-correction tests so far, on Li-ion migration, failed or abstained.

Air quality is similarly bound by under-coordinated active sites. Outdoor air pollution causes an estimated 4–7 million premature deaths annually, with NOx, PM₂.₅, and volatile organic compounds as the leading contributors[^6]. Low-temperature NH₃-SCR catalysts for diesel and gasoline exhaust need high NOx conversion below 150 °C because cold-start emissions, before the catalyst reaches light-off, can account for 50–80% of trip emissions[^7]. Those conversions depend on activation barriers for N–O bond cleavage and C–H activation at exchanged cations and single-atom sites, where we expect raw uMLIPs to be least reliable.

![Four environmental boundary stations — water membrane, air catalyst, refrigerant heat exchanger, and remediation sorbent — as physical devices under a shared measurement geometry](images/beyond-carbon-the-error-geometry-of-environmental-materials-inline-01--retry-1.jpg)

## Methane and refrigerants: the non-CO₂ climate forcers

Methane is responsible for roughly 30% of current global warming. Over a twenty-year horizon its global warming potential is 80–85× that of CO₂[^8]. Cutting anthropogenic methane emissions 30% by 2030 — the Global Methane Pledge target — could avoid approximately 0.3 °C of warming by 2040[^9]. Yet low-temperature methane-to-methanol catalysts remain below commercial selectivity, and methane pyrolysis for turquoise hydrogen still requires temperatures well above 800 °C. Both routes are limited by C–H activation and carbon diffusion at under-coordinated metal sites.

The scaling-relation problem is familiar from ammonia catalysis. Sites that bind CHₓ intermediates strongly enough to activate methane also bind oxygenates too strongly, leading to over-oxidation. Accurate barriers would help filter out false-positive low-temperature catalysts; our only adsorption-correction test so far (Round 4) made errors worse.

Hydrofluorocarbon refrigerants add a second non-CO₂ lever. The Kigali Amendment to the Montreal Protocol aims to reduce HFC consumption 80% by 2047, avoiding up to 0.5 °C of warming by 2100[^10]. Fluorine-free replacements must match thermophysical properties and safety constraints across millions of candidate molecules, including radical transition states where C–H and C–F bond dissociation controls flammability and atmospheric lifetime. Solid-state refrigerants based on caloric effects eliminate fluids entirely but require low-hysteresis first-order phase transitions whose twin-boundary and transition-state energies are hard for fast potentials to get right.

## Critical minerals, PFAS, and the remediation imperative

The energy transition is mineral-intensive. The IEA projects that clean-energy technologies will drive a four- to six-fold increase in mineral demand by 2040, with cobalt, nickel, and lithium supply-constrained and geographically concentrated[^11]. Recycling, direct lithium extraction, and urban mining are therefore not optional. They are also materials-limited: selective sorbents, extractants, and direct-recycling reconstruction conditions are discovered largely by trial and error.

The ion-selectivity problem is the same binding-energy problem that appears in membranes and catalysts. Li⁺, Na⁺, K⁺, Mg²⁺, Co²⁺/³⁺, Ni²⁺, and Fe³⁺ must be separated in complex mixed streams. Guest–host binding energies in flexible, under-coordinated sorbent pores and organic extractant pockets fall outside the bulk training distribution of uMLIPs, so we would expect raw rankings there to be unreliable. Measuring how unreliable is the first step; we have not done it.

PFAS remediation adds the strongest bond in organic chemistry. The C–F bond dissociation energy is approximately 485 kJ mol⁻¹[^12]. Catalytic defluorination at low temperature requires highly active metal sites that also resist conversion to stable metal fluorides. Predicting C–F activation barriers and metal-fluoride thermodynamics at under-coordinated sites is the kind of problem where model error would need to be measured first. A sorbent that removes PFOA and PFOS at nanogram-per-litre levels, meanwhile, needs fluorophilic pockets of precise size, so its host–guest binding energies would need the same scrutiny.

## Cement: the weight of the built world

Cement production is responsible for roughly 8% of global CO₂ emissions, about 2.8 GtCO₂ yr⁻¹, and approximately 60% of those emissions are process emissions from calcining limestone that cannot be eliminated by renewable electricity alone[^13]. Alternative binders, alternative clinkers, and CO₂-cured concrete are promising, but many of the best performers are amorphous or metastable. Blast-furnace slag, fly ash, calcined clay, and geopolymers form disordered hydrated networks; standard DFT struggles with disorder, and we have not measured how uMLIPs handle the under-coordinated Si–O and Al–O bonds in them.

![A central instrument bench with one calibrated sample holder connected by a restrained indigo line to a compact water-filtration pilot skid across the room — The calibrated holder transfers a measured material result into one filtration pilot decision](images/beyond-carbon-the-error-geometry-of-environmental-materials-inline-03.jpg)

CO₂-cured concrete depends on rapid carbonation of calcium silicates. The reaction fronts involve carbonate formation at under-coordinated surface sites and CO₂ diffusion through increasingly dense product layers. Reliable carbonate formation and diffusion barriers would help rank candidate calcium-silicate compositions for uptake and strength gain, and metastable phases would need to be flagged as synthesis-dependent rather than judged by equilibrium stability alone.

## What we have tested so far

None of the materials in this series has been tested by us. The capability described above is a hypothesis. These are the results that bear on it:

- **Barriers.** In Round 4 (July 2026), MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV gate on 30 Li-ion migration paths (MAE 135.0–242.5 meV on completed paths). In Round 5 a direction-gated barrier correction abstained for all four models, so none was applied. See [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the Z1 barrier panel](/articles/the-materials-we-test-against/).
- **Adsorption.** Every selected Δ-correction made catalyst-adsorption holdout error worse ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).
- **Surfaces of fcc metals.** For nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models). Used as an energy-only correction beside CHGNet, it improved one facet on two metals ([the fcc error field](/articles/a-smooth-environment-resolved-error-field/)).
- **Lean checks** cover the arithmetic and stated inequalities behind published numbers; they do not check the physics, the reference data or the pipeline.

If you measure membranes, sorbents, catalysts, refrigerants or binders and want to test whether these models can be trusted on your systems, we would like to hear from you; our record and methods are open.

## Where this is aimed

If the coordination hypothesis holds, the seven target areas share one computational weakness, and one way of measuring it could be tested across all of them: membranes and sorbents through binding energies, catalysts through activation barriers, refrigerants through bond-dissociation energies, mineral recovery through insertion and site-selectivity energies, cement through amorphous-network and carbonation energetics. That is the direction. The evidence so far is much narrower, and in two of the three areas we have tested, corrections failed.

The stakes are large and are set by the sources cited above, not by us: the UN on water, the WHO on air quality, the IPCC and UNEP on methane, Velders et al. on HFCs, the IEA on minerals and cement.

Subsequent installments examine the targets in detail. Each is marked Direction and says what has been tested.

![A calm regional landscape of treatment plants and clean infrastructure, with the material interventions visible but secondary](images/beyond-carbon-the-error-geometry-of-environmental-materials-spread--retry-1.jpg)

## Footnotes

[^1]: Lupine Science, [Round 4 results](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the fcc error-field results note](/articles/a-smooth-environment-resolved-error-field/). Lean source in the [open repository](https://github.com/alexwelcing/lupine-rhizo).

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
