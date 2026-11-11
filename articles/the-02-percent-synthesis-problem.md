> **Date:** 2026-07-09
> **Deck:** Why most computationally predicted materials never reach a synthesis vessel, and why that matters for climate-relevant materials.
> **Summary:** A literature review: of 380,000 structures GNoME reported as computationally stable, 736 had been independently synthesized by late 2023 (about 0.2%). It describes four structural filters between a predicted crystal and a made material and the questions they raise for climate-relevant materials. A direction, not a result.
> **Updated:** 2026-11-11
> **Status:** Direction
> **Evidence Status:** Direction, not a result. Capability statements below are hypotheses we have not tested on these materials. What we have tested: in Round 4 (July 2026) our barrier, adsorption and lattice/elastic correction tests failed and the magnetism test abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models). Literature figures are attributed to their sources.

# The 0.2% Synthesis Problem

![The 0.2% Synthesis Funnel](images/the-02-percent-synthesis-problem-01-synthesis-funnel.jpg)
*Of 380,000 computationally stable structures reported by GNoME, 736 had been independently synthesized by late 2023 — about 0.2%. That is a count of independently made structures, not the outcome of a validation test.*

Computational materials science is producing candidates faster than laboratories can make them. Google DeepMind's GNoME reported 380,000 computationally stable inorganic structures, of which 736 had been independently synthesized by late 2023 — about 0.2%[^1]. The A-Lab Author Correction (Nature 650:E1, 2026) records 36 confirmed of 57 eligible targets, with 4 inconclusive and one compound removed for training-data leakage; a separate independent review disputed the novelty classification of many targets[^2].

The headline numbers are symptoms, not accidents. They point to a consistent set of bottlenecks between a predicted crystal and a made material. The International Energy Agency links batteries directly to roughly 20% of the CO₂ reductions required by 2030 and indirectly to another 40%[^3], and estimates that clean-energy investment must rise from $1.8 trillion in 2023 to roughly $4.5 trillion per year by the early 2030s for net-zero targets to stay within reach[^4]. Materials discovery is not slow in absolute terms; it is slow relative to the scale and urgency of the problem.

Our view is that the gap between prediction and synthesis needs better knowledge of where predictions go wrong, not only larger generators. That is the direction of our work; this piece is the background.

![Four Filters Between Prediction and Synthesis](images/the-02-percent-synthesis-problem-02-four-filters.jpg)
*Four structural filters separate a predicted crystal from a made material.*

## Why most predicted crystals disappear

The low number is not primarily a failure of synthesis skill. It reflects four filters that structure generators and fast predictors routinely skip.

### Filter 1: Computed stability is not synthesizability

A structure can be on the convex hull of thermodynamic stability and still be unreachable by any practical chemical route. Most screens rank candidates by DFT energy or a machine-learned surrogate of it, but the real question is whether a precursor path exists that converges to the target rather than to a competing phase, an amorphous intermediate, or decomposition. Real synthesis routes routinely produce metastable phases that convex-hull-only screening eliminates prematurely.

### Filter 2: Force-field accuracy away from equilibrium

Most screening uses universal machine-learning interatomic potentials (uMLIPs) that have never seen the reactive precursors or the real furnace environment. Deng et al. document a systematic softening of the potential energy surface in these models, with energies and forces under-predicted away from equilibrium, in environments such as surfaces, vacancies and transition states[^5]. Errors there can reorder candidate materials: a 100 meV barrier error changes the hopping rate by roughly 50× at room temperature. On our own 30-path Li-ion migration panel, four foundation MLIPs missed published DFT-NEB barriers by 135.0–242.5 meV on average (Round 4, July 2026).

![A 100 meV Barrier Error Changes Everything](images/the-02-percent-synthesis-problem-04-barrier-error.jpg)
*A 100 meV barrier error changes ionic hopping rates by roughly 50× at room temperature — enough to misclassify a conductor as an insulator.*

### Filter 3: Disorder and non-stoichiometry

Many real materials are not perfectly ordered crystals. Cation disorder, oxygen vacancies, stacking faults, and amorphous surface layers dominate functional behavior, especially in battery cathodes and solid electrolytes. Structure generators usually emit ideal unit cells; predictors usually evaluate them as written. The resulting candidates fail when the synthesized powder is not the predicted crystal.

![Where Universal Potentials Soften](images/the-02-percent-synthesis-problem-03-umlip-softening.jpg)
*Universal machine-learning interatomic potentials systematically soften the potential energy surface away from equilibrium.*

### Filter 4: The cost of a failed campaign

