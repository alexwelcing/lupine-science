> **Type:** article
> **Date:** 2026-07-16
> **Scope:** How corrected atomistic predictions can accelerate low-temperature methane conversion and the discovery of low-GWP refrigerants.
> **Description:** Methane and hydrofluorocarbon refrigerants are the largest non-CO₂ climate levers; this article explains why both are materials-limited and how Lupine's correction-and-verification layer changes the discovery geometry.
> **Audience:** sophisticated materials, mechanical, and chemical engineers; climate-tech investors
> **Status:** Draft

# Methane and Refrigerants: Cutting the Non-CO₂ Climate Forcers

Carbon dioxide dominates climate policy because it accumulates for millennia, but it is not the only molecule warming the atmosphere. Methane and hydrofluorocarbon refrigerants are the two most important non-CO₂ forcers in the near term, and both are constrained by materials that do not yet exist. Cutting anthropogenic methane 30% by 2030 could avoid roughly 0.3 °C of warming by 2040[^1]. Phasing down HFCs under the Kigali Amendment could avoid up to 0.5 °C by 2100[^2]. Together these two targets are comparable to the entire energy-sector decarbonization problem in near-term leverage.

Yet the tools we use to discover the materials for each target share the same failure mode. Universal machine-learning interatomic potentials (uMLIPs) are trained on bulk, equilibrium configurations, while the functional behaviour of methane-oxidation catalysts, refrigerant fluids, and caloric solids is controlled by under-coordinated environments — surfaces, transition states, radical fragments, and phase boundaries — where uMLIPs systematically soften the potential energy surface by 15–60%[^3]. The result is not merely inaccurate energies; it is inverted candidate rankings, false-positive catalysts, and discarded metastable phases. This article explains how Lupine's measured environment error field corrects those predictions for methane and refrigerant discovery at uMLIP speed, with machine-checked proof of which claims can be believed.

## The methane imperative

Methane is responsible for roughly 30% of current global warming. Over a twenty-year horizon its global warming potential is 80–85× that of CO₂[^4]. Anthropogenic sources emit roughly 360 Mt CH₄ per year, equivalent to about 10 GtCO₂e at twenty-year GWP[^5]. The Global Methane Pledge, signed by more than 150 countries, commits to a 30% reduction by 2030[^1].

Those reductions are not all materials-limited. Fugitive emissions from oil and gas infrastructure can be cut with better monitoring, maintenance, and leak repair. Landfill gas can be captured and flared. But a substantial fraction of anthropogenic methane is diffuse or geographically stranded: enteric fermentation from livestock, rice paddies, abandoned coal mines, and small biogas sources where pipeline transport is uneconomical. For these streams, the most valuable mitigation path is conversion at the source into a storable, transportable product — methanol, hydrogen, or solid carbon — which requires catalysts that operate at low temperature and high selectivity.

The materials bottleneck is severe. The C–H bond in methane is one of the strongest in organic chemistry at ~439 kJ mol⁻¹[^6]. Activating it at low temperature almost always over-oxidises the product to CO₂, because the same metal sites that bind CHₓ intermediates strongly enough to break the C–H bond also bind oxygenates too tightly. This is the scaling-relation problem: the adsorption energies of CH₄, CH₃OH, and CO₂ intermediates move together across conventional metal surfaces, so a catalyst that activates methane tends to destroy methanol[^7].

## Direct methane-to-methanol

Industrial methanol production today passes through syngas, an energy-intensive sequence of steam methane reforming and partial oxidation that operates at 800–1000 °C and emits CO₂ both from combustion and from the chemistry itself. A direct, low-temperature partial oxidation of methane to methanol would eliminate the syngas step, cut energy use by an estimated 20–30%, and enable distributed processing of stranded biogas and landfill gas[^8]. The prize is large: global methanol demand is roughly 110 Mt per year, worth about $40 billion annually[^9].

The direct route has been a long-standing target. Homogeneous systems using Fe- or Cu-exchanged zeolites at sub-200 °C can achieve high selectivity to methanol, but only at low single-pass conversion because the methanol product must be extracted before further oxidation[^10]. Heterogeneous catalysts have struggled to match both metrics simultaneously. The reason is the scaling relation described above: any site with enough activity to dissociate methane also tends to over-oxidise the methanol intermediate.

Breaking scaling relations is a materials-discovery problem that sits exactly at the boundary of what atomistic screening can address. Candidate active sites — single-metal cations in zeolite frameworks, single-atom alloys, confined metal clusters, metal-oxide interfaces — number in the thousands when framework, dopant, and support variations are included. Density functional theory (DFT) is accurate enough for any one candidate but economically impossible across the full space. Raw uMLIPs are fast enough but misrank the candidates because the C–H activation barrier, the O-insertion step, and the desorption energy of methanol all involve under-coordinated metal environments.

