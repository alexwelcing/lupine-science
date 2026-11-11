> **Date:** 2026-07-16
> **Deck:** Why low-temperature methane conversion and low-GWP refrigerants are hard cases for machine-learned potentials, and what we would need to test.
> **Summary:** Methane and hydrofluorocarbon refrigerants are large non-CO₂ climate levers, and both are materials-limited. This July 2026 piece sets out where measured model error matters for their discovery and what would have to be tested before a fast screen could be trusted. A direction, not a result.
> **Updated:** 2026-11-11
> **Status:** Direction
> **Evidence Status:** Direction, not a result. Capability statements below are hypotheses we have not tested on these materials. What we have tested: in Round 4 (July 2026) our barrier, adsorption and lattice/elastic correction tests failed and the magnetism test abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models). Literature figures are attributed to their sources.

# Methane and Refrigerants: Cutting the Non-CO₂ Climate Forcers

Carbon dioxide dominates climate policy because it accumulates for millennia, but it is not the only molecule warming the atmosphere. Methane and hydrofluorocarbon refrigerants are the two most important non-CO₂ forcers in the near term, and both are constrained by materials that do not yet exist. Cutting anthropogenic methane 30% by 2030 could avoid roughly 0.3 °C of warming by 2040[^1]. Phasing down HFCs under the Kigali Amendment could avoid up to 0.5 °C by 2100[^2]. Together these two targets are comparable to the entire energy-sector decarbonization problem in near-term leverage.

![The Non-CO₂ Warming Lever](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-01-non-co2-warming-lever.jpg)
*Methane and HFC refrigerants together offer warming avoidance comparable to the entire energy-sector transition, yet both depend on materials that do not yet exist. Sources: UNEP Global Methane Assessment, 2021; UNEP / US EPA Kigali Amendment impact estimates; IPCC AR6.*

Yet the tools used to discover the materials for each target share a weakness. Universal machine-learning interatomic potentials (uMLIPs) are trained mostly on bulk, equilibrium configurations, while the functional behaviour of methane-oxidation catalysts, refrigerant fluids and caloric solids is controlled by under-coordinated environments — surfaces, transition states, radical fragments and phase boundaries. Deng et al. document a systematic softening of the potential energy surface in universal MLIPs trained on MPtrj, with energies and forces under-predicted away from equilibrium[^3]. In our own benchmark of four uMLIPs on 21 mostly metallic materials, defect-family observables (surfaces, vacancies, stacking faults) erred 15–60 times more than bulk observables; whether the same holds at the transition states, radical fragments and phase boundaries discussed here is untested. If those errors are large there, candidate rankings could invert. Measuring them is the first step; correcting them is a hypothesis.

## The methane imperative

Methane is responsible for roughly 30% of current global warming. Over a twenty-year horizon its global warming potential is 80–85× that of CO₂[^4]. Anthropogenic sources emit roughly 360 Mt CH₄ per year, equivalent to about 10 GtCO₂e at twenty-year GWP[^5]. The Global Methane Pledge, signed by more than 150 countries, commits to a 30% reduction by 2030[^1].

Those reductions are not all materials-limited. Fugitive emissions from oil and gas infrastructure can be cut with better monitoring, maintenance, and leak repair. Landfill gas can be captured and flared. But a substantial fraction of anthropogenic methane is diffuse or geographically stranded: enteric fermentation from livestock, rice paddies, abandoned coal mines, and small biogas sources where pipeline transport is uneconomical. For these streams, the most valuable mitigation path is conversion at the source into a storable, transportable product — methanol, hydrogen, or solid carbon — which requires catalysts that operate at low temperature and high selectivity.

The materials bottleneck is severe. The C–H bond in methane is one of the strongest in organic chemistry at ~439 kJ mol⁻¹[^6]. Activating it at low temperature almost always over-oxidises the product to CO₂, because the same metal sites that bind CHₓ intermediates strongly enough to break the C–H bond also bind oxygenates too tightly. This is the scaling-relation problem: the adsorption energies of CH₄, CH₃OH, and CO₂ intermediates move together across conventional metal surfaces, so a catalyst that activates methane tends to destroy methanol[^7].

![Breaking the Scaling Relation in Direct Methane-to-Methanol](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-05-methane-to-methanol-scaling.jpg)
*Active methane catalysts tend to over-oxidize methanol: the scaling relation an accurate barrier calculation would need to see past. Sources: Berkowitz et al., J. Phys. Chem., 1994; IEA / Methanol Institute technology assessments; Grundner et al., Nat. Commun., 2015.*

