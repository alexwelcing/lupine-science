> **Type:** article
> **Date:** 2026-07-09
> **Scope:** How Lupine Science turns computational predictions into commercial climate materials through a sequenced partner chain.
> **Description:** A rigorous, partner-by-partner map from predicted crystal to commercial cell for batteries, carbon removal, ammonia, and solar absorbers.
> **Audience:** sophisticated materials, mechanical, and chemical engineers; climate-tech investors
> **Status:** Draft

# From Predicted Crystal to Commercial Cell

A predicted crystal is not a material. A synthesized powder is not a cell. A cell is not a fleet, a filter, a fertilizer plant, or a solar farm. Between a computational screen and climate-relevant deployment stands a chain of specialized capabilities — synthesis, coating, cell fabrication, operando characterization, module integration, and manufacturing scale-up — that no single institution owns. The question is not simply "which compound is stable?" but "which compound can survive handoff across this chain?"

The conventional answer is to build a bigger generator. That has produced volume without trust. Google DeepMind's GNoME predicted 2.2 million crystals and identified 380,000 as thermodynamically stable, yet only 736 had been independently synthesized by late 2023 — a 0.2% validation rate[^1]. The A-Lab autonomous synthesis facility reported 63% success, but independent critique found that two-thirds of its "novel" targets were already-known disordered phases, reducing the true novel discovery rate to near zero[^2]. The bottleneck is not a shortage of predictions; it is the absence of a reliable correction and verification layer between prediction and experiment.

Lupine Science occupies that layer. Rather than competing with structure generators, laboratories, or databases, Lupine corrects the systematic errors of universal machine-learning interatomic potentials (uMLIPs) using a measured environment error field, deploys the correction at runtime with analytic forces, and verifies claims through machine-checked Lean 4 proofs[^3]. The result is a partner-facing platform that makes other organizations' predictions trustworthy, accelerating every link from crystal to cell.

This article maps that chain across Lupine's five priority targets — cobalt-free lithium-manganese-rich (LMR) cathodes, earth-abundant halide solid electrolytes, metal-organic frameworks (MOFs) for direct air capture, electrochemical ammonia catalysts, and lead-free perovskite solar absorbers. In each, a prediction is handed to synthesis, then characterization, then integration, then manufacturing. Where each handoff currently fails, a correction-and-verification layer creates value.

## Batteries: From Cathode Prediction to Pack Integration

LMR cathodes are the highest-impact near-term target. By eliminating cobalt and raising energy density above 300 Wh/kg, they could avoid 2–5 GtCO₂ cumulatively by 2050[^4]. The commercial stakes are visible in the field: POSCO Future M has completed pilot LMR production and plans mass manufacturing within 2025, while GM has announced commercial LMR deployment by 2028[^5].

The first handoff is from computation to synthesis. Lupine's corrected migration barriers and oxygen-vacancy formation energies rank candidates across a compositional space exceeding 10⁶ compositions[^4]. The Manthiram Laboratory at UT Austin is the natural Tier 1 partner: Arumugam Manthiram invented cobalt-free layered oxide cathodes and has trained more than 300 researchers[^5]. TexPower EV Technologies — a Manthiram spinout — extends this to scale-up with a 15-ton-per-year pilot producing NMA cathodes at >230 mAh/g and a 300-ton plant planned by 2027[^5].

The second handoff is from powder to coated particle. Voltage fade is driven by transition-metal migration and surface reconstruction, both suppressible by atomic-layer-deposition (ALD) coatings. Forge Nano operates 15 ALD systems, processes from 1 g to 30,000 kg per day, and has demonstrated that ALD coatings improve cycle life by more than 30% while reducing resistance five-fold[^5]. A three-way arrangement — Lupine identifies compositions, Forge Nano applies coatings, TexPower supplies coated material — closes the cathode-to-cell gap.

The third handoff is from material to cell. The Battery500 Consortium, led by Pacific Northwest National Laboratory and spanning four national labs and six universities, operates pouch-cell fabrication lines and has demonstrated 350 Wh/kg pouch cells with more than 600 cycles[^5]. Lupine fits as a computational seedling project feeding the consortium's cathode pipeline.

Finally, the OEM handoff. GM's Wallace Battery Cell Innovation Center has coated 1 ton of LMR cathode material, built 18 prototype cells, and logged 1.4 million equivalent miles of testing[^5]. LG Energy Solution holds the world's largest LMR patent portfolio and is commercializing prismatic cells with GM for 2028[^5]. These industrial partners do not need another screen; they need a screen they can trust.

