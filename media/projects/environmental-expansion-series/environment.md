# Lupine Science Strategic Source Document: Environmental Targets Beyond CO₂

Computational materials discovery for water, air quality, methane, refrigerants, critical-mineral recycling, PFAS remediation, and low-carbon cement.

---

## 1. Introduction: The Same Error Geometry, New Planetary Boundaries

Lupine Science's correction-and-verification method was developed for climate-critical materials: cobalt-free cathodes, halide solid electrolytes, MOFs for direct air capture, ammonia catalysts, and lead-free perovskites. In every case the bottleneck is the same: universal machine-learning interatomic potentials (uMLIPs) are trained on bulk, equilibrium configurations, but functional performance is controlled by under-coordinated environments — surfaces, vacancies, transition states, defects — where uMLIPs systematically soften the potential energy surface by 15–60%.

The same defect/bulk asymmetry corrupts predictions across environmental materials. Water desalination membranes, methane-oxidation catalysts, refrigerant fluids, ion-selective sorbents for lithium recovery, defluorination catalysts for PFAS, and alternative cement clinkers all involve non-equilibrium coordination environments, multi-component composition spaces, and metastable phases. The climate series showed that Lupine's environment error field corrects these errors at uMLIP speed and verifies claims with machine-checked proof. This document maps that capability onto environmental concerns beyond CO₂.

### Shared failure modes

| Failure mode | Environmental consequence | Lupine response |
|---|---|---|
| **Defect/bulk asymmetry** | Membrane selectivity, catalytic barriers, and sorbent binding are dominated by under-coordinated sites; uMLIPs predict them too stable. | Environment error field measured on anchor observables; additive correction with analytic forces. |
| **Combinatorial wall** | Multi-component spaces (MOFs, alloys, oxides, clinkers) exceed brute-force DFT budgets. | Corrected uMLIPs run at ~10⁻⁴ s/atom/step, enabling 10⁵–10⁶ candidate screens. |
| **Metastability** | Functional materials are often kinetically trapped (hydrated membranes, amorphous clinkers, metastable catalyst phases); convex-hull screening discards them. | Provable boundaries separate supported predictions from synthesis-dependent phases. |
| **Ranking inversion** | Error-induced reordering sends experiments to suboptimal candidates and buries the best ones. | Smooth field preserves rank order across chemically similar compositions. |

### Impact framing

Quantified impact in this document is deliberately conservative. Where possible we cite peer-reviewed or authoritative estimates; where market or impact numbers are speculative, we give ranges and the assumptions behind them. The goal is not to claim Lupine will solve any of these problems alone, but to show that each target is (a) materials-limited, (b) computationally addressable by corrected uMLIPs, and (c) large enough to justify a focused discovery campaign.

---

## 2. Water: Desalination, Atmospheric Harvesting, and Ion-Selective MOFs

### 2.1 Discovery targets

| Target | Metric | Current best | Lupine mechanism |
|---|---|---|---|
| Reverse-osmosis (RO) membrane active layer | >99.5% NaCl rejection, >2× current permeability, chlorine tolerance | Polyamide thin-film composites: ~99.5% rejection, permeability ~10 L m⁻² h⁻¹ bar⁻¹ | Corrected binding and diffusion barriers in nanoporous polymer frameworks |
| Atmospheric water harvesting (AWH) sorbent | >0.3 g g⁻¹ day⁻¹ at 20% RH, >10,000 cycles | MOF-808 with LiCl: ~0.25 g g⁻¹ at 20% RH; cycle life limited by pore collapse/hydrolysis | Corrected hydrolysis and framework-collapse barriers; humidity-stable linker design |
| Ion-selective MOF for brine Li⁺/Mg²⁺ separation | Li⁺/Mg²⁺ selectivity >100, Li⁺ permeance >10⁻⁶ mol m⁻² s⁻¹ | Crown-ether membranes and λ-MnO₂: selectivity 10–50 | Corrected guest-host binding and window-gate energetics for selective Li⁺ transport |

### 2.2 Scientific and commercial context

