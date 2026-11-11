> **Date:** 2026-07-16
> **Deck:** Why the membranes, sorbents and catalysts behind clean water and air are a hard case for machine-learned potentials, and what we would need to test before trusting a screen of them.
> **Summary:** Water and air quality depend on materials that separate and transform molecules in under-coordinated environments, where machine-learned potentials are least reliable. This July 2026 piece sets out where a measured correction might help and what would have to be tested first. A direction, not a result.
> **Updated:** 2026-11-11
> **Status:** Direction
> **Evidence Status:** Direction, not a result. Capability statements below are hypotheses we have not tested on these materials. What we have tested: in Round 4 (July 2026) the raw models missed our barrier gate, our adsorption and lattice/elastic correction tests failed, and the magnetism test abstained; in Round 5 our barrier correction abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models). Literature figures are attributed to their sources.

# Water and Air: The Materials Behind What We Drink and Breathe

Water and air are the two environmental systems that touch every human life. Humans drink water, breathe air, and depend on engineered materials to keep both clean enough to sustain cities, agriculture, and industry. The global reverse-osmosis fleet already produces roughly 97 million cubic metres of desalinated water per day[^1], yet water scarcity still affects about two billion people and the UN projects a 40% global freshwater deficit by 2030 under business-as-usual[^2]. Outdoor air pollution, meanwhile, is linked to an estimated 4–7 million premature deaths each year, with NOx, fine particulates, and volatile organic compounds as the dominant contributors[^3].

![The Human Scale of Water and Air Failure](images/water-and-air-correcting-the-molecules-we-drink-and-breathe-01-global-stakes.jpg)
*Water scarcity already touches about two billion people and air pollution is linked to millions of premature deaths each year, according to the sources cited below.*

Both problems are materials-limited. The membranes, sorbents, ion-selective frameworks and catalysts that would help all function in under-coordinated, non-equilibrium atomic environments — pore windows, metal–linker interfaces, exchanged cations, single-atom sites — where universal machine-learning interatomic potentials (uMLIPs) are least reliable. This piece maps the water and air targets onto that weakness and says what would need to be measured before a fast screen of them could be trusted.

## The error is coordination, not chemistry

The starting point is simple. uMLIPs are trained mostly on bulk, near-equilibrium configurations where every atom has a high, regular coordination number, then asked to predict behaviour at surfaces, vacancies and transition states where coordination is low. Deng et al. document a systematic softening of the potential energy surface in universal MLIPs trained on MPtrj, with energies and forces under-predicted away from equilibrium[^4]. In our own benchmark of four uMLIPs on 21 mostly metallic materials, defect-family observables (surfaces, vacancies, stacking faults) erred 15–60 times more than bulk observables; whether the same holds at the membrane pore linings, MOF metal centres, zeolite exchanged cations and single-atom sites discussed here is untested.

If the error has a shape here too, binding energies, diffusion barriers, hydrolysis rates and activation barriers would all be shifted in a regular way that ordinary screens do not correct. The result would be ranking inversion: candidates that look best in a raw screen would not be the candidates that perform best, and experiments would be sent to the wrong priorities.

Our hypothesis is that such errors can be measured on anchor observables and, in some cases, corrected. On fcc metals that has held in a narrow case; on Li-ion migration barriers the raw models missed our gate and our barrier correction abstained, and on catalyst adsorption our correction tests failed (see "What we have tested so far" below)[^5]. Whether anything transfers to the water and air targets here is untested.

## Water: separation without energy destruction

### Reverse-osmosis membranes

![A reverse-osmosis pressure vessel shown in long cutaway, with a spiral membrane element separating an inlet channel from a clean-water collection tube — Pressure drives water through the membrane into the central collection tube](images/water-and-air-correcting-the-molecules-we-drink-and-breathe-inline-01.jpg)

Reverse osmosis is the workhorse of seawater desalination, but it is still energetically expensive and chemically fragile. A modern polyamide thin-film composite membrane reaches roughly 99.5% NaCl rejection at a permeability of about 10 L m⁻² h⁻¹ bar⁻¹, with total energy consumption of 3–4 kWh m⁻³[^1]. The next generation of membranes needs higher permeability without sacrificing rejection, and it needs chlorine tolerance so that biofouling can be controlled without damaging the active layer.

The active layer is a nanoporous polymer network. Its function is controlled by the size, charge, and chemical texture of pores that are only a few nanometres across. Ions and water molecules in those pores are surrounded by under-coordinated functional groups — carbonyls, amines, carboxylates — whose binding energies fall outside the bulk-polymer distribution on which uMLIPs are trained. We would therefore expect raw rankings of pore size and charge density to be unreliable, and a screen for the selectivity–permeability trade-off to need its errors measured first.