## Batteries: From Halide Electrolyte to Solid-State Cell

If LMR cathodes are the near-term lever, solid-state batteries with lithium-metal anodes are the long-term leap. Earth-abundant halide solid electrolytes — Li-Zr-Cl and Li-Fe-Cl systems — target >10 mS/cm ionic conductivity, stability versus lithium metal, and compatibility with mechanochemical synthesis[^6]. The solid-state battery market is projected to grow from $886 million in 2024 to $24.3 billion by 2034[^4].

The discovery challenge is that raw uMLIPs systematically underestimate Li⁺ migration barriers by 60% or more because transition states are under-coordinated relative to bulk training data[^4]. A 60% barrier error changes predicted room-temperature conductivity by roughly 5,000×. Lupine's environment error field corrects this at uMLIP speed.

The partner chain begins at UC Berkeley with Gerbrand Ceder's group and the Materials Project, which published foundational DFT studies of Li₃YCl₆ and Li₂ZrCl₆[^6]. The University of Münster's Janek and Zeier groups add world-leading halide solid-electrolyte synthesis and lithium-metal interface analytics via XPS and cryo-TEM[^6]. Argonne National Laboratory contributes operando X-ray absorption spectroscopy and the Materials Engineering Research Facility for 20–100 kg scale-up[^6].

Industrial translation runs through Solid Power, which produces sulfide and halide solid electrolytes, operates roll-to-roll manufacturing, and has built 100+ Ah cells validated by BMW[^6]. Factorial Energy, whose FEST/Solstice electrolytes have achieved 391 Wh/kg cells with Mercedes EQS validation, offers another integration path[^6]. Ion Storage Systems, with a $20 million ARPA-E SCALEUP award and a Saint-Gobain partnership, provides an anodeless-manufacturing route that could pair with lower-cost halide chemistry[^6].

The cross-cutting partner here is again Battery500. Lupine's halide-screening results and the consortium's pouch-cell fabrication create a single loop: computational composition → mechanochemical synthesis → impedance spectroscopy → full-cell cycling. With correction, each handoff carries a bounded error budget.

## Carbon Removal: From MOF Linker to Gigafactory

Direct air capture is the only carbon-removal technology that can address legacy emissions regardless of source sector. The IPCC estimates cumulative removal needs of 100–1,000 GtCO₂ by 2100, with annual rates approaching 10 GtCO₂/year by mid-century[^4]. MOFs are the most tunable sorbent class, but the gap between a predicted stable framework and a deployed filter is wide: synthesis costs must fall below $50/kg, humidity stability must survive thousands of cycles, and working capacity must exceed 2 mmol/g at 400 ppm CO₂[^6].

The partner chain starts with reticular chemistry. UC Berkeley's Omar Yaghi and Jeffrey Long offer synthesis of >100,000 MOF/COF variants and cooperative-binding design[^6]. Omar Farha's group at Northwestern brings MOF-808 and Zr-based synthesis expertise, plus a $3.3 million DOE program focused on DAC MOF stability[^6].

Lupine's role is to correct hydrolysis-barrier errors and flag unsupported frameworks. Water attack on metal-linker bonds proceeds through under-coordinated transition states — exactly where uMLIPs soften the potential energy surface[^4]. Corrected hydrolysis barriers filter frameworks by real-world humidity stability, not idealized gas-phase energy.

Manufacturing scale runs through BASF, the first commercial MOF producer at >200 tons per year and exclusive manufacturer of Svante's CALF-20 sorbent[^6]. Svante has deployed MOF-based capture at 25 tonnes per day and is planning a 10 million tCO₂/year "gigafactory"[^6]. Climeworks, the world's largest DAC deployer with its Mammoth plant in Iceland, offers field validation[^6]. Atoco, Yaghi's commercialization spinout, provides a startup route to co-development[^6].

## Industrial Decarbonization: From Catalyst Prediction to Ammonia Market

Haber-Bosch ammonia synthesis emits approximately 450 MtCO₂/year and consumes 1–2% of global energy[^4]. Electrochemical synthesis powered by renewable electricity could eliminate those emissions. Lithium-mediated nitrogen reduction has achieved >90% Faradaic efficiency, but energy efficiency is stuck near 28% because lithium plating imposes a >3 V overpotential penalty[^4]. Lupine targets non-lithium mediators — Ca, Mg, Al, Na — with a goal of >60% energy efficiency and >300 mA/cm² partial current density[^6].