Water scarcity affects roughly 2 billion people, and the UN projects a 40% global freshwater deficit by 2030 under business-as-usual. Seawater desalination produces ~97 million m³/day globally, but energy consumption remains 3–4 kWh/m³ for RO, and membrane fouling/chlorine sensitivity dominate operating cost. Atmospheric water harvesting is attractive for off-grid and drought-resilient supply; the global atmospheric water generator market is projected at ~$9 billion by 2030.

Lithium recovery from brine is critical to battery supply chains. Conventional evaporation ponds recover only 30–50% of Li over 12–24 months and consume enormous water volumes. Direct lithium extraction (DLE) aims to raise recovery to >80% and reduce time to hours, but selective sorbents and membranes are materials-limited.

### 2.3 Key barriers

**Membrane selectivity versus permeability.** The active layer of a polyamide RO membrane contains a distribution of nanopores with charged, under-coordinated functional groups. uMLIPs trained on bulk polymers cannot accurately predict the binding free energy of Na⁺, Cl⁻, and water in these confined environments, leading to wrong pore-size and charge-density rankings.

**AWH sorbent degradation.** Water sorption/desorption cycles induce hydrolysis of metal-linker bonds (in MOFs) or collapse of amorphous salt-in-pore structures. The transition states involve under-coordinated metal centers (c = 4–7) where uMLIPs underestimate barrier heights by 15–60%, as documented in the climate series for MOF hydrolysis.

**Li⁺/Mg²⁺ selectivity.** Divalent Mg²⁺ binds more strongly than monovalent Li⁺ to most oxygen/nitrogen sites, so selective transport requires size-sieving windows or weak-field binding pockets with precise coordination. uMLIPs misrank candidates because guest-ion binding energies in window sites fall outside the bulk training distribution.

### 2.4 How corrected uMLIPs help

- **Corrected binding energies.** For RO membranes and AWH sorbents, the error field recovers accurate Na⁺/Cl⁻/H₂O binding energies in under-coordinated pore environments, preserving the selectivity–permeability ranking.
- **Hydrolysis barriers.** The same correction that filters humidity-stable DAC MOFs applies to AWH MOFs: corrected metal-linker dissociation energies predict cycle life.
- **Ion-selective window gating.** Corrected Li⁺ and Mg²⁺ migration barriers through MOF windows or 2D membrane pores identify selective diffusion pathways that raw uMLIPs misrank.

### 2.5 Quantified impact (defensible ranges)

| Outcome | Estimate | Source / assumption |
|---|---|---|
| Global desalination capacity | ~97 million m³/day (2023) | IDA global desalination inventory |
| Energy savings from next-gen membranes | 0.5–1.0 kWh/m³ reduction | 20–30% of current RO energy |
| Atmospheric water generator market | ~$9B by 2030 | Industry market reports |
| Global lithium demand | 2.4 Mt LCE by 2030 | IEA Global EV Outlook / Benchmark Mineral Intelligence |
| Brine Li recovery improvement | 30–50% → 80%+ with selective sorbents | DLE technology reviews |

---

## 3. Air Quality and Pollution: Catalytic NOx Reduction, Particulate Capture, and VOC Oxidation

### 3.1 Discovery targets

| Target | Metric | Current best | Lupine mechanism |
|---|---|---|---|
| Low-temperature NH₃-SCR catalyst | >90% NOx conversion at <150 °C, H₂O/SO₂ durable | Cu-SSZ-13 works above ~200 °C; cold-start emissions dominate real driving | Corrected adsorption and redox energetics on exchanged cations |
| Diesel/gasoline particulate filter | <10 nm particle penetration, low backpressure, regeneration <500 °C | Silicon carbide cordierite filters; regeneration energy penalty 3–7% | Corrected soot-oxidation barriers on catalyzed channel walls |
| VOC oxidation catalyst | >95% conversion of formaldehyde/benzene at <100 °C | Pt/Pd supported oxides require >150 °C for many VOCs | Corrected C–H/O₂ activation barriers on single-atom and alloy sites |

