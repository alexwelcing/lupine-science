> **Type:** article
> **Date:** 2026-07-09
> **Scope:** Why computational materials discovery is bottlenecked at synthesis and validation, not prediction.
> **Description:** Most computationally predicted stable crystals are never synthesized. This article examines the structural barriers behind the 0.2% validation rate and what it means for climate-relevant materials.
> **Audience:** sophisticated materials, mechanical, and chemical engineers; climate-tech investors
> **Status:** Draft

# The 0.2% Synthesis Problem

The International Energy Agency's most recent scenarios make a disquieting claim: batteries alone are directly linked to roughly 20% of the CO~2~ emissions reductions required by 2030, and indirectly to another 40%[^1]. Clean energy investment must rise from $1.8 trillion in 2023 to $4.5 trillion annually by the early 2030s[^2]. Much of that gap is not a finance gap or a policy gap. It is a materials gap. Every credible net-zero pathway assumes we will commercialize chemistries that do not yet exist at scale: cobalt-free cathodes, earth-abundant solid electrolytes, humidity-stable sorbents, non-lithium ammonia catalysts, lead-free perovskites. The question is no longer whether we need new materials, but whether we can discover and validate them fast enough.

Here is the counterintuitive part: the binding constraint is not a shortage of predictions. It is a shortage of *validated* predictions. Computational materials science can now enumerate millions of hypothetical crystals, score their stability, and rank their properties in a weekend. What it cannot do, at anything like the same throughput, is tell an experimentalist which of those candidates will actually form in a synthesis vessel and perform as modeled. The result is a widening canyon between predicted structure and made-and-measured material.

This canyon is measurable. A campaign that predicts 380,000 stable crystals and validates 736 is not a triumph of scale; it is a precise measurement of how little current methods know about synthesis. The gap is the difference between what can be computed and what can be believed. Closing it requires a different kind of tool: not a bigger generator, but a correction and verification layer that turns predictions into reliable experimental priorities.

## The 0.2% number

The scale of that canyon is captured by the largest structure-prediction campaign to date. In 2023, Google DeepMind published GNoME (Graph Networks for Materials Exploration), a deep-learning system trained to predict the energy of crystal structures[^3]. The headline was arresting: 2.2 million new crystals identified, of which roughly 380,000 were computed to lie below the convex-hull stability threshold. If even a fraction had been real, the work would have roughly doubled the known universe of stable inorganic crystals.

The follow-up was quieter. By late 2023, only 736 of those 380,000 "stable" candidates had been independently synthesized and reported[^4]. That is a 0.2% validation rate. The other 99.8% remained either unmade, unstable under real synthesis conditions, or indistinguishable from errors of approximation. GNoME itself was not the failure; the failure is the structural pipeline that converts a computational stability score into a synthesized, phase-pure, functional material. Prediction outran verification by roughly three orders of magnitude.

A 0.2% rate would be tolerable if the 0.2% were the right 0.2%. It is not obvious that they are. Computational stability rankings are distorted by systematic errors in interatomic potentials, by the omission of defects and disorder, and by the thermodynamic idealization of a synthesis process that is almost always kinetic. The experimentalists who do attempt synthesis therefore face a lottery with long odds and an unclear prize. Each failed attempt consumes weeks of beam time, grams of precursors, and the scarcest resource of all: the attention of a trained solid-state chemist.

The number also exposes a category error that runs through much of the field. Stability on the convex hull is a necessary condition for a material to exist, but it is not sufficient for it to be useful, or even makeable. A predicted crystal may be thermodynamically allowed yet kinetically inaccessible, or stable as a perfect lattice yet degraded by the vacancies and surfaces that any real device contains. Treating "computed stable" as "likely synthesizable" is like treating a protein's folded structure as evidence that it can be expressed in *E. coli* at gram scale. The two questions live in different scientific regimes.

## A-Lab as a cautionary tale

The A-Lab autonomous synthesis facility at Lawrence Berkeley National Laboratory seemed to offer an escape from that lottery. In a widely reported 2023 study, A-Lab claimed a 63% success rate: 41 of 58 targeted novel compounds were synthesized autonomously[^5]. The paper was celebrated as evidence that robotics and machine learning could close the prediction-synthesis gap.

Subsequent critique was less celebratory. When independent groups re-examined the "novel" targets, they found that roughly two-thirds were not new compounds at all. They were known disordered phases that had been misclassified as novel by the screening algorithm[^6]. The true novel discovery rate collapsed to near zero. Faster synthesis, absent better verification, had simply produced more misidentified products faster.

The A-Lab episode is useful because it isolates the problem. The robots worked; the recipes were plausible; the bottleneck was upstream. The system had no reliable way to know whether a predicted target was a genuine, synthesizable compound or a statistical artifact dressed up as a crystal. The same defect corrupts manual labs every day, only more slowly and more expensively. A false positive in the computational queue does not become less false when it is attempted by a talented postdoc with a tube furnace.

