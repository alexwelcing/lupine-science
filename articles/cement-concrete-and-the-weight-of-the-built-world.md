> **Date:** 2026-07-16
> **Deck:** Why low-CO₂ binders, alternative clinkers and CO₂-cured concrete are a hard case for machine-learned potentials: amorphous, metastable, under-coordinated chemistry, and what we would need to test.
> **Summary:** Cement decarbonization depends on disordered, metastable, under-coordinated phases, which are where machine-learned potentials are least reliable. This July 2026 piece sets out where measured model error matters for alternative binders, clinkers and CO₂-cured concrete, and what has been tested so far. A direction, not a result.
> **Updated:** 2026-11-11
> **Status:** Direction
> **Evidence Status:** Direction, not a result. Capability statements below are hypotheses we have not tested on these materials. What we have tested: in Round 4 (July 2026) the raw models missed our barrier gate, our adsorption and lattice/elastic correction tests failed, and the magnetism test abstained; in Round 5 our barrier correction abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models). Literature figures are attributed to their sources. We have not modelled any cement phase.

# Cement, Concrete, and the Weight of the Built World

Concrete is the most widely used manufactured material on Earth. It forms roads, bridges, dams, foundations, and a growing share of the cities where most of humanity now lives. The binder that holds concrete together — ordinary Portland cement (OPC) — is also one of the most carbon-intensive commodities produced. Global cement manufacture emits roughly 2.8 GtCO₂ per year, about 8% of anthropogenic CO₂ emissions[^1][^11]. Unlike steel or ammonia, where renewable hydrogen and electric heating can in principle eliminate most emissions, roughly 60% of cement emissions are process emissions: the calcination of limestone (CaCO₃ → CaO + CO₂) releases CO₂ regardless of the fuel source[^1]. Decarbonizing cement therefore requires new chemistries, not just clean kilns.

![The 2.8-Gigaton Footprint](images/cement-concrete-and-the-weight-of-the-built-world-01-global-footprint.jpg)
*Global cement manufacturing emits about 2.8 GtCO₂ annually, with roughly 60% coming from limestone calcination rather than fuel combustion. Sources: IEA/GCCA 2024; IPCC AR6.*

Cement decarbonization is a materials-discovery problem. The pathways to low-carbon cement — alternative binders, alternative clinkers, and CO₂-cured concrete — all depend on phases that are amorphous, metastable, or multi-component. These are conditions where standard computational methods struggle and where universal machine-learning interatomic potentials (uMLIPs) are reported to soften the potential energy surface[^2]. Measuring that error on cement-relevant phases, and saying which predictions it leaves supported, is where our approach would start. We have not done it yet.

![The Process-Emissions Trap](images/cement-concrete-and-the-weight-of-the-built-world-02-calcination-trap.jpg)
*Clean energy can shrink fuel emissions, but the calcination of limestone releases CO₂ regardless of the heat source. Source: IEA/GCCA 2024.*

## The process-emissions trap

Portland cement is made by heating limestone, clay, and small amounts of iron and aluminum raw materials to about 1,450 °C in a rotary kiln. The product, clinker, is ground with gypsum and often with supplementary cementitious materials (SCMs) such as fly ash or blast-furnace slag. The resulting powder hydrates when mixed with water, forming calcium-silicate-hydrate (C-S-H) gel, the binding phase that gives hardened concrete its strength[^9].

The emissions come from two sources. The first is fuel combustion to reach kiln temperature; this roughly 40% share can be reduced with electrification, biomass, hydrogen, or waste heat, though each option has scaling limits. The second, larger source is the decomposition of calcium carbonate itself. As long as limestone is the primary calcium feedstock, CO₂ is an intrinsic product of the chemistry. The IEA and the Global Cement and Concrete Association estimate that reaching net-zero cement by 2050 will require a combination of energy efficiency, alternative fuels, alternative feedstocks, alternative binders, and post-combustion carbon capture[^1].

![Three Discovery Fronts](images/cement-concrete-and-the-weight-of-the-built-world-06-three-routes.jpg)
*Low-carbon cement routes range from LC³’s 30–50% clinker reduction to CSA clinkers with 20–35% lower process emissions and CO₂-cured systems that sequester 5–25% binder-mass CO₂. Sources: Scrivener et al. 2018; Habert et al. 2020; Skocek et al. 2021; Sanna et al. 2013.*

