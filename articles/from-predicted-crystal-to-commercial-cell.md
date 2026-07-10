> **Type:** article
> **Date:** 2026-07-09
> **Scope:** How Lupine Science turns computational predictions into commercial climate materials through a sequenced partner chain.
> **Description:** A rigorous, partner-by-partner map from predicted crystal to commercial cell for batteries, carbon removal, ammonia, and solar absorbers.
> **Audience:** sophisticated materials, mechanical, and chemical engineers; climate-tech investors
> **Status:** Draft

# From Predicted Crystal to Commercial Cell

A predicted crystal is not a material. A synthesized powder is not a cell. A cell is not a fleet, a filter, a fertilizer plant, or a solar farm. Between a computational screen and climate-relevant deployment stands a chain of specialized capabilities — synthesis, coating, cell fabrication, operando characterization, module integration, and manufacturing scale-up — that no single institution owns. The question is not simply "which compound is stable?" but "which compound can survive handoff across this chain?"

The conventional answer is to build a bigger generator. That has produced volume without trust. Google DeepMind's GNoME predicted 2.2 million crystals and identified 380,000 as thermodynamically stable, yet only 736 had been independently synthesized by late 2023 — a 0.2% validation rate[^1]. The A-Lab autonomous synthesis facility reported 63% success, but independent critique found that two-thirds of its "novel" targets were already-known disordered phases, reducing the true novel discovery rate to near zero[^2]. The bottleneck is not a shortage of predictions; it is the absence of a reliable correction and verification layer between prediction and experiment.

Lupine Science occupies that layer. Rather than competing with structure generators, laboratories, or databases, Lupine corrects the systematic errors of universal machine-learning interatomic potentials (uMLIPs) using a measured environment error field, deploys the correction at runtime with analytic forces, and verifies claims through machine-checked Lean 4 proofs. The result is a partner-facing platform that makes other organizations' predictions trustworthy, accelerating every link from crystal to cell.

This article maps that chain across Lupine's five priority targets — cobalt-free lithium-manganese-rich (LMR) cathodes, earth-abundant halide solid electrolytes, metal-organic frameworks (MOFs) for direct air capture, electrochemical ammonia catalysts, and lead-free perovskite solar absorbers. In each, a prediction is handed to synthesis, then characterization, then integration, then manufacturing. Where each handoff currently fails, a correction-and-verification layer creates value.

## Batteries: From Cathode Prediction to Pack Integration

LMR cathodes are the highest-impact near-term target. By eliminating cobalt and raising energy density above 300 Wh/kg, they could avoid 2–5 GtCO₂ cumulatively by 2050. The commercial stakes are visible in the field: POSCO Future M has completed pilot LMR production and is preparing mass manufacturing in 2025[^3], while GM and LG Energy Solution aim to begin commercial production of prismatic LMR cells by 2028[^4].

The first handoff is from computation to synthesis. Lupine's corrected migration barriers and oxygen-vacancy formation energies rank candidates across a compositional space exceeding 10⁶ compositions. The Manthiram Laboratory at UT Austin is the natural Tier 1 partner: Arumugam Manthiram invented cobalt-free layered oxide cathodes and has trained more than 300 researchers[^5]. TexPower EV Technologies — a Manthiram spinout — extends this to scale-up with a pilot producing NMA cathodes at >230 mAh/g and a 300-ton plant planned by 2027[^5].

The second handoff is from powder to coated particle. Voltage fade is driven by transition-metal migration and surface reconstruction, both suppressible by atomic-layer-deposition (ALD) coatings. Forge Nano operates powder ALD systems and has demonstrated that ALD coatings improve TexPower cathode cycle life by more than 30% while reducing resistance five-fold[^6]. A three-way arrangement — Lupine identifies compositions, Forge Nano applies coatings, TexPower supplies coated material — closes the cathode-to-cell gap.

The third handoff is from material to cell. The Battery500 Consortium, led by Pacific Northwest National Laboratory, operates pouch-cell fabrication lines and has demonstrated 350 Wh/kg pouch cells with more than 600 cycles[^7]. Lupine fits as a computational seedling project feeding the consortium's cathode pipeline.

Finally, the OEM handoff. GM's Wallace Battery Cell Innovation Center and LG Energy Solution are developing prismatic LMR cells for GM's electric trucks, with commercial production targeted for 2028[^4]. These industrial partners do not need another screen; they need a screen they can trust.

## Batteries: From Halide Electrolyte to Solid-State Cell