Lupine's environment error field addresses this by measuring and correcting the systematic error as a function of local coordination. For a reference bulk environment, such as fcc metal with coordination number twelve, the error is defined as zero. Three anchor observables fix the field, and a cubic spline with the bulk constraint predicts the correction at lower-coordination environments the field was never directly fitted to[^11]. The corrected barrier for CH₄ dissociation on an under-coordinated site recovers DFT-level accuracy while retaining uMLIP speed, filtering out the false-positive low-temperature catalysts that raw uMLIPs would promote.

Selective field failure adds a second screening signal. In most cases the error field is smooth and predictable; where it deviates, it flags unusual electronic structures that may break the standard scaling relation. Those outliers become the highest-priority targets for expensive ab initio verification and synthesis[^11]. This is the same logic Lupine applied to ammonia catalysts: the correction ranks the bulk of candidates, and the anomalies identify the breakthroughs.

## Methane pyrolysis for turquoise hydrogen

Methane pyrolysis offers a different product slate: hydrogen plus solid carbon. If the carbon is durable or sequestered, the process can be near-zero-emission. Conventional thermal pyrolysis requires temperatures above 1000 °C, which consumes much of the energy value of the methane and produces amorphous carbon that is hard to use. Molten-metal and molten-salt catalysts — Ni, Cu, Sn, and their alloys are the most studied — can lower the temperature to 700–900 °C while producing graphitic or carbon-black products[^12].

The materials problem is again controlled by under-coordinated environments. Carbon solubility in the melt, diffusion to the nucleation site, and the structure of the nucleated carbon all depend on metal-carbon binding at defect sites, alloy surfaces, and three-phase boundaries. Raw uMLIPs underestimate the metal-carbon binding energies and misrank the diffusion barriers, leading to wrong predictions of coking rate, catalyst lifetime, and carbon quality. Corrected metal-carbon binding and carbon diffusion energies identify alloy compositions that resist coking and produce a useful solid product, whether carbon black, graphite, or carbon nanotubes.

Here the verification layer matters as much as the correction. Molten-metal systems are inherently dynamic; the active surface reconstructs, carbon precipitates, and local coordination changes during operation. Lupine's Lean 4 theorems prove which predictions are supported by the measured field and which depend on synthesis or operating conditions that the model cannot bound[^11]. A catalyst composition is not sold as predicted until the correction domain and the metastability boundaries are checked.

## Refrigerants and the Kigali Amendment

Hydrofluorocarbon refrigerants were introduced to protect the stratospheric ozone layer, replacing CFCs and HCFCs, but they are potent greenhouse gases. The Kigali Amendment to the Montreal Protocol aims to reduce HFC consumption roughly 80% by 2047, with estimates that full compliance could avoid up to 0.5 °C of warming by 2100[^2]. Without controls, HFC emissions could rise to 5–9 GtCO₂e per year by mid-century[^13]. The global HVAC refrigerant market is roughly $20 billion per year, and the transition is already underway in major economies.

The replacement problem is molecular. A viable vapor-compression refrigerant must simultaneously satisfy thermophysical, safety, and compatibility constraints: vapor pressure curve, critical temperature, latent heat of vaporization, heat capacity, viscosity, lubricant miscibility, flammability, toxicity, and atmospheric lifetime. Current options are a compromise. R-32 has a GWP of 675, too high for the long term. R-1234yf has GWP below 1 but is patented, costly, and raises decomposition and flammability questions[^14]. Natural refrigerants — CO₂, ammonia, hydrocarbons — are viable in some applications but face toxicity, pressure, or flammability limits that prevent universal substitution.

Fluorine-free synthetic refrigerants are attractive because they can be engineered to match the performance of HFCs while eliminating the greenhouse-gas liability. The search space of small organic molecules is in the millions, and experimental screening of every candidate is impossible. Computational screening must predict vapor pressure, latent heat, transport properties, flammability, and atmospheric lifetime across that space.

Each of those properties depends on under-coordinated environments. Vapor pressure and latent heat come from intermolecular potentials. Transport properties depend on collision dynamics and radical intermediates. Flammability and atmospheric lifetime are controlled by C–H and C–F bond dissociation energies in radical transition states — precisely the open-shell, low-coordination configurations where uMLIPs fail[^3]. A generic force field may rank bulk thermodynamics adequately but will misrank combustion chemistry and decomposition pathways.

Lupine's correction layer changes the screen in three ways. First, corrected intermolecular potentials recover accurate vapor pressure, latent heat, and transport properties for candidate fluids, filtering the millions of molecules down to a tractable set. Second, corrected C–H and C–F bond dissociation energies in radical transition states improve flammability and atmospheric-lifetime predictions, which are safety-critical. Third, the verification layer flags molecules whose decomposition pathways fall outside the measured correction domain, preventing false-negative exclusions of unusual but safe candidates.