### 3.2 Scientific and commercial context

Outdoor air pollution causes an estimated 4–7 million premature deaths annually, with NOx, particulate matter (PM₂.₅), and volatile organic compounds (VOCs) as the leading contributors. Transportation is the dominant source of NOx in urban areas, and cold-start emissions — before the exhaust catalyst reaches light-off temperature — can account for 50–80% of total trip emissions. The global automotive catalysis market exceeds $20 billion annually.

Particulate filters are mandatory for diesel vehicles and increasingly for gasoline direct-injection engines. Regeneration frequency and fuel penalty remain significant. Indoor VOC oxidation, particularly formaldehyde, is a growing market for building materials and consumer air purifiers.

### 3.3 Key barriers

**Low-temperature activity.** NH₃-SCR, soot oxidation, and VOC oxidation are limited by activation barriers for N–O bond cleavage, C–H bond activation, and O₂ activation at under-coordinated metal sites. uMLIPs systematically underestimate these barriers because the transition states involve reduced coordination (c = 4–8) relative to bulk oxide training data.

**Poisoning and hydrothermal aging.** Automotive catalysts operate in atmospheres containing H₂O, SO₂, and hydrocarbons. Dopants that improve poisoning resistance are typically discovered by trial and error because computational ranking of dopant segregation, acidity, and redox energetics is unreliable.

**Active-site heterogeneity.** Zeolite exchanged cations, single-atom sites, and supported alloy clusters are structurally heterogeneous. A screening campaign must rank thousands of active-site configurations; DFT is too slow and raw uMLIPs are too inaccurate.

### 3.4 How corrected uMLIPs help

- **Corrected activation barriers.** For NOx SCR and VOC oxidation, corrected N–O, C–H, and O=O dissociation barriers on under-coordinated active sites filter out false-positive catalysts.
- **Dopant ranking.** Corrected segregation and vacancy formation energies identify promoters (e.g., Ce, Zr, rare earths) that stabilize active sites against hydrothermal aging and sulfur poisoning.
- **Single-atom site screening.** Corrected metal-support binding energies prevent overbinding or underbinding of single-atom catalysts, a common failure mode in raw uMLIP screening.

### 3.5 Quantified impact (defensible ranges)

| Outcome | Estimate | Source / assumption |
|---|---|---|
| Annual premature deaths from outdoor air pollution | 4–7 million | WHO, State of Global Air |
| Transportation share of NOx emissions | ~50–80% in urban areas | EPA, EEA inventories |
| Cold-start share of trip NOx | 50–80% | Automotive emissions literature |
| Global automotive catalyst market | >$20B/year | Industry market reports |
| Potential NOx/VOC reduction from low-T catalysts | 20–40% of remaining tailpipe emissions | Engineering estimates |

---

## 4. Methane: Catalysts for Methane-to-Methanol and Methane Pyrolysis

### 4.1 Discovery targets

| Target | Metric | Current best | Lupine mechanism |
|---|---|---|---|
| Direct methane-to-methanol catalyst | >10% single-pass conversion, >90% selectivity at <250 °C | Industrial indirect route via syngas; direct routes <5% conversion at ambient | Corrected C–H activation and O-insertion barriers on single-metal and cluster sites |
| Methane pyrolysis catalyst | >90% conversion, >95% H₂ selectivity at <800 °C, carbon byproduct usable | Conventional thermal pyrolysis requires >1000 °C | Corrected C–H bond activation and carbon diffusion barriers on molten-metal / alloy catalysts |

### 4.2 Scientific and commercial context

Methane is responsible for roughly 30% of current global warming. Over a 20-year horizon, its global warming potential is ~80–85× that of CO₂. Anthropogenic sources include agriculture (livestock, rice), waste (landfills), and fossil fuel production (venting, fugitive emissions). Cutting methane emissions 30% by 2030 — the Global Methane Pledge target — could avoid ~0.3 °C of warming by 2040.