The most rigorous verification partner is the Technical University of Denmark's Villum Center for Sustainable Fuels, led by Ib Chorkendorff. DTU published the landmark Ca-mediated nitrogen reduction result in 2024, achieving 40% Faradaic efficiency, and operates the world's most rigorous ammonia verification protocol[^6]. Chorkendorff has described non-lithium mediators as the field's highest priority.

Stanford's SUNCAT Center, co-directed by Jens Nørskov, adds computational catalysis and operando X-ray absorption spectroscopy at SLAC[^6]. The loop is tight: Lupine predicts compositions, SUNCAT screens them at the electronic-structure level, and DTU validates the winners.

Commercial engineering comes through Jupiter Ionics, which licensed Douglas MacFarlane's lithium-mediated technology and is developing modular MSA Cell technology after a $9 million Series A[^6]. ARPA-E's REFUEL program provides funding and metrics: >86% energy efficiency, >300 mA/cm² at 90% current efficiency, and >100 g/day electrochemical ammonia[^6].

Downstream, Caltech's Karthish Manthiram group contributes gas-diffusion-electrode engineering, Nitricity offers distributed-fertilizer piloting at its Delhi, California plant, and CF Industries — the world's largest ammonia manufacturer at ~10 million tons per year — provides the eventual industrial exit[^6].

## Solar: From Lead-Free Absorber to Tandem Module

Lead-based halide perovskites have exceeded 26% single-junction efficiency and ~34.6% in perovskite-silicon tandems, but lead toxicity and impending EU restrictions threaten terawatt-scale deployment[^4]. Lead-free tin perovskites are the leading alternative, yet Sn²⁺ oxidizes within minutes to hours and efficiencies have stalled near 9%[^4]. The target is >20% certified power conversion efficiency with >25-year operational stability[^6].

The key descriptor is Sn vacancy formation energy, which determines oxidation susceptibility. uMLIPs systematically underestimate this energy because vacancies create under-coordinated Sn neighbors that bulk-trained models predict as too stable[^4]. Lupine's correction recovers accurate vacancy energetics, while provable boundaries flag metastable phases that convex-hull screening would discard.

The partner chain begins with NREL, which provides certified efficiency measurements, slot-die and roll-to-roll fabrication, and ISOS stability protocols[^6]. The University of Queensland's Lianzhou Wang group holds the certified world record for tin halide perovskites at 16.65% (April 2025) and has demonstrated 1,500-hour stability without encapsulation[^6]. Tandem PV Inc., which has raised $87 million and operates a pilot factory in San Jose, integrates perovskite top cells with silicon bottom cells[^6]. Northwestern's Mercouri Kanatzidis, who pioneered CsSnI₃ and solid-state halide perovskite solar cells, offers synthesis and panoramic methodology for discovering new absorber families[^6].

The scale-up handoff runs through Oxford Photovoltaics, which began commercial tandem shipments in 2024 and holds a 26.9% world-record module efficiency, and through Swift Solar, whose vapor-deposition manufacturing is especially compatible with oxygen-sensitive tin perovskites[^6].

## Cross-Cutting Architecture: NREL, UC Berkeley, and ARPA-E

Each target has its own partner chain, but three institutions create economies of scope.

NREL is the highest-value cross-cutting partner. It spans four of Lupine's five targets — cathodes, halide solid electrolytes, ammonia catalysts, and perovskites — and offers certified testing, lifecycle analysis, techno-economic analysis, and a single point of access to DOE funding networks[^6]. A master CRADA with NREL replaces multiple one-off agreements.

UC Berkeley offers a complementary two-group engagement: the Ceder group for battery materials and the Yaghi/Long groups for MOF direct air capture[^6]. A campus-wide partnership gives Lupine access to synthesis, characterization, and autonomous discovery infrastructure across three targets from one institutional relationship.

ARPA-E should be approached with a portfolio strategy rather than individual proposals. Coordinated submissions across REFUEL (ammonia), IONICS (halide solid electrolytes), and OPEN (MOF DAC) position Lupine as a multi-target computational materials company[^6]. The return is non-dilutive capital and validation credibility. ARPA-E's $3.5 billion portfolio has catalyzed $11.8 billion in private follow-on funding[^7], and the NIST Materials Genome Initiative analysis estimates $123 billion–$270 billion in annual value from improved materials innovation infrastructure[^7].