## Solid-state refrigerants: caloric materials

An even more radical path eliminates the working fluid entirely. Solid-state refrigeration exploits caloric effects — magnetocaloric, electrocaloric, and elastocaloric — in which an external field drives an entropy change near room temperature. The technology is attractive because it removes refrigerant leakage and can, in principle, exceed vapor-compression efficiency by 20–50%[^15].

The materials problem is phase transitions. Magnetocaloric alloys near room temperature, such as LaFeSi-based compounds and Heusler alloys, undergo first-order phase transitions with large entropy changes but also hysteresis losses. The hysteresis comes from nucleation, twin boundaries, and metastable intermediate phases — all under-coordinated environments that uMLIPs soften. A screen based on equilibrium thermodynamics discards the metastable phases that often deliver the best caloric response, while raw uMLIPs misrank the transition temperatures and hysteresis widths.

Corrected transition-state and twin-boundary energies rank candidates by the combination of entropy change and hysteresis. The same provable-boundary discipline used for cement hydrates and battery cathodes applies here: the system separates supported predictions of transition temperature and entropy from synthesis-dependent microstructure predictions[^11]. A caloric material with low hysteresis is not declared a discovery until the correction domain covers the relevant twin-boundary and nucleation environments.

## A common correction geometry

Methane and refrigerants appear to be different problems — one a strong C–H bond, the other a thermodynamic cycle — but they share the same computational pathology. The useful physics happens in under-coordinated environments: the C–H activation transition state, the metal-carbon binding site in a molten alloy, the radical transition state of a refrigerant molecule, the twin boundary of a caloric alloy. In each case uMLIPs soften the potential energy surface and corrupt the ranking. In each case the error has a geometrically regular shape that can be measured, corrected at runtime, and verified with proof.

Lupine's method is not a new force field trained on each application. It is a measured environment error field with three anchor observables, a bulk constraint, and analytic force corrections that add 15.6% overhead in the current Python implementation and are expected to drop below 1% in a compiled overlay[^11]. The same field that corrects battery cathodes and direct-air-capture sorbents corrects methane-activation barriers, refrigerant bond dissociation, and caloric phase transitions because the failure mode is structural, not chemical.

The verification layer is what makes the correction usable for capital decisions. Blind prediction across 36 (model, material) combinations achieves Pearson r = 0.906 (p = 10⁻⁴, 95% CI [0.82, 0.96]) with zero adjustable parameters[^11]. The accompanying 77 build-locked Lean 4 theorems prove the correction bounds and impossibility conditions[^11]. In a refrigerant screen, that means a molecule flagged as safe has a machine-checked argument. In a methane-catalyst campaign, it means a candidate declared scalable has been shown to lie inside the measured correction domain.

## Why this matters now

The policy timelines are short. The Global Methane Pledge target is 2030. The Kigali Amendment phase-down is accelerating in major markets. Both require materials transitions that cannot be completed by brute-force experiment alone. A direct methane-to-methanol catalyst with >10% single-pass conversion and >90% selectivity below 250 °C does not exist. A fluorine-free refrigerant with GWP below 10, COP within 10% of R-410A, and acceptable safety classification does not exist. A caloric material with low hysteresis near room temperature is still largely at the prototype stage.

What exists is a correction-and-verification layer that can search these spaces with DFT accuracy and uMLIP speed. The addressable impact is substantial: methane and refrigerants together could avoid 0.5–1 °C of warming, and the associated product markets run to tens of billions of dollars per year. The next articles in this series turn to the recovery and remediation targets — critical minerals, PFAS, and cement — where the same correction geometry applies to equally large problems.

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

[^11]: Lupine Science, *Strategic Discovery Plan*, Sections 2–3. Documents the environment error field, r = 0.906 blind prediction, 15.6% runtime overhead, 77 build-locked Lean 4 theorems, and boundary conditions for impossibility proofs.

[^12]: A. Abánades, "The challenge of hydrogen production by methane pyrolysis: thermodynamic and kinetic assessment," *International Journal of Hydrogen Energy* **37**, 21, 16218–16225 (2012); molten-metal catalyst literature for low-temperature methane pyrolysis.

[^13]: G. J. M. Velders *et al.*, "Projections of hydrofluorocarbon (HFC) emissions and the resulting global warming based on recent trends in observed abundances and current policies," *Climatic Change* **169**, 35 (2021); HFC emissions trajectory without controls.

[^14]: ASHRAE Standard 34, *Designation and Safety Classification of Refrigerants*; refrigerant safety and GWP data; R-1234yf patent and decomposition literature.

[^15]: O. Gutfleisch *et al.*, "Magnetic materials and devices for the 21st century: stronger, lighter, and more energy efficient," *Advanced Materials* **23**, 7, 821–842 (2011); DOE / ARPA-E estimates for solid-state refrigeration efficiency potential.