Each filter compounds the next. A candidate that passes an energy screen but fails in synthesis costs weeks of lab time.

## Why it matters for climate materials

Cobalt-free cathodes are a high-leverage near-term target because cobalt supply is concentrated: the IEA reports that the Democratic Republic of Congo produces roughly 70% of global cobalt[^6]. A battery chemistry that removes cobalt while preserving energy density and cycle life would remove a geopolitical and ethical constraint on electrification.

![A clean pilot corridor of three identical tube furnaces with sample boats, most boats stop on cooling racks and one intact pellet reaches a pressure-test fixture — One indigo route tracks the sole pellet that survives firing and reaches mechanical testing](images/the-02-percent-synthesis-problem-inline-01.jpg)

![Cobalt Supply and the Net-Zero Abatement Gap](images/the-02-percent-synthesis-problem-06-cobalt-climate.jpg)
*Cobalt-free cathodes would remove a supply-chain chokepoint, while clean-energy investment must more than double this decade, by IEA estimates.*

More broadly, the International Energy Agency estimates that the clean-energy technologies required for net-zero emissions must abate tens of gigatonnes of CO₂ by 2050[^7].

The window is narrow. A material discovered in 2035 can still shape 2040 deployment; one discovered in 2045 cannot. The difference is measured in cumulative emissions that no later innovation can recover.

![The Narrow Deployment Window](images/the-02-percent-synthesis-problem-07-deployment-window.jpg)
*A material discovered too late cannot recover cumulative emissions already locked in.*

## What we think is missing

Closing the gap requires moving from "stable on paper" to "synthesizable in practice". One part of that, the part we work on, is knowing where the fast models used for screening go wrong. Our hypothesis is that some of those errors are regular enough to measure as a function of local atomic environment, and in narrow cases to correct. On nine fcc metals that held for a never-fitted surface energy (three of four models; see [the fcc error-field note](/articles/a-smooth-environment-resolved-error-field/)). On Li-ion migration barriers, our correction tests failed or abstained ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)). We do not have a method that makes candidates more likely to survive synthesis.

![A single ceramic electrolyte disk clamped inside a transparent-sided pressure-and-heat cycling chamber, with a fine crack beginning at its metal interface — The chamber applies combined manufacturing pressure and heat to reveal interface cracking](images/the-02-percent-synthesis-problem-inline-02.jpg)

## From predictions to made materials

Predictions are necessary but not sufficient: the path from a better-understood model to a made material runs through labs that synthesize, characterize and scale candidates. We would like to work with labs that want an independent, preregistered measurement of how far the models behind their shortlists can be trusted. The next article in this series describes the fcc error field in more detail; its current, scoped statement is [the fcc error-field results note](/articles/a-smooth-environment-resolved-error-field/).

![An idle pellet-press station beside orderly trays of warped ceramic disks and one measurement jig holding the next candidate — The measurement jig rejects distorted pellets before they enter the pilot line](images/the-02-percent-synthesis-problem-inline-03.jpg)

![A compact battery-module assembly cell with one verified ceramic-pellet cartridge feeding a precise stack press, the rest of the factory floor is empty paper — The cartridge meters one qualified electrolyte pellet into each cell stack](images/the-02-percent-synthesis-problem-spread.jpg)
## Footnotes

[^1]: A. Merchant *et al.*, "Scaling deep learning for materials discovery," *Nature* **624**, 80–85 (2023). https://doi.org/10.1038/s41586-023-06735-9

[^2]: N. J. Szymanski *et al.*, "An autonomous laboratory for the accelerated synthesis of novel materials," *Nature* **624**, 86–91 (2023); J. Leeman *et al.*, "Challenges in High-Throughput Inorganic Materials Prediction and Autonomous Synthesis," *PRX Energy* **3**, 011002 (2024). https://doi.org/10.1038/s41586-023-06734-7; https://doi.org/10.1103/PRXEnergy.3.011002

[^3]: International Energy Agency, *Batteries and Secure Energy Transitions*, IEA, 2024.

[^4]: International Energy Agency, *World Energy Investment 2024*, IEA, 2024.

[^5]: B. Deng *et al.*, "Systematic softening in universal machine learning interatomic potentials," *npj Computational Materials* **11**, 9 (2025). https://doi.org/10.1038/s41524-024-01500-6

[^6]: International Energy Agency, *The Role of Critical Minerals in Clean Energy Transitions*, IEA, 2022.

[^7]: International Energy Agency, *Net Zero by 2050: A Roadmap for the Global Energy Sector*, IEA, 2021.