### Atmospheric water harvesting

Atmospheric water harvesting (AWH) offers a distributed alternative to centralised desalination for off-grid and drought-resilient supply. The best sorbents are metal–organic frameworks that can capture water vapour at low relative humidity and release it with modest heating. MOF-808 loaded with LiCl, for example, can deliver capacities approaching 0.25 g g⁻¹ at 20% relative humidity[^6]. The target for a practical device is higher capacity, faster cycling, and stability over thousands of adsorption–desorption cycles.

The cycle-life limit is hydrolysis. Water sorption and desorption repeatedly stress metal–linker bonds at under-coordinated metal centres[^6], exactly the kind of environment where we expect uMLIP barrier errors to be largest. A candidate framework that looks hydrolytically stable in a raw screen could collapse in weeks, while a more robust one is discarded. Reliable hydrolysis barriers would let cycle life be screened before synthesis; we have not tested a correction for them.

### Ion-selective frameworks for lithium recovery

Lithium recovery from brine is critical to battery supply chains. Conventional evaporation ponds recover only 30–50% of lithium over 12–24 months and consume enormous volumes of water[^7]. Direct lithium extraction aims to raise recovery above 80% and reduce residence time to hours, but the selective sorbents and membranes that would make it economical do not yet exist at scale.

The selectivity problem is hard because divalent Mg²⁺ binds more strongly than monovalent Li⁺ to most oxygen and nitrogen sites. Selective transport therefore requires size-sieving windows or weak-field binding pockets with precise coordination geometry. Crown-ether membranes and λ-MnO₂ sorbents achieve Li⁺/Mg²⁺ selectivity in the range of 10–50, but the target is above 100 with permeance above 10⁻⁶ mol m⁻² s⁻¹[^8]. In MOF windows and 2D membrane pores, the guest-ion binding energies and migration barriers are set by under-coordinated pore environments, so this is a place where model error would need to be measured before a screen is trusted.

The pressure is rising. Global lithium demand is projected to reach about 2.4 million tonnes of lithium carbonate equivalent by 2030, driven almost entirely by batteries for electric vehicles and grid storage[^12]. Most of that lithium will still come from brine or hard-rock deposits if direct lithium extraction does not scale.

## Air: catalysts for the molecules humans breathe

### Low-temperature NOx reduction

Transportation is the dominant source of NOx in urban areas, and the problem is worst before the exhaust catalyst warms up. Cold-start emissions can account for 50–80% of total trip NOx because the Cu-SSZ-13 selective catalytic reduction catalyst only reaches high conversion above roughly 200 °C[^9]. A catalyst that delivered 90% NOx conversion below 150 °C, and survived H₂O and SO₂, would cut real-driving emissions far more than incremental improvements at operating temperature.

The chemistry depends on adsorption and redox energetics at exchanged Cu²⁺/Cu⁺ cations inside the zeolite pores. These sites are under-coordinated relative to bulk oxide reference states, and the N–O bond activation barriers that control low-temperature activity sit where we expect uMLIPs to be least reliable. Our only adsorption-correction test so far (Round 4, a different catalyst panel) made errors worse, so a correction here would need its own preregistered test.

![Roadway tunnel filtration and low-temperature emissions control as practical ducts, filters, and catalyst beds](images/water-and-air-correcting-the-molecules-we-drink-and-breathe-inline-03--retry-1.jpg)

### Particulate filters

Diesel and gasoline direct-injection engines emit fine soot particles that are captured by ceramic filters, typically silicon carbide or cordierite. The filters work, but regeneration — periodic burning of the accumulated soot — imposes a fuel penalty of 3–7% and must stay below about 500 °C to avoid substrate damage[^10]. A catalysed filter that oxidised soot at lower temperature, with lower backpressure and sub-10 nm particle penetration, would reduce both fuel consumption and urban PM₂.₅.

The design problem is soot oxidation on catalysed channel walls. The reaction involves O₂ activation and carbon gasification at under-coordinated metal and oxide sites, where barrier errors in fast potentials could make many candidate coatings look more active than they are.

### VOC oxidation

Volatile organic compounds from building materials, furnishings, and industrial processes contribute to both indoor air quality and outdoor ozone formation. Formaldehyde and benzene are particularly important because they are common, hazardous, and difficult to oxidise at room temperature. Supported Pt and Pd catalysts can achieve high conversion, but many require temperatures above 150 °C[^11]. A catalyst that oxidised formaldehyde and benzene below 100 °C would open markets in building materials, consumer purifiers, and industrial abatement.