If LMR cathodes are the near-term lever, solid-state batteries with lithium-metal anodes are the long-term leap. Earth-abundant halide solid electrolytes — Li-Zr-Cl and Li-Fe-Cl systems — target >10 mS/cm ionic conductivity, stability versus lithium metal, and compatibility with mechanochemical synthesis. Industry analysts project the solid-state battery market to grow by an order of magnitude or more over the next decade.

The discovery challenge is that raw uMLIPs systematically underestimate Li⁺ migration barriers by 60% or more because transition states are under-coordinated relative to bulk training data. A 60% barrier error changes predicted room-temperature conductivity by roughly 5,000×. Lupine's environment error field corrects this at uMLIP speed.

The partner chain begins at UC Berkeley with Gerbrand Ceder's group and the Materials Project, which published foundational DFT studies of Li₃YCl₆ and Li₂ZrCl₆[^8]. The University of Münster's Janek and Zeier groups add world-leading halide solid-electrolyte synthesis and lithium-metal interface analytics via XPS and cryo-TEM[^9]. Argonne National Laboratory contributes operando X-ray absorption spectroscopy and the Materials Engineering Research Facility for kilogram-scale scale-up[^10].

Industrial translation runs through Solid Power, which produces sulfide and halide solid electrolytes and has built automotive-scale cells validated by BMW[^11]. Factorial Energy, whose quasi-solid-state cells have achieved 391 Wh/kg with Mercedes EQS validation, offers another integration path[^12].

The cross-cutting partner here is again Battery500. Lupine's halide-screening results and the consortium's pouch-cell fabrication create a single loop: computational composition → mechanochemical synthesis → impedance spectroscopy → full-cell cycling. With correction, each handoff carries a bounded error budget.

## Carbon Removal: From MOF Linker to Gigafactory

Direct air capture is the only carbon-removal technology that can address legacy emissions regardless of source sector. The IPCC estimates cumulative removal needs of 100–1,000 GtCO₂ by 2100, with annual rates approaching 10 GtCO₂/year by mid-century[^13]. MOFs are the most tunable sorbent class, but the gap between a predicted stable framework and a deployed filter is wide: synthesis costs must fall below $50/kg, humidity stability must survive thousands of cycles, and working capacity must exceed 2 mmol/g at 400 ppm CO₂.

The partner chain starts with reticular chemistry. UC Berkeley's Omar Yaghi and Jeffrey Long offer large MOF/COF synthesis libraries and cooperative-binding design. Omar Farha's group at Northwestern brings MOF-808 and Zr-based synthesis expertise, plus DOE programs focused on DAC MOF stability.

Lupine's role is to correct hydrolysis-barrier errors and flag unsupported frameworks. Water attack on metal-linker bonds proceeds through under-coordinated transition states — exactly where uMLIPs soften the potential energy surface. Corrected hydrolysis barriers filter frameworks by real-world humidity stability, not idealized gas-phase energy. Amine-functionalized MOF-808 has reached 1.2 mmol/g at 400 ppm and 50% relative humidity[^14].

Manufacturing scale runs through BASF, the first commercial MOF producer at several hundred tons per year and exclusive manufacturer of Svante's CALF-20 sorbent[^15]. Svante has deployed MOF-based capture at pilot scale and is planning multi-million-tonne-per-year capture facilities. Climeworks, the world's largest DAC deployer with its Mammoth plant in Iceland, offers field validation.

## Industrial Decarbonization: From Catalyst Prediction to Ammonia Market

Haber-Bosch ammonia synthesis emits approximately 450 MtCO₂/year and consumes 1–2% of global energy[^16]. Electrochemical synthesis powered by renewable electricity could eliminate those emissions. Lithium-mediated nitrogen reduction has achieved >90% Faradaic efficiency, but energy efficiency is stuck near 28% because lithium plating imposes a >3 V overpotential penalty[^17]. Lupine targets non-lithium mediators — Ca, Mg, Al, Na — with a goal of >60% energy efficiency and >300 mA/cm² partial current density[^18].

The most rigorous verification partner is the Technical University of Denmark's Villum Center for Sustainable Fuels, led by Ib Chorkendorff. DTU published the landmark Ca-mediated nitrogen reduction result in 2024, achieving 40% Faradaic efficiency, and operates a rigorous ammonia verification protocol[^19]. Chorkendorff has described non-lithium mediators as the field's highest priority.

