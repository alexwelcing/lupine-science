> **Date:** 2026-07-16
> **Updated:** 2026-11-11
> **Deck:** Critical-mineral recovery and PFAS remediation share a computational bottleneck — binding and activation energies in under-coordinated environments — and both would need model error measured before a fast screen could be trusted.
> **Summary:** Critical-mineral recycling, direct lithium extraction and PFAS destruction share a materials-discovery problem: binding and activation energies in under-coordinated environments, where machine-learned potentials are least reliable. This piece describes where the work is aimed and what has been tested so far. A direction, not a result.
> **Status:** Direction
> **Evidence Status:** Direction, not a result. Scientific mechanisms are source-cited. Quantitative market, demand, site-count, cost, and performance figures are contextual estimates with unresolved verification gaps; proposed recovery and PFAS-destruction applications are research directions, not demonstrated Lupine outcomes. What we have tested: in Round 4 (July 2026) our barrier, adsorption and lattice/elastic correction tests failed and the magnetism test abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models).

# Critical Minerals, PFAS, and the Remediation Imperative

<div class="callout warning">
<strong>Evidence gaps.</strong> This article distinguishes established mechanisms from planning context and proposed applications. Quantitative market, demand, site-count, remediation-cost, and performance figures are retained as attributed contextual estimates but have not received independent Lupine evidence review. Statements about corrected models enabling mineral recovery or PFAS destruction describe research directions; they are not evidence of a validated catalyst, sorbent, commercial process, deployment, or forecast.
</div>

The energy transition is sometimes framed as a carbon problem, but it is equally a atoms problem. Every gigawatt-hour of batteries, every turbine, and every grid-scale storage installation requires lithium, cobalt, nickel, manganese, and rare-earth elements in quantities that primary mining cannot supply cleanly or quickly. By 2040, clean-energy technologies are expected to drive a four- to six-fold increase in mineral demand[^1]. Recycling, direct lithium extraction, and urban mining are therefore not peripheral sustainability gestures; they are load-bearing parts of the transition. Yet the materials that would make them economical — selective sorbents, selective extractants, direct-recycling reconstruction conditions — are still discovered largely by trial and error.

In parallel, another atoms problem is accumulating in groundwater, blood serum, and soil. Per- and polyfluoroalkyl substances, or PFAS, are synthetic compounds whose carbon–fluorine backbone makes them extraordinarily persistent, mobile, and toxic at trace levels. The U.S. Environmental Protection Agency has set maximum contaminant levels of four nanograms per litre for PFOA and PFOS in drinking water[^2]. Meeting those levels at scale, and ultimately destroying the captured material rather than relocating it, requires sorbents and catalysts that do not yet exist commercially.

![The Atoms Problem Behind the Energy Transition](images/critical-minerals-pfas-and-the-remediation-imperative-01-atoms-problem.jpg)
*Clean-energy technologies are expected to drive a four- to six-fold increase in mineral demand by 2040, turning atoms into a central constraint on the energy transition. Source: IEA, The Role of Critical Minerals in Clean Energy Transitions, 2022.*

These two problems look unrelated. One is a supply-chain bottleneck for the energy transition; the other is a public-health and environmental-liability crisis. They converge, however, on the same computational challenge. Both require accurate predictions of binding and activation energies in flexible, under-coordinated environments — ion-insertion sites in sorbents, ligand pockets in extractants, surface and single-atom sites in defluorination catalysts — where universal machine-learning interatomic potentials (uMLIPs) are least reliable. That makes them a natural pair for the same kind of measurement; whether a correction would help either is untested.

## The mineral-supply gap

Primary supply for several energy-transition metals is geographically concentrated and environmentally contentious. Roughly seventy percent of mined cobalt comes from the Democratic Republic of Congo[^3]. Lithium extraction from South American salt brines consumes enormous volumes of water in already water-stressed regions. Nickel mining in Indonesia has been linked to deforestation and tailings disposal. These constraints are not hypothetical: they already move commodity prices and shape geopolitical alignments.