Alternative binders and clinkers aim to replace or reduce the CaCO₃-derived lime content. Calcined clay combined with limestone (LC³) can cut clinker factors by 30–50% while maintaining performance[^4]. Geopolymers, made from alkali-activated aluminosilicates such as fly ash or slag, avoid Portland chemistry entirely[^5]. Belite-rich or calcium-sulfoaluminate clinkers can be fired at lower temperatures and absorb less limestone-derived CO₂[^6]. CO₂-cured concrete, by contrast, keeps OPC chemistry but replaces part of the hydration pathway with rapid carbonation, turning CO₂ into stable calcium carbonate while gaining early strength[^7]. None of these routes is yet deployable at the scale of ordinary cement, and all of them face materials-science bottlenecks that computation can address — provided the computation is trustworthy.

## Three discovery fronts

### Alternative binders: amorphous networks as the functional phase

![A rotary cement kiln and calciner in side cutaway, with a narrow process-gas duct leading from the calciner to one capture vessel — The capture vessel receives the calcination gas stream through the dedicated duct](images/cement-concrete-and-the-weight-of-the-built-world-inline-01.jpg)

The most promising alternative binders — slag, fly ash, calcined clay, and geopolymers — are not crystalline minerals that can be solved by X-ray diffraction and modeled with a single unit cell. They are glasses, gels, or nanocrystalline assemblages in which reactivity and durability are controlled by the distribution of Si–O, Al–O, and Ca–O bond environments. Blast-furnace slag is a calcium-alumino-silicate glass. Calcined kaolinite (metakaolin) is a layered aluminosilicate whose reactivity depends on the degree of dehydroxylation and disorder. Geopolymer gels are three-dimensional aluminosilicate networks whose stoichiometry and nanoporosity evolve during curing[^5][^12].

These materials are difficult to model with density functional theory (DFT) because DFT is most reliable for well-defined crystalline unit cells with periodic boundary conditions. Amorphous or nanocrystalline models require large supercells and statistical sampling, making DFT prohibitively expensive for screening. uMLIPs are fast enough, but they are trained on bulk equilibrium structures and misrepresent the under-coordinated Si–O and Al–O bonds that dominate dissolution, gelation, and precipitation[^2]. A predicted dissolution rate that is off by a factor of two or three is enough to misrank a binder formulation.

The coordination problem is structural. In a crystalline quartz framework, silicon is tetrahedrally coordinated and oxygen is bridging; the local environment is close to the bulk training distribution. In a partially dissolved slag grain or a nascent geopolymer gel, silicon may be present as Q¹, Q², or Q³ species with one, two, or three bridging oxygens, and aluminum may occupy tetrahedral, pentahedral, or octahedral sites depending on pH and charge compensation. These environments have coordination numbers and bond angles that fall outside the bulk distribution, and uMLIPs systematically soften their energies[^2].

Our hypothesis is that this is a measurable departure rather than an unknowable model failure. On nine fcc metals, an error field anchored to three observables predicted a fourth for three of four models[^3]. Whether anything similar holds for amorphous Si–O and Al–O networks is untested; until it is, dissolution and gelation energetics from fast potentials should be treated as unverified.