Catalysts that convert methane to methanol at low temperature would eliminate the energy-intensive syngas step and enable distributed valorization of stranded biogas and landfill gas. Methane pyrolysis produces turquoise hydrogen and solid carbon; if the carbon is sequestered or used as a durable material, the process can be near-zero-emission.

### 4.3 Key barriers

**The methane activation problem.** The C–H bond in CH₄ is exceptionally strong (~439 kJ/mol). Most catalysts that activate methane at low temperature also over-oxidize the products to CO₂, or require expensive oxidants. The selectivity challenge is a classic scaling-relation problem: sites that bind CHₓ intermediates strongly enough to activate methane also bind oxygenates too strongly, leading to over-oxidation.

**Methane pyrolysis temperature.** Thermal pyrolysis is feasible but energy-intensive. Molten-metal catalysts (Ni, Cu, Sn alloys) can reduce temperatures, but carbon solubility, diffusion, and nucleation on metal surfaces are defect-mediated processes that uMLIPs mispredict.

**Coking and stability.** Both routes suffer from carbon deposition that deactivates catalysts. Accurate carbon diffusion and nucleation barriers require correct treatment of under-coordinated metal-carbon configurations.

### 4.4 How corrected uMLIPs help

- **Corrected C–H activation barriers.** The field recovers accurate barriers for CH₄ dissociation on under-coordinated metal sites, preventing false-positive low-temperature catalysts.
- **Scaling-relation breaking.** As with ammonia catalysts, selective field failure flags unusual electronic structures — single-atom alloy sites, confined cluster sites — that may break the CH₄/CH₃OH scaling relation, directing expensive ab initio work to the most promising candidates.
- **Carbon diffusion and nucleation.** Corrected metal-carbon binding and diffusion barriers rank alloy compositions for pyrolysis by coking resistance and carbon quality.

### 4.5 Quantified impact (defensible ranges)

| Outcome | Estimate | Source / assumption |
|---|---|---|
| Anthropogenic methane emissions | ~360 Mt CH₄/year (~10 GtCO₂e at 20-yr GWP) | IPCC AR6 / Global Carbon Project |
| Global Methane Pledge target | 30% reduction by 2030 | COP26 pledge (150+ countries) |
| Avoided warming from 30% cut | ~0.3 °C by 2040 | UNEP Global Methane Assessment |
| Global methanol market | ~$40B/year; ~110 Mt/year production | Methanol Institute |
| Methane-to-methanol energy savings vs. syngas | 20–30% of route energy | Process engineering estimates |

---

## 5. Refrigerants and Low-GWP Heat-Transfer Fluids

### 5.1 Discovery targets

| Target | Metric | Current best | Lupine mechanism |
|---|---|---|---|
| Fluorine-free vapor-compression refrigerant | GWP < 10, COP within 10% of R-410A, non-flammable or mildly flammable (ASHRAE A2L) | R-32 (GWP 675), R-1234yf (GWP < 1 but patents, decomposition concerns) | Corrected intermolecular potentials for vapor pressure, heat capacity, and flammability screening |
| Solid-state refrigerant (caloric material) | ΔS > 10 J kg⁻¹ K⁻¹, hysteresis < 2 K, operating near room temperature | Magnetocaloric, electrocaloric, elastocaloric prototypes; few materials near market | Corrected phase-transition energetics and hysteresis in multi-component alloys/oxides |

### 5.2 Scientific and commercial context

Hydrofluorocarbon (HFC) refrigerants are potent greenhouse gases. The Kigali Amendment to the Montreal Protocol aims to reduce HFC consumption 80% by 2047, avoiding up to 0.5 °C of warming by 2100. The global HVAC refrigerant market is ~$20 billion annually. Low-GWP alternatives include hydrofluoroolefins (HFOs), natural refrigerants (CO₂, ammonia, hydrocarbons), and fluorine-free synthetics.

Solid-state refrigeration — magnetocaloric, electrocaloric, and elastocaloric effects — eliminates refrigerants entirely but requires materials with large entropy changes near room temperature and low hysteresis. The materials discovery problem is similar to battery cathodes: multi-component composition spaces, metastable phases, and property rankings corrupted by defect/bulk asymmetry.