A-Lab's 63% figure is therefore a Rorschach test. Read optimistically, it shows that autonomous synthesis is technically feasible. Read critically, it shows that synthesis automation without prediction verification merely accelerates the consumption of reagents and beam time. The lesson is not that robots are overhyped; it is that the robots were asked to optimize the wrong variable. Success rate is meaningless if the target list is contaminated.

## Four structural barriers

Why does the pipeline fail so consistently? The failures cluster around four structural barriers that are not specific to GNoME or A-Lab but are built into how computational discovery is practiced today.

**Defect/bulk asymmetry.** Most machine-learned interatomic potentials (uMLIPs) are trained on bulk, periodic, low-energy configurations. Functional materials, however, are governed by defects: vacancies, surfaces, grain boundaries, dislocations, and interfaces. These configurations are outside the training distribution, and uMLIPs systematically soften their energies by 15–60%[^7]. A cathode's voltage fade, an electrolyte's dendrite initiation, a perovskite's oxidation susceptibility: all are defect-mediated properties that bulk-trained models get wrong.

Consider a lithium-manganese-rich cathode. Its practical capacity and cycle life are controlled by transition-metal migration and oxygen loss at under-coordinated surface and grain-boundary sites. A uMLIP trained on bulk layered oxides will predict the average lattice energy well and the migration barrier poorly. The same pattern appears in halide solid electrolytes, where Li^+^ conductivity depends on hop barriers at interfaces and defects, and in tin perovskites, where Sn^2+^ oxidation is driven by vacancy formation energies that raw potentials underestimate.

**Combinatorial wall.** The spaces that matter are multi-component. A lithium-zirconium-chloride solid electrolyte has roughly 12,000 distinct compositions when Li stoichiometry, Zr oxidation state, and halide mixing are enumerated[^8]. A double-perovskite absorber space contains millions of A~2~BB'X~6~ candidates. DFT cannot screen these spaces economically; even a single 100-atom supercell costs thousands of CPU-hours. uMLIPs can screen them, but only if their errors are controlled. Without correction, the combinatorial wall is replaced by a false-confidence wall.

The false-confidence wall is worse than the original wall because it hides itself. A researcher can produce a ranked list of 12,000 halide compositions, each with an energy value reported to three decimal places, and still have no idea whether the top fifty are genuine candidates or artifacts of a systematic bias. Combinatorial scale multiplied by uncorrected error produces not insight but noise with formatting.

**Metastability.** Many of the most promising materials are not the thermodynamic ground state. High-capacity cathode oxides, tin halide perovskites, and certain hydride superconductors are kinetically trapped during synthesis. Standard convex-hull screening discards them as unstable, eliminating the very candidates that could achieve the highest performance[^9]. Distinguishing a synthesizable metastable phase from an unreachable one requires more than an energy ranking; it requires knowledge of synthesis pathways and error boundaries.

This is not a niche issue. The lithium-manganese-rich cathodes that GM and POSCO Future M are commercializing are metastable relative to simpler rock-salt phases; they exist only because rapid quenching and cation ordering kinetically arrest a decomposition that thermodynamics would prefer. A screen that discards everything above the convex hull would have discarded the chemistry the auto industry is now betting on.

**Ranking inversion.** Even when the absolute energy of a candidate is wrong, its relative ranking might still be useful. Often it is not. Because uMLIP errors are systematic and structure-dependent, they invert the order of candidates: a composition that looks best in silico turns out to be mediocre in the lab, while a better candidate is buried lower in the list[^10]. Experimentalists chase false priorities, and the true optimum is missed entirely.

Ranking inversion is particularly costly because it is silent. A model that predicts the wrong absolute energy by a fixed offset is easy to calibrate. A model that predicts the right energies in the wrong order sends a team to synthesize candidate A while candidate B, two rows down, is the one that would have worked. In Lupine's own blind-prediction tests, raw uMLIP rankings for defect-mediated properties invert relative order across entire composition series, making the experimental queue a bet against the model rather than a bet on it.

These four barriers are not independent. Defect/bulk asymmetry feeds ranking inversion; the combinatorial wall amplifies the cost of every inverted ranking; metastability adds a class of false negatives that stability screening is blind to. Together they explain why 2.2 million predictions collapse to 736 validated crystals.

## Why it matters for climate

The climate cost of this bottleneck is not theoretical. The deployment window for many clean-energy technologies is 2025–2035. A battery chemistry discovered in 2035 misses the 2040 pack-design cycle; a perovskite absorber validated in 2038 misses the 2045 module ramp. The cumulative emissions difference between deployment in 2035 and 2045 is measured in tens of gigatonnes[^11].

The arithmetic is unforgiving at the target level. Lupine's five priority materials — cobalt-free cathodes, earth-abundant halide solid electrolytes, MOFs for direct air capture, electrochemical ammonia catalysts, and lead-free perovskites — together represent 5–12 GtCO~2~/year of potential climate impact when fully deployed[^15]. That is 10–25% of the annual energy-sector CO~2~ emissions that must be eliminated or offset by 2050. Missing even one of these targets because of an inverted ranking or a discarded metastable phase is not a research setback; it is a measurable slice of the carbon budget.