Stanford's SUNCAT Center, co-directed by Jens Nørskov, adds computational catalysis and operando X-ray absorption spectroscopy at SLAC. The loop is tight: Lupine predicts compositions, SUNCAT screens them at the electronic-structure level, and DTU validates the winners.

Commercial engineering comes through Jupiter Ionics, which licensed Douglas MacFarlane's lithium-mediated technology and is developing modular MSA Cell technology after a $9 million Series A. ARPA-E's REFUEL program provides funding and metrics: >60% energy efficiency, >300 mA/cm², and >90% Faradaic efficiency[^18].

Downstream, Caltech's Karthish Manthiram group contributes gas-diffusion-electrode engineering, Nitricity offers distributed-fertilizer piloting, and CF Industries — the world's largest ammonia manufacturer — provides the eventual industrial exit.

## Solar: From Lead-Free Absorber to Tandem Module

Lead-based halide perovskites have exceeded 26% single-junction efficiency and ~34.6% in perovskite-silicon tandems, but lead toxicity and impending EU restrictions threaten terawatt-scale deployment[^20]. Lead-free tin perovskites are the leading alternative, yet Sn²⁺ oxidizes within minutes to hours. The target is >20% certified power conversion efficiency with >25-year operational stability.

The key descriptor is Sn vacancy formation energy, which determines oxidation susceptibility. uMLIPs systematically underestimate this energy because vacancies create under-coordinated Sn neighbors that bulk-trained models predict as too stable. Lupine's correction recovers accurate vacancy energetics, while provable boundaries flag metastable phases that convex-hull screening would discard.

The partner chain begins with NREL, which provides certified efficiency measurements, slot-die and roll-to-roll fabrication, and ISOS stability protocols. The University of Queensland's Lianzhou Wang group holds the certified world record for tin halide perovskites at 16.65% and has demonstrated 1,500-hour stability without encapsulation[^21]. Tandem PV Inc., which operates a pilot factory in San Jose, integrates perovskite top cells with silicon bottom cells. Northwestern's Mercouri Kanatzidis, who pioneered CsSnI₃ and solid-state halide perovskite solar cells, offers synthesis and panoramic methodology for discovering new absorber families.

The scale-up handoff runs through Oxford Photovoltaics, which began commercial tandem shipments in 2024 and holds a 24%+ module efficiency, and through Swift Solar, whose vapor-deposition manufacturing is especially compatible with oxygen-sensitive tin perovskites.

## Cross-Cutting Architecture: NREL, UC Berkeley, and ARPA-E

Each target has its own partner chain, but three institutions create economies of scope.

NREL is the highest-value cross-cutting partner. It spans four of Lupine's five targets — cathodes, halide solid electrolytes, ammonia catalysts, and perovskites — and offers certified testing, lifecycle analysis, techno-economic analysis, and a single point of access to DOE funding networks. A master CRADA with NREL replaces multiple one-off agreements.

UC Berkeley offers a complementary two-group engagement: the Ceder group for battery materials and the Yaghi/Long groups for MOF direct air capture. A campus-wide partnership gives Lupine access to synthesis, characterization, and autonomous discovery infrastructure across three targets from one institutional relationship.

ARPA-E should be approached with a portfolio strategy rather than individual proposals. Coordinated submissions across REFUEL (ammonia), IONICS (halide solid electrolytes), and OPEN (MOF DAC) position Lupine as a multi-target computational materials company. The return is non-dilutive capital and validation credibility. ARPA-E's portfolio has catalyzed billions of dollars in private follow-on funding[^22], and the NIST Materials Genome Initiative analysis estimates $123 billion–$270 billion in annual value from improved materials innovation infrastructure[^23].

## The Verification Layer as Partnership Enabler

Partners validate the science; verification makes it trustworthy at scale. Every organization named above has been burned by computational predictions that looked convincing in a paper but failed in the lab. The 0.2% GNoME synthesis rate and the A-Lab disordered-phase episode are warnings that experimental budgets are finite and false positives are expensive.

Lupine's environment error field, runtime correction, and formal verification address this directly. The field achieves r=0.906 blind prediction of never-fitted surface energies across 36 (model, material) combinations with zero adjustable parameters. Runtime correction adds 15.6% overhead in Python and will drop below 1% in a compiled LAMMPS overlay, keeping corrected uMLIPs many orders of magnitude faster than DFT. Seventy-seven build-locked Lean 4 theorems provide machine-checked guarantees. Where correction cannot apply, Lupine proves impossibility rather than reporting a p-value.