### 5.3 Key barriers

**Fluorine-free fluids with the right thermophysical properties.** Replacing fluorinated molecules requires matching vapor pressure curves, critical temperature, heat of vaporization, and solubility with lubricants. Candidate molecules number in the millions; brute-force experimental screening is impractical.

**Flammability and toxicity constraints.** ASHRAE safety classifications (A1, A2L, B2, etc.) constrain molecular design. Accurate prediction of combustion chemistry and decomposition pathways requires bond-dissociation energies in radical transition states — precisely the under-coordinated environments where uMLIPs fail.

**Caloric material hysteresis.** First-order phase transitions in magnetocaloric alloys produce large entropy changes but also hysteresis losses. The energy landscape near the transition involves metastable phases and twin boundaries; uMLIPs soften these barriers and misrank hysteresis.

### 5.4 How corrected uMLIPs help

- **Corrected intermolecular potentials.** For refrigerant fluids, corrected atomistic potentials predict vapor pressure, latent heat, and transport properties more accurately than generic force fields, filtering millions of candidate molecules.
- **Bond-dissociation and radical barriers.** Corrected C–H and C–F bond dissociation energies in radical transition states improve flammability and atmospheric-lifetime predictions.
- **Phase-transition and hysteresis screening.** For caloric materials, corrected transition-state and twin-boundary energies rank candidates by entropy change and hysteresis, preserving metastable-phase candidates that convex-hull screening would discard.

### 5.5 Quantified impact (defensible ranges)

| Outcome | Estimate | Source / assumption |
|---|---|---|
| Kigali Amendment avoided warming | Up to 0.5 °C by 2100 | UNEP / US EPA |
| Global HVAC refrigerant market | ~$20B/year | Industry market reports |
| HFC emissions (CO₂e) | ~1 GtCO₂e/year (rising to 5–9 Gt without controls) | Velders et al., PNAS |
| Solid-state refrigeration efficiency potential | 20–50% efficiency improvement over vapor compression | DOE / ARPA-E estimates |

---

## 6. Critical Minerals and Recycling: Li/Co/Ni Recovery, Urban Mining, and Solvent Extraction

### 6.1 Discovery targets

| Target | Metric | Current best | Lupine mechanism |
|---|---|---|---|
| Selective Li⁺ sorbent from spent batteries/brine | >95% Li recovery, >99% purity, <1 hour contact time | λ-MnO₂, LMO spinels, and Al-based layered oxides: 80–95% recovery, variable selectivity | Corrected insertion and site-selectivity energies for Li⁺ vs. Na⁺/K⁺/Mg²⁺ |
| Co/Ni separation solvent / extractant | Separation factor βCo/Ni > 100, single-stage efficiency >90% | Cyanex 272 and analogous phosphinic acids; multi-stage extraction required | Corrected metal-ligand binding free energies and extraction complex geometries |
| Urban-mining leach additive | >95% metal recovery at pH 1–3, selective over Fe/Al | Inorganic acids; high reagent consumption and Fe/Al co-dissolution | Corrected dissolution and complexation barriers for targeted metal oxides |

### 6.2 Scientific and commercial context

The energy transition is mineral-intensive. The IEA projects that clean-energy technologies will drive a 4–6× increase in mineral demand by 2040. Cobalt, nickel, and lithium are supply-constrained and geographically concentrated; recycling and alternative extraction are essential to supply security. The global battery recycling market is projected at $35–50 billion by 2030.

Current recycling flowsheets rely on pyrometallurgy or hydrometallurgy with significant reagent consumption and waste generation. Direct recycling — restoring cathode crystal structure without full element separation — could reduce energy use 50–80%, but requires precise control of re-lithiation and dopant redistribution.

### 6.3 Key barriers