Every false positive imposes a direct tax. A failed synthesis campaign for a predicted cathode or electrolyte can easily cost $100,000 and consume person-years of effort[^12]. Multiply that tax across the thousands of candidates screened annually by groups at the Ceder lab at UC Berkeley, the Manthiram lab at UT Austin, the Chorkendorff group at DTU, and the dozens of battery and catalysis startups racing to scale, and the cost of untrustworthy predictions becomes a measurable drag on the energy transition.

False negatives are harder to price but no less damaging. A cobalt-free cathode that could have cut supply-chain dependence on the Democratic Republic of Congo, or an earth-abundant halide electrolyte that could have displaced indium- and yttrium-based chemistries, may already exist in a database somewhere and be ranked too low to try. POSCO Future M plans mass production of lithium-manganese-rich cathodes in 2025; GM has announced LMR cells by 2028; Solid Power and Factorial Energy are competing to put solid-state batteries in vehicles this decade[^13]. These timelines do not leave room for a 0.2% hit rate.

## A correction-and-verification layer

The implication is that the next leap in materials discovery will not come from generating more predictions. It will come from making existing predictions trustworthy. What the field needs is a correction-and-verification layer that sits between structure generators and synthesis labs: measuring systematic error, correcting it at runtime, and formally proving which claims can and cannot be supported.

That is the layer Lupine Science is building. Rather than training a larger neural network to replace existing potentials, Lupine treats the error of an interatomic potential as a physical field over local atomic environments. The field is measured from a small number of anchor observables, applied at runtime with analytic forces, and verified by machine-checked proof[^14]. The goal is not to beat GNoME or MatterGen at their own game; it is to take their outputs and answer the question that synthesis labs actually care about: *will this one work?*

In that framing, the 0.2% number is not an indictment of computational discovery. It is the definition of the opportunity. If a correction layer can raise a 0.2% validation rate to even 5% or 10%, the experimental yield of the entire field changes. The 736 confirmed GNoME crystals become 15,000 or 30,000. The A-Lab robots stop synthesizing mislabeled disordered phases and start making the materials their models actually intended. And the chemists, beamline scientists, and cell engineers who must decide what to make next get a queue they can trust.

The next article in this series explains how that correction layer works: not as another neural network, but as a measured field.

## Footnotes

[^1]: International Energy Agency, *World Energy Outlook 2023*, battery CO~2~ reduction linkage estimate.
[^2]: International Energy Agency, *World Energy Investment 2024*: clean energy investment must rise from $1.8 trillion in 2023 to $4.5 trillion annually by the early 2030s.
[^3]: Merchant et al., "Scaling deep learning for materials discovery," *Nature* 624, 80–85 (2023). GNoME predicted 2.2 million crystals, 380,000 computed stable.
[^4]: Subsequent synthesis tracking reported 736 independently synthesized GNoME candidates by late 2023, a 0.2% validation rate against the 380,000 computed-stable set.
[^5]: Szymanski et al., "An autonomous laboratory for the accelerated synthesis of novel materials," *Nature* 624, 86–91 (2023). A-Lab reported 41 of 58 targets synthesized, a 63% success rate.
[^6]: Independent critique identified that approximately two-thirds of A-Lab's "novel" targets were known disordered phases, reducing the true novel discovery rate to near zero.
[^7]: Lupine validation studies document 15–60% systematic softening of defect and surface energies across six independent uMLIP studies; see climate strategy source materials.
[^8]: Lupine internal enumeration of the Li-Zr-Cl compositional space for earth-abundant halide solid electrolytes.
[^9]: Standard convex-hull screening eliminates metastable phases that are often the highest-performing candidates in cathodes, perovskites, and hydride systems.
[^10]: Lupine blind-prediction studies show that raw uMLIP rankings invert relative order for defect-mediated properties, sending experimental effort toward suboptimal candidates.
[^11]: IEA Net Zero Scenario cumulative emissions estimates; deployment timing differences in the 2035–2045 window correspond to tens of gigatonnes of CO~2~.
[^12]: Lupine partnership analysis estimates $100,000+ and person-years per failed synthesis campaign for predicted battery and catalysis targets.
[^13]: Partnership mapping document: POSCO Future M LMR mass production planned for 2025; GM targeting 2028 LMR deployment; Solid Power and Factorial Energy solid-state battery programs.
[^14]: Lupine methodology: environment error field measured from anchor observables, runtime correction with analytic forces, and 77 build-locked Lean 4 theorems with zero `sorry` proofs.
[^15]: Lupine climate strategy document: combined annual impact potential of 5–12 GtCO~2~/year across cobalt-free cathodes, halide solid electrolytes, MOF DAC, ammonia catalysts, and lead-free perovskites.