For partners, handoffs carry documentation. A cathode candidate comes with corrected migration barriers and a theorem certificate of the ranking claim. A MOF candidate comes with a hydrolysis-barrier correction and a proof of whether its coordination environment lies inside or outside the field's domain. An ammonia catalyst comes with corrected N₂ dissociation barriers and a flag if scaling-relation breaking requires higher-level treatment. Experimentalists still synthesize and measure; Lupine removes the guesswork about which candidates deserve the work.

In a discovery ecosystem that must scale from thousands to millions of validated materials per year, the scarce resource is not prediction volume. It is the trust that turns a predicted crystal into a commercial cell.

## Footnotes

[^1]: A. Merchant *et al.*, "Scaling deep learning for materials discovery," *Nature* **624**, 80–85 (2023). https://doi.org/10.1038/s41586-023-06735-9

[^2]: N. J. Szymanski *et al.*, "An autonomous laboratory for the accelerated synthesis of novel materials," *Nature* **624**, 86–91 (2023); J. Leeman *et al.*, "Challenges in High-Throughput Inorganic Materials Prediction and Autonomous Synthesis," *PRX Energy* **3**, 011002 (2024). https://doi.org/10.1038/s41586-023-06734-7; https://doi.org/10.1103/PRXEnergy.3.011002

[^3]: POSCO Future M, "POSCO Future M to lead entry-level and standard EV markets with LMR cathode materials," press release, June 2025.

[^4]: General Motors, "Why LMR batteries will change the outlook for the EV market," GM Newsroom, May 2025; LG Energy Solution / GM, Battery Innovation of the Year, The Battery Show North America, October 2025.

[^5]: TexPower EV Technologies, company website and press releases, 2024–2025; A. Manthiram, "A reflection on lithium-ion battery cathode chemistry," *Nature Communications* **11**, 1550 (2020).

[^6]: Forge Nano, "US-made ultrahigh-energy cathodes will enable low-cost electric vehicle batteries," press release, January 2024.

[^7]: U.S. Department of Energy / PNNL, "Battery500: Progress Update," 2020; PNNL, "Powering Up to Address Challenges in Energy Storage," March 2024.

[^8]: G. Ceder *et al.*, foundational DFT studies of Li₃YCl₆ and Li₂ZrCl₆ halide solid electrolytes; Materials Project.

[^9]: J. Janek and W. G. Zeier groups, University of Münster, halide solid-electrolyte synthesis and interface analytics.

[^10]: Argonne National Laboratory, Materials Engineering Research Facility and Advanced Photon Source capabilities.

[^11]: BMW Group / Solid Power, joint development agreement and solid-state battery cell validation announcements, 2021–2025.

[^12]: Factorial Energy / Mercedes-Benz, solid-state battery cell development and EQS road-test announcements, 2023–2025.

[^13]: IPCC, *Climate Change 2022: Mitigation of Climate Change*, Working Group III Contribution to AR6, Cambridge University Press, 2022.

[^14]: X. Chen *et al.*, "Computational Screening of Amino-Functionalized Molecules for Direct Air Capture of CO₂," *J. Phys. Chem. A* (2026).

[^15]: BASF, "BASF becomes first company to successfully produce metal-organic frameworks on a commercial scale for carbon capture," press release, October 2023.

[^16]: Royal Society, *Ammonia: Zero-Carbon Fertiliser, Fuel and Energy Store*, policy briefing, 2020; International Energy Agency, *Ammonia Technology Roadmap*, IEA, 2021.

[^17]: W. Chang *et al.*, "Lithium-mediated nitrogen reduction to ammonia via the solvation-enabled N₂ activation," *Nature Catalysis* **7**, 342–352 (2024).

[^18]: ARPA-E REFUEL program, U.S. Department of Energy, program targets.

[^19]: X. Fu *et al.*, "Calcium-mediated nitrogen reduction for electrochemical ammonia synthesis," *Nature Materials* **23**, 101–107 (2024). https://doi.org/10.1038/s41563-023-01702-1

[^20]: NREL, "Best Research-Cell Efficiency Chart," National Renewable Energy Laboratory, updated 2025.

[^21]: P. Chen *et al.*, "2D/3D tin-halide perovskite solar cell with certified 16.65% efficiency," *Nature Nanotechnology* **20**, 742–749 (2025).

[^22]: ARPA-E, "ARPA-E Impact," U.S. Department of Energy, 2023.

[^23]: NIST / RTI International, *Economic Analysis of the Materials Genome Initiative*, National Institute of Standards and Technology, 2023.