**Selectivity in mixed-ion systems.** Spent battery leachate and geothermal/brine streams contain Li⁺, Co²⁺/³⁺, Ni²⁺, Mn²⁺/⁴⁺, Fe³⁺, Al³⁺, and Mg²⁺ in ratios that vary by source. Selective sorbents and extractants must discriminate ions with similar size and charge; uMLIPs misrank binding energies in the flexible, under-coordinated coordination environments of sorbent pores and organic extractant pockets.

**Phase reconstruction during direct recycling.** Restoring layered oxide cathodes from degraded particles involves Li⁺ re-insertion, transition-metal reordering, and oxygen-vacancy healing. These are the same defect-mediated processes that limit LMR cathode screening; uMLIPs underestimate migration and vacancy energies.

**Solvent/extractant stability.** Organic extractants degrade through hydrolysis and oxidation at phase boundaries. Predicting degradation pathways requires accurate transition-state energies for bond breaking in polar environments.

### 6.4 How corrected uMLIPs help

- **Corrected ion-insertion energies.** The same correction that ranks battery cathode compositions applies to selective sorbents: corrected Li⁺/Na⁺/Mg²⁺ site energies identify high-selectivity frameworks.
- **Metal-ligand binding.** Corrected Co²⁺/³⁺ and Ni²⁺ binding energies in phosphinic acid, amine, and hydroxamic acid extractants predict separation factors without empirical fitting.
- **Direct-recycling reconstruction.** Corrected Li⁺ migration and oxygen-vacancy formation energies in degraded cathode powders guide re-lithiation conditions and additive selection.

### 6.5 Quantified impact (defensible ranges)

| Outcome | Estimate | Source / assumption |
|---|---|---|
| Clean-energy mineral demand growth by 2040 | 4–6× | IEA The Role of Critical Minerals in Clean Energy Transitions |
| Global battery recycling market | $35–50B by 2030 | Industry and analyst estimates |
| Cobalt mine production concentration (DRC) | ~70% | USGS / Benchmark Mineral Intelligence |
| Direct-recycling energy reduction vs. pyrometallurgy | 50–80% | Recellular / ReCell Center estimates |
| Li recovery from brine improvement target | 30–50% → 80%+ | DLE technology reviews |

---

## 7. PFAS and Forever Chemicals: Sorbents and Defluorination Catalysts

### 7.1 Discovery targets

| Target | Metric | Current best | Lupine mechanism |
|---|---|---|---|
| PFAS-selective sorbent | >95% removal of PFOA/PFOS at ng/L levels, regenerable >100 cycles | Activated carbon and ion-exchange resins; limited selectivity and disposal cost | Corrected fluorocarbon binding and pore-confinement energies in MOFs / porous polymers |
| Catalytic defluorination catalyst | >90% mineralization of C–F bonds at <200 °C, H₂ or reductant-efficient | No commercial catalytic route; incineration and plasma are energy-intensive | Corrected C–F activation and metal-fluoride thermodynamics on alloy and single-atom sites |

### 7.2 Scientific and commercial context

Per- and polyfluoroalkyl substances (PFAS) are persistent, bioaccumulative, and toxic at trace levels. The US EPA has set maximum contaminant levels of 4 ng/L for PFOA and PFOS in drinking water. Treatment costs for PFAS-contaminated water can reach $1–5 million per site annually. The global PFAS remediation market is projected at $5–10 billion by 2030.

Current treatment — activated carbon, ion exchange, reverse osmosis — concentrates PFAS but does not destroy it. Destruction requires incineration at >1000 °C or emerging technologies such as hydrothermal processing, plasma, or catalytic defluorination. A room-temperature catalytic defluorination route would be transformative.

### 7.3 Key barriers

**C–F bond strength.** The C–F bond is one of the strongest in organic chemistry (~485 kJ/mol). Catalytic cleavage requires highly active metal sites that also resist fluoride poisoning. uMLIPs underestimate C–F activation barriers at under-coordinated metal sites and misrank metal-fluoride formation energies.

**Selective sorption at ng/L.** At environmental concentrations, PFAS compete with natural organic matter and common ions for binding sites. Selective sorbents need hydrophobic pockets of precise size and fluorophilic interactions that computational screening must rank accurately.