Recycling is the obvious offset. Spent lithium-ion batteries contain cobalt, nickel, lithium, and manganese at concentrations higher than many natural ores. The global battery recycling market is projected at thirty-five to fifty billion dollars by 2030[^4]. Current flowsheets, however, are blunt instruments. Pyrometallurgy recovers cobalt and nickel but often loses lithium to slag. Hydrometallurgy can recover more elements but consumes large quantities of acid, base, and organic solvents, and produces waste streams of its own. Direct recycling — restoring degraded cathode particles to usable composition without full element separation — could cut energy use by fifty to eighty percent compared with conventional routes[^5], but it requires precise control of re-lithiation, transition-metal reordering, and oxygen-vacancy healing. Those are defect-mediated processes, and they are exactly where raw uMLIPs fail.

![The Geopolitical and Technical Risks of Mineral Supply](images/critical-minerals-pfas-and-the-remediation-imperative-07-supply-risk-landscape.jpg)
*Roughly seventy percent of mined cobalt comes from a single jurisdiction, while direct recycling could cut energy use by fifty to eighty percent — if the materials science can be solved. Sources: U.S. Geological Survey / Benchmark Mineral Intelligence; ReCell Center / U.S. DOE; industry analyst estimates.*

Direct lithium extraction from brine offers another route. Conventional evaporation ponds recover only thirty to fifty percent of lithium over twelve to twenty-four months and leave behind large footprints. Selective sorbents and membranes promise recovery above eighty percent in hours, but only if they can discriminate Li⁺ from Na⁺, K⁺, Mg²⁺, Ca²⁺, and other ions in complex natural brines[^6]. The selectivity problem is a binding-energy problem: the right sorbent must present pockets with the correct size, charge density, and coordination flexibility to bind Li⁺ weakly enough to release it during regeneration while excluding more strongly binding divalent ions.

Cobalt–nickel separation adds a further wrinkle. Both elements occur in similar oxidation states and have similar ionic radii in battery leachate. Industrial separation relies on phosphinic-acid extractants such as Cyanex 272, but multi-stage circuits are required because single-stage separation factors are modest. Better extractants would need ligand pockets that discriminate Co²⁺/³⁺ from Ni²⁺ across pH, chloride concentration, and organic-phase conditions. Designing them from first principles means predicting metal–ligand binding free energies and extraction-complex geometries in polar, flexible environments.

## PFAS: the forever-chemical bind

PFAS are, in a sense, the opposite of a supply-chain problem: they are a material already present in excess. Their useful properties — water, oil, and stain repellence; thermal stability; surfactant behavior — come from the same carbon–fluorine bond that makes them nearly impossible to break down in the environment. The C–F bond dissociation energy is approximately 485 kJ mol⁻¹, one of the strongest in organic chemistry[^7]. Once released, PFAS migrate through soils, aquifers, and food webs. They have been detected in the blood of nearly all people tested in representative U.S. samples, and epidemiological studies associate several PFAS with immune, thyroid, liver, kidney, and developmental effects[^8].

![A contained mine-tailings water skid with one ion-selective membrane cassette between a feed tank and a recovered-mineral vessel — The membrane cassette separates dissolved critical ions into the recovery vessel](images/critical-minerals-pfas-and-the-remediation-imperative-inline-01.jpg)

![PFAS in the Environment: Eighty Thousand Sites and Counting](images/critical-minerals-pfas-and-the-remediation-imperative-02-pfas-contamination-map.jpg)
*More than eighty thousand PFAS contamination sites have been identified in the United States, with remediation costs reaching one to five million dollars per site per year. Sources: Environmental Working Group / U.S. EPA; industry analyst estimates.*

The regulatory response is tightening. Beyond the EPA drinking-water rule, states have enacted lower limits, and the European Chemicals Agency is evaluating restrictions on broad classes of PFAS. Remediation costs for contaminated water can reach one to five million dollars per site annually, and more than eighty thousand contamination sites have been identified in the United States alone[^9]. The global PFAS remediation market is projected at five to ten billion dollars by 2030[^10].

Current treatment technologies concentrate PFAS but do not destroy it. Granular activated carbon, ion-exchange resins, and reverse osmosis remove PFOA and PFOS from water, but the spent media must then be incinerated, landfilled, or treated by emerging destructive methods. Incineration requires temperatures above one thousand degrees Celsius and carries the risk of incomplete combustion and fluorinated emissions. Hydrothermal and plasma processes show promise but remain energy-intensive and scale-limited. A room-temperature catalytic defluorination route that mineralizes PFAS to fluoride, carbon dioxide or methane, and water would transform the economics of remediation. No such catalyst is commercial today.