![The Metastability Problem](images/cement-concrete-and-the-weight-of-the-built-world-07-metastability.jpg)
*Essential phases such as ettringite and AFm are metastable, so convex-hull thermodynamics alone discards the very materials a low-carbon screen must evaluate. Source: Lupine Science formalization library and repository (https://library.lupine.science, https://github.com/alexwelcing/lupine-rhizo).*

### Alternative clinkers: multi-component oxide spaces

Alternative clinkers replace or supplement alite (C₃S), the dominant and most carbon-intensive phase in OPC, with phases such as belite (C₂S), ye'elimite (C₄A₃Ŝ), or ferrite solid solutions[^10]. Calcium-sulfoaluminate (CSA) clinkers, for example, can be produced at 1,200–1,300 °C rather than 1,450 °C and require less limestone, cutting process emissions by 20–35%[^6]. Belite-rich cements lower the lime saturation factor and can incorporate more SCMs. The challenge is that these clinkers involve multi-component oxide spaces — CaO–SiO₂–Al₂O₃–Fe₂O₃–MgO–SO₃ and beyond — whose phase equilibria, hydration pathways, and impurity sensitivities are far more complex than OPC.

Brute-force DFT exploration of these spaces is economically infeasible. A single clinker composition may require calculations for the anhydrous phase, the hydrated assemblage, the presence of alkalis and sulfates, and the effect of minor elements. The number of candidate compositions grows quickly when dopants, substituents, and processing conditions are included. Fast potentials could screen such spaces, but only once their rankings there have been checked.

The ranking problem is aggravated by metastability. The best-performing clinker/hydrate combinations are often not the equilibrium assemblages predicted by convex-hull thermodynamics. Ettringite, AFm phases, and certain C-S-H compositions are metastable yet functionally essential. Standard computational screens that discard anything above the convex hull therefore discard the most useful phases. A useful screen would have to say which predictions depend on synthesis or curing conditions it cannot bound, and report those as unsupported rather than ranked.

### CO₂-cured concrete: barrier-controlled carbonation

CO₂ curing is conceptually elegant. Instead of emitting CO₂ during calcination and later capturing it, CO₂-cured concrete uses calcium-rich silicates that react directly with CO₂ to form calcium carbonate and silica gel, producing early strength and sequestering carbon in the product. Carbonatable calcium silicate cements and related systems have demonstrated uptake of 5–25% CO₂ by mass of binder, with some formulations gaining compressive strength within hours[^7][^8]. Solidia and similar processes have reached early commercialization in precast concrete, where controlled curing environments are feasible.

The materials challenge is kinetic. Carbonation proceeds through CO₂ dissolution, diffusion through pores and increasingly dense product layers, and reaction at under-coordinated surface sites. As the carbonate layer thickens, CO₂ diffusion becomes rate-limiting. The microstructure and strength of the final product depend on the competition between carbonation depth, carbonate crystal size, and the residual unreacted core. uMLIPs underestimate the barriers for CO₂ insertion and carbonate diffusion at under-coordinated surface sites because those transition states involve reduced coordination relative to bulk carbonate training data[^2].

Carbonate formation and diffusion barriers set the ranking of candidate calcium-silicate compositions. If fast potentials soften those barriers, a composition that appears to carbonate rapidly in a raw screen could be a false positive, and one that looks sluggish could have been penalized by the same error. Measuring those barrier errors would come before any attempt to correct them; on Li-ion migration, the raw models missed our barrier gate (Round 4) and our barrier correction abstained for all four models (Round 5).

## Why computation fails, and how it can succeed

The likely failure across all three fronts is the defect/bulk asymmetry this series starts from. uMLIPs are trained mostly on equilibrium bulk configurations in which atoms have high, regular coordination numbers. The functional environments in cement — dissolved silicate species, gel pores, hydrate interfaces, and carbonation fronts — have coordination numbers and chemistries outside that training distribution. Deng et al. document a systematic softening of the potential energy surface in universal MLIPs trained on MPtrj, with energies and forces under-predicted away from equilibrium[^2]. In our own benchmark of four uMLIPs on 21 mostly metallic materials, defect-family observables (surfaces, vacancies, stacking faults) erred 15–60 times more than bulk observables; whether the same holds at the silicate chains, gel pores and carbonation fronts discussed here is untested.

![A concrete batching bay where a calcined-clay hopper feeds one mixer, which pours a single beam mold positioned beneath a load frame — The calcined-clay blend moves from hopper through mixer into a structural test beam](images/cement-concrete-and-the-weight-of-the-built-world-inline-02.jpg)

Rank order matters here: a dissolution-energy error of a few percent could invert the ranking of two binder formulations and send experiments to the wrong candidate. That is why measuring the error, and whether rankings survive it, would come first.

## The line between prediction and promise

Computational materials discovery has a credibility problem. Large-scale crystal-structure predictions have produced millions of candidate materials, but independent synthesis has confirmed only a small fraction: GNoME reported 380,000 computed-stable structures, of which 736 had been independently synthesized by late 2023 (Merchant et al., Nature 624, 80–85, 2023). For cement, the problem is worse because the most interesting phases are not even on the convex hull. A screen that reports only equilibrium stability is not merely incomplete; it can be actively misleading.

Any screen we ran here would need to separate three classes of claim: (1) predictions inside a domain where the model's error has been measured, such as relative dissolution energies of chemically similar slag compositions; (2) predictions bounded by explicit uncertainty, such as hydrate assemblages that depend on curing temperature and humidity; and (3) claims that are synthesis-dependent and cannot be supported by the model at all. Lean can check the arithmetic and stated inequalities behind such a classification; it does not check the physics, the reference data or the pipeline.

## What we have tested so far

We have not modelled any cement phase. The capability described above is a hypothesis. These are the results that bear on it:

- **Barriers.** In Round 4 (July 2026), MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV gate on 30 Li-ion migration paths (MAE 135.0–242.5 meV on completed paths). In Round 5 a direction-gated barrier correction abstained for all four models, so none was applied. See [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/) and [the Z1 barrier panel](/articles/the-materials-we-test-against/).
- **Adsorption.** Every selected Δ-correction made catalyst-adsorption holdout error worse ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).
- **Surfaces of fcc metals.** For nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models). Used as an energy-only correction beside CHGNet, it improved one facet on two metals ([the fcc error field](/articles/a-smooth-environment-resolved-error-field/)).
- **Lean checks** cover the arithmetic and stated inequalities behind published numbers; they do not check the physics, the reference data or the pipeline.