**Catalyst stability under fluorination.** Metal catalysts convert to stable metal fluorides during defluorination, deactivating the site. Predicting fluoride formation free energies and regeneration pathways requires accurate defect and surface energetics.

### 7.4 How corrected uMLIPs help

- **Corrected C–F activation barriers.** The field recovers accurate barriers for C–F bond cleavage on under-coordinated metal sites, filtering false-positive defluorination catalysts.
- **Fluoride thermodynamics.** Corrected metal-fluoride binding energies predict catalyst poisoning and identify alloys or oxides that resist fluorination.
- **Sorbent selectivity.** Corrected host-guest binding energies in fluorophilic pores rank MOFs and porous polymers for PFOA/PFOS selectivity over competing ions and organics.

### 7.5 Quantified impact (defensible ranges)

| Outcome | Estimate | Source / assumption |
|---|---|---|
| PFAS contamination sites in the US | >80,000 | EPA / EWG mapping |
| PFAS remediation market | $5–10B by 2030 | Industry analyst estimates |
| US drinking-water MCL for PFOA/PFOS | 4 ng/L | US EPA, 2024 |
| C–F bond dissociation energy | ~485 kJ/mol | Organic chemistry reference data |
| Potential cost reduction from catalytic destruction | 50–80% vs. incineration | Engineering estimates |

---

## 8. Cement and Concrete: Low-CO₂ Binders, Alternative Clinkers, and CO₂-Cured Concrete

### 8.1 Discovery targets

| Target | Metric | Current best | Lupine mechanism |
|---|---|---|---|
| Low-CO₂ Portland alternative | <50% process emissions vs. OPC, compressive strength >30 MPa at 28 d | Slag/fly-ash blends, calcined clays (LC³), geopolymer binders; variable supply and performance | Corrected dissolution/precipitation energetics and amorphous phase stability |
| Alternative clinker phase | <400 kg CO₂/t clinker, reactive at <1300 °C | Belite-rich and calcium sulfoaluminate clinkers; limited scale | Corrected formation and hydration energetics across multi-component oxide spaces |
| CO₂-cured concrete binder | >20% CO₂ uptake by mass, strength gain within 24 h | Carbonatable calcium silicate cements; early-stage commercialization | Corrected carbonate formation and diffusion barriers in hydrated phases |

### 8.2 Scientific and commercial context

Cement production is responsible for ~8% of global CO₂ emissions, roughly 2.8 GtCO₂/year. Approximately 60% of these emissions are process emissions from calcination of limestone (CaCO₃ → CaO + CO₂), which cannot be eliminated by renewable energy alone. The remaining 40% are energy-related emissions from kiln firing.

Approaches to decarbonize cement include alternative feedstocks, alternative clinkers, supplementary cementitious materials, and CO₂ curing or mineralization. The materials challenge is that many promising binders are amorphous, metastable, or multi-component, making their reactivity and durability hard to predict.

### 8.3 Key barriers

**Amorphous and metastable phases.** Blast-furnace slag, fly ash, calcined clay, and geopolymers form amorphous or nanocrystalline hydrated phases. Standard DFT works best for crystalline materials; uMLIPs are fast but mispredict the energetics of disordered, under-coordinated networks.

**Hydration kinetics and phase assemblages.** The strength and durability of cement depend on the sequence of hydrate phases that precipitate during curing. These are kinetic, not equilibrium, products. Convex-hull thermodynamics discards the metastable phases that often perform best.

**CO₂-curing reaction pathways.** CO₂-cured cements rely on rapid carbonation of calcium silicates. The reaction fronts involve carbonate formation at under-coordinated surface sites and CO₂ diffusion through increasingly dense product layers — processes where uMLIPs underestimate barriers.

### 8.4 How corrected uMLIPs help