## Direct methane-to-methanol

Industrial methanol production today passes through syngas, an energy-intensive sequence of steam methane reforming and partial oxidation that operates at 800–1000 °C and emits CO₂ both from combustion and from the chemistry itself. A direct, low-temperature partial oxidation of methane to methanol would eliminate the syngas step, cut energy use by an estimated 20–30%, and enable distributed processing of stranded biogas and landfill gas[^8]. The prize is large: global methanol demand is roughly 110 Mt per year, worth about $40 billion annually[^9].

![A methane-pyrolysis vessel in cutaway with solid carbon dropping into shallow collection trays and one gas conduit leaving the top — The hot reactor splits methane while solid carbon is physically removed into trays](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-inline-02.jpg)

The direct route has been a long-standing target. Homogeneous systems using Fe- or Cu-exchanged zeolites at sub-200 °C can achieve high selectivity to methanol, but only at low single-pass conversion because the methanol product must be extracted before further oxidation[^10]. Heterogeneous catalysts have struggled to match both metrics simultaneously. The reason is the scaling relation described above: any site with enough activity to dissociate methane also tends to over-oxidise the methanol intermediate.

Breaking scaling relations is a materials-discovery problem that sits exactly at the boundary of what atomistic screening can address. Candidate active sites — single-metal cations in zeolite frameworks, single-atom alloys, confined metal clusters, metal-oxide interfaces — number in the thousands when framework, dopant, and support variations are included. Density functional theory (DFT) is accurate enough for any one candidate but economically impossible across the full space. Raw uMLIPs are fast enough but misrank the candidates because the C–H activation barrier, the O-insertion step, and the desorption energy of methanol all involve under-coordinated metal environments.

![A direct methane-to-methanol reactor train as practical vessels and heat exchangers, with the catalytic zone marked in indigo](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-inline-01--retry-1.jpg)

Our hypothesis is that this error can be measured as a function of local coordination and, where it is regular, corrected. On nine fcc metals an error field fitted to three observables predicted a fourth for three of four models[^11]. Whether that carries over to CH₄ dissociation on under-coordinated sites is untested, and our only barrier-correction tests (Li-ion migration, Rounds 4 and 5) failed or abstained.

If such a field exists for these catalysts, the places where it departs from its smooth trend could point to unusual electronic structures that break the standard scaling relation. That is a second hypothesis, not a result.

## Methane pyrolysis for turquoise hydrogen

Methane pyrolysis offers a different product slate: hydrogen plus solid carbon. If the carbon is durable or sequestered, the process can be near-zero-emission. Conventional thermal pyrolysis requires temperatures above 1000 °C, which consumes much of the energy value of the methane and produces amorphous carbon that is hard to use. Molten-metal and molten-salt catalysts — Ni, Cu, Sn, and their alloys are the most studied — can lower the temperature to 700–900 °C while producing graphitic or carbon-black products[^12].

![Methane Pyrolysis: Lower Temperature, Useful Carbon](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-06-methane-pyrolysis-temperature.jpg)
*Molten-metal catalysts can cut methane pyrolysis temperatures from above 1000 °C to 700–900 °C, producing hydrogen and a storable solid carbon product. Source: Abánades, Int. J. Hydrogen Energy, 2012.*

The materials problem is again controlled by under-coordinated environments. Carbon solubility in the melt, diffusion to the nucleation site, and the structure of the nucleated carbon all depend on metal–carbon binding at defect sites, alloy surfaces and three-phase boundaries, where fast potentials are least reliable. Errors there would mislead predictions of coking rate, catalyst lifetime and carbon quality.

Molten-metal systems are also dynamic: the active surface reconstructs, carbon precipitates, and local coordination changes during operation. Any prediction here would need to say which parts depend on operating conditions the model cannot bound.

## Refrigerants and the Kigali Amendment

Hydrofluorocarbon refrigerants were introduced to protect the stratospheric ozone layer, replacing CFCs and HCFCs, but they are potent greenhouse gases. The Kigali Amendment to the Montreal Protocol aims to reduce HFC consumption roughly 80% by 2047, with estimates that full compliance could avoid up to 0.5 °C of warming by 2100[^2]. Without controls, HFC emissions could rise to 5–9 GtCO₂e per year by mid-century[^13]. The global HVAC refrigerant market is roughly $20 billion per year, and the transition is already underway in major economies.