![The Bond That Makes PFAS Forever](images/critical-minerals-pfas-and-the-remediation-imperative-03-carbon-fluorine-backbone.jpg)
*The carbon–fluorine bond, with a dissociation energy of roughly 485 kJ mol⁻¹, is what makes PFAS both extraordinarily useful and extraordinarily persistent. Source: B. E. Smart, Kirk-Othmer Encyclopedia of Chemical Technology, 4th ed., Wiley, 1994.*

The two materials challenges are therefore a selective sorbent that binds PFAS at nanogram-per-litre levels in the presence of natural organic matter and common ions, and a catalyst that activates the C–F bond at moderate temperature without being poisoned by fluoride. Both challenges live in under-coordinated environments: hydrophobic and fluorophilic pockets in the sorbent, and metal surface or single-atom sites in the catalyst.

## Why raw uMLIPs misrank the candidates

The likely failure mode is the one this series starts from. uMLIPs are trained mostly on bulk, near-equilibrium configurations where atoms have high, regular coordination numbers. Functional materials, by contrast, do their work at surfaces, vacancies, pore windows, and transition states. Deng et al. document a systematic softening of the potential energy surface in universal MLIPs trained on MPtrj, with energies and forces under-predicted away from equilibrium[^11]. In our own benchmark of four uMLIPs on 21 mostly metallic materials, defect-family observables (surfaces, vacancies, stacking faults) erred 15–60 times more than bulk observables; whether the same holds at the sorbent pores, extractant pockets and catalyst sites discussed here is untested.

If those errors are large here, they would matter in specific ways. For a lithium-selective sorbent, they would distort the relative binding energies of Li⁺, Na⁺, K⁺, and Mg²⁺ in flexible pore pockets, so a framework that looks selective in a raw screen could be mediocre in experiment. For a Co–Ni extractant, they would distort metal–ligand distances and binding free energies, and so separation-factor rankings. For direct recycling, they would bear on Li⁺ migration barriers and oxygen-vacancy formation energies in degraded cathode particles, and so on the re-lithiation conditions a model predicts.

For PFAS the stakes are similar. Errors in C–F activation barriers on under-coordinated metal sites would produce false-positive defluorination catalysts; errors in metal–fluoride formation energies would hide catalysts that convert irreversibly to a stable fluoride; and errors in host–guest binding energies in fluorophilic pores would mislead sorbent screens at environmental concentrations.

Whether the error here has a smooth, measurable structure, as it did for fcc metals[^12], is the open question. If it does, correction might be possible; if it does not, the right output is a measured error bar and an abstention.

## What we have tested so far

None of the sorbents, extractants or catalysts in this piece has been tested by us. The capability described above is a hypothesis. These are the results that bear on it:

- **Barriers.** In Round 4 (July 2026), MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV gate on 30 Li-ion migration paths (MAE 135.0–242.5 meV on completed paths). In Round 5 a direction-gated barrier correction abstained for all four models, so none was applied. See [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the Z1 barrier panel](/articles/the-materials-we-test-against/).
- **Adsorption.** Every selected Δ-correction made catalyst-adsorption holdout error worse ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).
- **Surfaces of fcc metals.** For nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models). Used as an energy-only correction beside CHGNet, it improved one facet on two metals ([the fcc error field](/articles/a-smooth-environment-resolved-error-field/)).
- **Lean checks** cover the arithmetic and stated inequalities behind published numbers; they do not check the physics, the reference data or the pipeline.

If you measure recovery sorbents, extractants or defluorination catalysts and want to test whether these models can be trusted on your systems, we would like to hear from you; our record and methods are open.

![A PFAS treatment column in cutaway, packed with granular sorbent between an inlet pipe and a sealed effluent sampling bottle — The packed sorbent captures persistent contaminants before the sampling bottle](images/critical-minerals-pfas-and-the-remediation-imperative-inline-02.jpg)

## What a joint test campaign could look like

Treating critical-mineral recovery and PFAS remediation as one program could make sense because the computational primitives are shared: binding energies in flexible coordination environments, activation barriers at under-coordinated metal sites, and metastable phases that equilibrium screening would discard.