- **Amorphous network energetics.** Corrected Si–O and Al–O bond energies in under-coordinated glassy and gel networks predict reactivity and dissolution rates of slag, fly ash, and calcined clay.
- **Metastable hydrate screening.** Provable boundaries separate supported predictions from synthesis-dependent metastable phases, directing experiments toward the most promising clinker/hydrate combinations.
- **Carbonation barriers.** Corrected CO₂ insertion and carbonate diffusion barriers rank candidate calcium-silicate compositions for CO₂-cured concrete.

### 8.5 Quantified impact (defensible ranges)

| Outcome | Estimate | Source / assumption |
|---|---|---|
| Cement sector CO₂ emissions | ~2.8 GtCO₂/year (~8% of global) | IEA / Global Cement and Concrete Association |
| Process emissions share | ~60% of cement emissions | IEA Cement Technology Roadmap |
| Alternative binder emission reduction potential | 30–80% vs. OPC | Literature range for slag, LC³, CSA, geopolymer |
| Global cement market | ~$350B/year; ~4.1 Gt production | Industry data |
| CO₂-cured concrete uptake potential | 0.1–0.5 GtCO₂/year by 2050 | Solidia / mineralization literature estimates |

---

## 9. Synthesis: A Common Correction Layer for Environmental Materials

The seven areas in this document share the same computational pathology and the same Lupine response:

1. **Under-coordinated environments dominate function.** Membrane pores, catalyst active sites, sorbent binding pockets, ion-insertion sites, and amorphous networks all involve local coordination far from bulk training data.
2. **Multi-component spaces are too large for DFT.** Whether the space is MOF linkers, alloy catalysts, refrigerant molecules, or clinker oxides, brute-force DFT screening is economically infeasible.
3. **Metastable phases are often the best performers.** Kinetically trapped perovskites, hydrated cements, carbonated silicates, and caloric alloys are discarded by equilibrium screening.
4. **Ranking inversion wastes experiments.** Systematic errors reorder candidates, sending synthesis teams to false priorities and burying true breakthroughs.

Lupine's environment error field addresses (1) and (4) by measuring and correcting systematic error over local environments. Its speed addresses (2). Its formal verification addresses (3) by proving which predictions are supported and which are synthesis-dependent.

The combined addressable impact of the targets in this document is comparable to the climate series: water and air quality affect billions of people; methane and refrigerants together could avoid ~0.5–1 °C of warming; critical-mineral recycling and PFAS remediation address trillion-dollar supply-chain and public-health risks; cement decarbonization is a 2.8 GtCO₂/year problem. A single correction layer that improves discovery reliability across all of them is the platform thesis.

---

## 10. Footnotes and Sources

[^1]: IEA, *Global EV Outlook* and *World Energy Outlook*; batteries linked to ~20% of required 2030 CO₂ reductions and indirectly to another 40%.
[^2]: Google DeepMind GNoME: 2.2 million crystals predicted, 380,000 computed stable, 736 independently synthesized by late 2023. See *Lupine Science Strategic Discovery Plan*, Section 2.1.
[^3]: A-Lab autonomous synthesis: 63% reported success, but subsequent critique found two-thirds of "novel" targets were known disordered phases. See *Lupine Science Strategic Discovery Plan*, Section 2.1.
[^4]: Lupine environment error field: blind prediction r = 0.906 (p = 10⁻⁴, 95% CI [0.82, 0.96]) across 36 (model, material) combinations; 77 build-locked Lean 4 theorems. See *Lupine Science Strategic Discovery Plan*, Section 3.
[^5]: IDA Global Desalination Inventory; UNESCO / UN Water scarcity estimates.
[^6]: WHO, *State of Global Air*; EPA and EEA NOx inventories.
[^7]: IPCC AR6 and Global Carbon Project methane budgets; UNEP Global Methane Assessment.
[^8]: Kigali Amendment impact estimates: Velders et al., PNAS; UNEP / US EPA.
[^9]: IEA, *The Role of Critical Minerals in Clean Energy Transitions*.
[^10]: US EPA PFAS MCLs and contamination mapping; EWG PFAS tracking.
[^11]: IEA Cement Technology Roadmap; Global Cement and Concrete Association.