![The Refrigerant Trade-Off: GWP, Performance, and Safety](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-07-refrigerant-gwp-landscape.jpg)
*Today's refrigerants force a choice between low GWP, high efficiency, and safety; computational screening must explore millions of candidates to find one that satisfies all three. Sources: ASHRAE Standard 34; Velders et al., Climatic Change, 2021.*

The replacement problem is molecular. A viable vapor-compression refrigerant must simultaneously satisfy thermophysical, safety, and compatibility constraints: vapor pressure curve, critical temperature, latent heat of vaporization, heat capacity, viscosity, lubricant miscibility, flammability, toxicity, and atmospheric lifetime. Current options are a compromise. R-32 has a GWP of 675, too high for the long term. R-1234yf has GWP below 1 but is patented, costly, and raises decomposition and flammability questions[^14]. Natural refrigerants — CO₂, ammonia, hydrocarbons — are viable in some applications but face toxicity, pressure, or flammability limits that prevent universal substitution.

Fluorine-free synthetic refrigerants are attractive because they can be engineered to match the performance of HFCs while eliminating the greenhouse-gas liability. The search space of small organic molecules is in the millions, and experimental screening of every candidate is impossible. Computational screening must predict vapor pressure, latent heat, transport properties, flammability, and atmospheric lifetime across that space.

Each of those properties depends on under-coordinated environments. Vapor pressure and latent heat come from intermolecular potentials. Transport properties depend on collision dynamics and radical intermediates. Flammability and atmospheric lifetime are controlled by C–H and C–F bond dissociation energies in radical transition states — precisely the open-shell, low-coordination configurations where uMLIPs fail[^3]. A generic force field may rank bulk thermodynamics adequately but will misrank combustion chemistry and decomposition pathways.

Three properties would need trustworthy predictions: vapor pressure, latent heat and transport properties for candidate fluids; C–H and C–F bond dissociation energies in radical transition states, which set flammability and atmospheric lifetime; and decomposition pathways. The second and third sit in exactly the under-coordinated regime where fast potentials are least reliable, so their errors would need to be measured before a screen is trusted.

## Solid-state refrigerants: caloric materials

An even more radical path eliminates the working fluid entirely. Solid-state refrigeration exploits caloric effects — magnetocaloric, electrocaloric, and elastocaloric — in which an external field drives an entropy change near room temperature. The technology is attractive because it removes refrigerant leakage and can, in principle, exceed vapor-compression efficiency by 20–50%[^15].

![A building cooling plant with one solid-state caloric module clamped between a warm loop and a cold loop inside an accessible service cabinet — The caloric module pumps heat between the two closed fluid loops](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-inline-03.jpg)

The materials problem is phase transitions. Magnetocaloric alloys near room temperature, such as LaFeSi-based compounds and Heusler alloys, undergo first-order phase transitions with large entropy changes but also hysteresis losses. The hysteresis comes from nucleation, twin boundaries, and metastable intermediate phases — all under-coordinated environments that uMLIPs soften. A screen based on equilibrium thermodynamics discards the metastable phases that often deliver the best caloric response, while raw uMLIPs misrank the transition temperatures and hysteresis widths.

Transition-state and twin-boundary energies would need to be reliable to rank candidates by the combination of entropy change and hysteresis, and predictions of transition temperature would need to be kept apart from microstructure-dependent ones. A caloric material with low hysteresis is not a discovery until both are measured.

## What we have tested so far

None of the methane catalysts, refrigerants or caloric materials in this piece has been tested by us. The capability described above is a hypothesis. These are the results that bear on it:

- **Barriers.** In Round 4 (July 2026), MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV gate on 30 Li-ion migration paths (MAE 135.0–242.5 meV on completed paths). In Round 5 a direction-gated barrier correction abstained for all four models, so none was applied. See [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the Z1 barrier panel](/articles/the-materials-we-test-against/).
- **Adsorption.** Every selected Δ-correction made catalyst-adsorption holdout error worse ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).
- **Surfaces of fcc metals.** For nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models). Used as an energy-only correction beside CHGNet, it improved one facet on two metals ([the fcc error field](/articles/a-smooth-environment-resolved-error-field/)).
- **Lean checks** cover the arithmetic and stated inequalities behind published numbers; they do not check the physics, the reference data or the pipeline.

If you measure methane-conversion catalysts, refrigerant properties or caloric materials and want to test whether these models can be trusted on your systems, we would like to hear from you; our record and methods are open.

## Where this is aimed