The limiting steps are C–H and O=O activation at single-atom or small-cluster sites on oxide supports. These are the same under-coordinated active sites that dominate low-temperature SCR and soot oxidation. Single-atom catalysts are especially sensitive: if the metal binds the support too weakly it sinters; too strongly it becomes inactive. Both metal–support binding and C–H/O₂ activation barriers would need measured errors before a screen could be trusted.

## What we have tested so far

None of the water or air materials in this piece has been tested by us. The capability described above is a hypothesis. These are the results that bear on it:

- **Barriers.** In Round 4 (July 2026), MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV gate on 30 Li-ion migration paths (MAE 135.0–242.5 meV on completed paths). In Round 5 a direction-gated barrier correction abstained for all four models, so none was applied. See [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the Z1 barrier panel](/articles/the-materials-we-test-against/).
- **Adsorption.** Every selected Δ-correction made catalyst-adsorption holdout error worse ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).
- **Surfaces of fcc metals.** For nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models). Used as an energy-only correction beside CHGNet, it improved one facet on two metals ([the fcc error field](/articles/a-smooth-environment-resolved-error-field/)).
- **Lean checks** cover the arithmetic and stated inequalities behind published numbers; they do not check the physics, the reference data or the pipeline.

If you measure membranes, sorbents or exhaust and VOC catalysts and want to test whether these models can be trusted on your systems, we would like to hear from you; our record and methods are open.

![A rooftop atmospheric-water harvester in a dry built landscape, with a finned sorbent cassette above a small condenser and covered cistern — The sorbent cassette releases captured moisture to the condenser and cistern](images/water-and-air-correcting-the-molecules-we-drink-and-breathe-inline-02.jpg)

## Where this is aimed

Membrane selectivity, sorbent cycle life, ion selectivity, cold-start catalyst activity, soot oxidation and VOC conversion all depend on energies in under-coordinated environments. Raw uMLIPs are fast enough to search the relevant composition spaces, and DFT is accurate enough for individual candidates but too slow to search them. Measuring where the fast models go wrong on these systems, against published references and under gates set in advance, is the first thing we would want to do here.

The stakes are set by the sources cited below: better membranes and sorbents would reduce the energy cost of freshwater supply, selective lithium extraction would ease a mineral constraint on batteries, and low-temperature exhaust and VOC catalysts would cut an air-pollution burden linked to millions of premature deaths each year.

Water and air are a natural next place to test, because the same kinds of pores, metal centres and active sites that matter for batteries and direct air capture also determine what humans drink and breathe. Whether one measurement approach can raise the reliability of discovery across all of them is the open question.

## Footnotes

[^1]: International Desalination Association, *IDA Global Desalination Inventory* (2023); G. Micale, L. Rizzuti, and A. Cipollina, *Seawater Desalination: Conventional and Renewable Energy Processes*, Springer, 2009.

[^2]: UN Water, *United Nations World Water Development Report 2024: Water for Prosperity and Peace*, UNESCO, 2024.

[^3]: World Health Organization, *Ambient Air Quality and Health* fact sheet (2024); Health Effects Institute, *State of Global Air 2024*.

[^4]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025). https://doi.org/10.1038/s41524-024-01500-6

[^5]: Lupine Science, [Round 4 results](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the fcc error-field results note](/articles/a-smooth-environment-resolved-error-field/).

[^6]: N. Hanikel *et al.*, "Evolution of water-harvesting systems in metal-organic frameworks," *ACS Central Science* review literature on MOF hydrolysis and cycling stability (2019–2024).

[^7]: Direct lithium extraction technology reviews; conventional evaporation-pond recovery and water-consumption estimates from DLE industry assessments and Benchmark Mineral Intelligence.

[^8]: Crown-ether membrane and λ-MnO₂ sorbent performance: literature on Li⁺/Mg²⁺ separation, including selectivity and permeance targets for direct lithium extraction.

[^9]: U.S. Environmental Protection Agency and European Environment Agency NOx inventories; automotive emissions literature on cold-start contribution to trip emissions and Cu-SSZ-13 NH₃-SCR catalyst light-off behaviour.

[^10]: Diesel and gasoline particulate filter literature on silicon carbide and cordierite substrates, regeneration temperature, and fuel penalty estimates.

[^11]: Supported noble-metal VOC oxidation catalyst literature on formaldehyde and benzene conversion temperatures for Pt/Pd catalysts.

[^12]: International Energy Agency, *The Role of Critical Minerals in Clean Energy Transitions*, IEA, 2022; IEA *Global EV Outlook* lithium-demand projections.