If you measure binders, clinkers or carbonation and want to test whether these models can be trusted on your systems, we would like to hear from you; our record and methods are open.

## Where this is aimed

Cement is often treated as a special case — a commodity so cheap, so established, and so geographically fragmented that innovation moves slowly. The materials that could decarbonize it are amorphous oxides, metastable hydrates, carbonated silicates, and multi-component clinkers, and their hard parts are the same as elsewhere: under-coordinated environments dominate function, composition spaces are too large for DFT, and metastable phases outperform equilibrium ones.

![A full-scale concrete beam in a four-point load frame, with one enlarged cutaway window showing the binder-to-aggregate interface beneath the loading nose — The load frame tests whether the material interface transfers force without separating](images/cement-concrete-and-the-weight-of-the-built-world-inline-03.jpg)

The seven target areas of the environmental-expansion series — water, air, methane, refrigerants, critical minerals, PFAS and cement — point the same way: the bottleneck is less a shortage of candidate materials than a shortage of predictions whose errors are known. Cement, at about 2.8 GtCO₂ per year by the IEA and GCCA estimate cited above, is one of the hardest and largest places to measure them.

![An unoccupied construction-material sorting bay with a conveyor separating reclaimed aggregate into a clean hopper feeding one precast panel mold — Reclaimed aggregate is graded and returned to a new precast panel](images/cement-concrete-and-the-weight-of-the-built-world-spread.jpg)
## Footnotes

[^1]: International Energy Agency and Global Cement and Concrete Association, *Cement Technology Roadmap 2024 — Routes to Net Zero*, IEA, 2024.

[^2]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025). https://doi.org/10.1038/s41524-024-01500-6

[^3]: Lupine Science, [the fcc error-field results note](/articles/a-smooth-environment-resolved-error-field/) and [Round 4 results](/articles/four-gates-three-honest-failures-one-live-experiment/).

[^4]: K. Scrivener *et al.*, "Calcined clay limestone cements (LC3)," *Cement and Concrete Research* **114**, 49–56 (2018). https://doi.org/10.1016/j.cemconres.2017.09.003

[^5]: J. Provis and J. van Deventer, *Geopolymers: Structures, Processing, Properties and Industrial Applications*, Woodhead Publishing, 2009.

[^6]: G. Habert *et al.*, "Environmental impacts and decarbonization strategies in the cement and concrete industries," *Nature Reviews Earth & Environment* **1**, 559–573 (2020). https://doi.org/10.1038/s43017-020-0093-3

[^7]: J. Skocek, M. Zajac, and M. Ben Haha, "Carbonation of cement paste: Understanding, challenges, and opportunities," *Cement and Concrete Research* **149**, 106557 (2021). https://doi.org/10.1016/j.cemconres.2021.106557

[^8]: A. Sanna *et al.*, "Accelerated carbonation of Portland limestone cement," *Construction and Building Materials* **49**, 73–80 (2013). https://doi.org/10.1016/j.conbuildmat.2013.07.075

[^9]: R. Pellenq *et al.*, "A realistic molecular model of cement hydrates," *Proceedings of the National Academy of Sciences* **106**, 16102–16107 (2009). https://doi.org/10.1073/pnas.0902180106

[^10]: J. Thomas *et al.*, "Belite-based low-carbon clinkers: A review," *Journal of Cleaner Production* **376**, 134362 (2022). https://doi.org/10.1016/j.jclepro.2022.134362

[^11]: IPCC, *Climate Change 2021: The Physical Science Basis*, Contribution of Working Group I to the Sixth Assessment Report, Cambridge University Press, 2021.

[^12]: M. Juenger *et al.*, "Supplementary cementitious materials: New sources," *Cement and Concrete Research* **122**, 257–270 (2019). https://doi.org/10.1016/j.cemconres.2019.05.008