Methane and refrigerants look like different problems — one a strong C–H bond, the other a thermodynamic cycle — but the useful physics in both happens in under-coordinated environments: the C–H activation transition state, the metal–carbon binding site in a molten alloy, the radical transition state of a refrigerant molecule, the twin boundary of a caloric alloy. If the error there has a regular shape, it could be measured and tested the same way in each. That is the direction.

## Why this matters now

The policy timelines are short. The Global Methane Pledge target is 2030. The Kigali Amendment phase-down is accelerating in major markets. Both require materials transitions that cannot be completed by brute-force experiment alone. A direct methane-to-methanol catalyst with >10% single-pass conversion and >90% selectivity below 250 °C does not exist. A fluorine-free refrigerant with GWP below 10, COP within 10% of R-410A, and acceptable safety classification does not exist. A caloric material with low hysteresis near room temperature is still largely at the prototype stage.

What does not yet exist is a way to search these spaces with fast models whose errors are known. The stakes, by the estimates cited here (UNEP on methane, Velders et al. and the Kigali Amendment on HFCs), are large; whether measured corrections can help is the question we would want to test.

![An empty refrigerated food warehouse with a rooftop heat-pump module connected to one interior cold-room heat exchanger, most of the frame is pale sky and wall — The closed refrigerant loop moves heat from the cold room to the rooftop exchanger](images/methane-and-refrigerants-cutting-the-non-co2-climate-forcers-spread.jpg)
## Footnotes

[^1]: UNEP, *Global Methane Assessment: Benefits and Costs of Mitigating Methane Emissions*, 2021; Global Methane Pledge, launched at COP26, 150+ countries.

[^2]: UNEP / US EPA, Kigali Amendment to the Montreal Protocol impact estimates; G. J. M. Velders *et al.*, "Projections of hydrofluorocarbon (HFC) emissions and the resulting global warming based on recent trends in observed abundances and current policies," *Climatic Change* **169**, 35 (2021). https://doi.org/10.1007/s10584-021-03263-6

[^3]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025). https://doi.org/10.1038/s41524-024-01500-6

[^4]: IPCC, *Climate Change 2021: The Physical Science Basis*, Contribution of Working Group I to the Sixth Assessment Report, Cambridge University Press, 2021.

[^5]: IPCC AR6 and Global Carbon Project methane budgets; ~360 Mt CH₄/year anthropogenic emissions, ~10 GtCO₂e at 20-year GWP.

[^6]: J. Berkowitz, G. B. Ellison, and D. Gutman, "Three methods to measure RH bond energies," *Journal of Physical Chemistry* **98**, 11, 2744–2765 (1994); C–H bond dissociation energy in methane ~439 kJ mol⁻¹.

[^7]: V. L. Sushkevich *et al.*, "Selective anaerobic oxidation of methane enables direct synthesis of methanol," *Science* **356**, 6337, 523–527 (2017); scaling-relation discussion in direct methane-to-methanol catalysis.

[^8]: Process engineering estimates for syngas-versus-direct methanol routes; see e.g., IEA and Methanol Institute technology assessments.

[^9]: Methanol Institute, global methanol market data; ~110 Mt/year production, ~$40 billion/year market value.

[^10]: S. Grundner *et al.*, "Single-site trinuclear copper oxygen clusters in mordenite for selective oxidation of methane to methanol," *Nature Communications* **6**, 7546 (2015); overview of Fe/Cu-zeolite direct partial oxidation systems.

[^11]: Lupine Science, [the fcc error-field results note](/articles/a-smooth-environment-resolved-error-field/) and [Round 4 results](/articles/four-gates-three-honest-failures-one-live-experiment/).

[^12]: A. Abánades, "The challenge of hydrogen production by methane pyrolysis: thermodynamic and kinetic assessment," *International Journal of Hydrogen Energy* **37**, 21, 16218–16225 (2012); molten-metal catalyst literature for low-temperature methane pyrolysis.

[^13]: G. J. M. Velders *et al.*, "Projections of hydrofluorocarbon (HFC) emissions and the resulting global warming based on recent trends in observed abundances and current policies," *Climatic Change* **169**, 35 (2021); HFC emissions trajectory without controls.

[^14]: ASHRAE Standard 34, *Designation and Safety Classification of Refrigerants*; refrigerant safety and GWP data; R-1234yf patent and decomposition literature.

[^15]: O. Gutfleisch *et al.*, "Magnetic materials and devices for the 21st century: stronger, lighter, and more energy efficient," *Advanced Materials* **23**, 7, 821–842 (2011); DOE / ARPA-E estimates for solid-state refrigeration efficiency potential.