A first campaign would measure before it corrects. It would lock a panel of sorbent, extractant and catalyst systems with published reference values, write pass/fail gates in advance, and record how far each fast model misses — for sorbents, on Li⁺/Mg²⁺ or PFOA/organic-matter binding; for extractants, on Co/Ni separation factors; for catalysts, on C–F activation barriers and fluoride resistance. Only if the errors turned out to be regular would a correction be worth testing, under its own preregistration.

Predictions outside a measured domain would be reported as unsupported rather than ranked, to avoid the familiar pattern in which a screen produces a long list of "predicted" materials that cannot be made or do not perform as advertised.

## The stakes, as estimated by others

Critical-mineral demand is projected to grow four- to six-fold by 2040, and battery recycling alone is estimated at thirty-five to fifty billion dollars by 2030[^1][^4]. Cobalt supply concentration in a single jurisdiction creates price and ethical risk that recycling can mitigate only if separation economics improve. Direct lithium extraction promises to raise lithium recovery from thirty to fifty percent to above eighty percent while reducing water use and land footprint[^6].

![Two unmarked sample cartridges, one mineral-bearing water and one contaminated water, entering the same modular pressure-flow test fixture from opposite sides — The shared fixture ranks cartridge performance under an identical controlled flow test](images/critical-minerals-pfas-and-the-remediation-imperative-inline-03.jpg)

On the PFAS side, more than eighty thousand U.S. sites are contaminated, remediation costs reach millions of dollars per site per year, and the global remediation market is projected at five to ten billion dollars by 2030[^9][^10]. A catalytic destruction route that cuts disposal costs by fifty to eighty percent relative to incineration would be transformative not only financially but environmentally, because it would close the loop instead of moving concentrated PFAS between media.

These are other organisations' estimates of the size of the problems, not claims about what Lupine Science will deliver.

## Where this is aimed

Critical-mineral recovery and PFAS remediation sit on opposite sides of the industrial metabolism. One puts scarce atoms back into use; the other removes harmful atoms from circulation. Both depend on binding and barrier energies in under-coordinated environments, and both need screens over composition spaces too large for DFT. That makes them good places to measure where fast models go wrong.

We do not have a correction for either. The evidence so far is narrow: an error field that held on fcc-metal surfaces, and barrier and adsorption correction tests that failed. Measuring first, under gates set in advance, is where this would start.

Cement and concrete — the heaviest industrial material by mass — present another case where amorphous, metastable and under-coordinated phases control both emissions and performance.

![A public-works scale remediation scene: treatment tanks, monitoring wells, and a materials recovery bay](images/critical-minerals-pfas-and-the-remediation-imperative-spread--retry-1.jpg)

## Footnotes

[^1]: International Energy Agency, *The Role of Critical Minerals in Clean Energy Transitions*, IEA, 2022.

[^2]: U.S. Environmental Protection Agency, "National Primary Drinking Water Regulations: Per- and Polyfluoroalkyl Substances (PFAS)," Federal Register, 2024.

[^3]: U.S. Geological Survey, *Mineral Commodity Summaries 2024*; Benchmark Mineral Intelligence cobalt supply estimates.

[^4]: Industry and analyst estimates for the global battery recycling market; range reflects variation in chemistry, region, and recovered-product pricing.

[^5]: ReCell Center, U.S. Department of Energy, *Direct Recycling of Lithium-Ion Battery Cathodes* technology summaries; Recellular process estimates.

[^6]: Direct lithium extraction technology reviews; see e.g. J. E. Plevin et al., "Direct Lithium Extraction: A Review of Technologies," *Resources, Conservation and Recycling* (2024) and references therein.

[^7]: B. E. Smart, "Organofluorine Chemistry," in *Kirk-Othmer Encyclopedia of Chemical Technology*, 4th ed., Wiley, 1994; C–F bond dissociation energy reference data.

[^8]: U.S. Agency for Toxic Substances and Disease Registry, *Toxicological Profile for Perfluoroalkyls*; U.S. EPA health effects summaries for PFAS.

[^9]: Environmental Working Group, "PFAS Contamination in the U.S." mapping; U.S. EPA PFAS contamination site inventory.

[^10]: Industry analyst estimates for the global PFAS remediation market; range reflects treatment technology and regulatory scenario variation.

[^11]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025). https://doi.org/10.1038/s41524-024-01500-6

[^12]: Lupine Science, [Round 4 results](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the fcc error-field results note](/articles/a-smooth-environment-resolved-error-field/).