## The Verification Layer as Partnership Enabler

Partners validate the science; verification makes it trustworthy at scale. Every organization named above has been burned by computational predictions that looked convincing in a paper but failed in the lab. The 0.2% GNoME synthesis rate and the A-Lab disordered-phase episode are warnings that experimental budgets are finite and false positives are expensive.

Lupine's environment error field, runtime correction, and formal verification address this directly. The field achieves r=0.906 blind prediction of never-fitted surface energies across 36 (model, material) combinations with zero adjustable parameters[^3]. Runtime correction adds 15.6% overhead in Python and will drop below 1% in a compiled LAMMPS overlay, keeping corrected uMLIPs roughly 10⁵× faster than DFT[^3]. Seventy-seven build-locked Lean 4 theorems provide machine-checked guarantees[^3]. Where correction cannot apply, Lupine proves impossibility rather than reporting a p-value.

For partners, handoffs carry documentation. A cathode candidate comes with corrected migration barriers and a theorem certificate of the ranking claim. A MOF candidate comes with a hydrolysis-barrier correction and a proof of whether its coordination environment lies inside or outside the field's domain. An ammonia catalyst comes with corrected N₂ dissociation barriers and a flag if scaling-relation breaking requires higher-level treatment. Experimentalists still synthesize and measure; Lupine removes the guesswork about which candidates deserve the work.

In a discovery ecosystem that must scale from thousands to millions of validated materials per year, the scarce resource is not prediction volume. It is the trust that turns a predicted crystal into a commercial cell.

## Footnotes

[^1]: Google DeepMind's GNoME predicted 2.2 million crystals, of which 380,000 were computed stable; only 736 had been independently synthesized by late 2023, a 0.2% validation rate. See *Lupine Science Strategic Discovery Plan: High-Impact Materials for Climate*, Section 2.1.

[^2]: The A-Lab autonomous synthesis facility reported 41 novel compounds from 58 targets (63% success), but independent critique found two-thirds of targets were ordered approximations of known disordered phases, reducing the true novel discovery rate to near zero. See *Lupine Science Strategic Discovery Plan*, Section 2.1.

[^3]: Lupine measures systematic error as a physical field over local atomic environments, corrects it at runtime with analytic forces, and verifies claims through 77 build-locked Lean 4 theorems with zero sorry proofs. Blind prediction achieves Pearson r=0.906 (p=10⁻⁴, 95% CI [0.82, 0.96]) across 36 (model, material) combinations with zero adjustable parameters. Runtime correction adds 15.6% overhead in Python and will drop below 1% in a compiled LAMMPS overlay. See *Lupine Science Strategic Discovery Plan*, Section 3.

[^4]: The five priority targets — cobalt-free LMR cathodes, earth-abundant halide solid electrolytes, MOFs for direct air capture, electrochemical ammonia catalysts, and lead-free perovskites — collectively address 5–12 GtCO₂/year. See *Lupine Science Strategic Discovery Plan*, Sections 4.1–4.5 and 6.1.1.

[^5]: Partnership details for cobalt-free LMR cathodes: Manthiram Laboratory / UT Austin and TexPower EV Technologies; Battery500 Consortium (PNNL-led); Forge Nano, Inc.; POSCO Future M; General Motors / Ultium Cells LLC; LG Energy Solution; Argonne National Laboratory / Advanced Photon Source. TexPower operates a 15-ton/year pilot producing NMA cathodes at >230 mAh/g; GM targets 2028 LMR deployment. See *Lupine Science: Strategic Partnership Mapping Document*, Section 1.

[^6]: Partnership details across all five targets, including tier rankings and key metrics, are from *Lupine Science: Strategic Partnership Mapping Document*, Sections 1–5 and Cross-Cutting Partners Table.

[^7]: ARPA-E's $3.5 billion portfolio (2009–2023) catalyzed $11.8 billion in private follow-on funding; the NIST/RTI Materials Genome Initiative economic analysis estimates $123 billion–$270 billion in annual value from improved materials innovation infrastructure. See *Lupine Science Strategic Discovery Plan*, Sections 5.4 and 6.1.2.
