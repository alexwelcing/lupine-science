> **Date:** 2026-07-09
> **Updated:** 2026-11-11
> **Deck:** The hand-offs between a computational screen and a working device, mapped by the kind of organisation that usually does each step, and where a measured model error would matter.
> **Summary:** A predicted crystal passes through synthesis, coating, cell fabrication, characterization, integration and manufacturing before it becomes a product. This July 2026 piece, rewritten in November 2026, maps those hand-offs by type of organisation for batteries, carbon removal, ammonia and solar absorbers, and says where knowing a model's error would help. A direction, not a result.
> **Status:** Direction
> **Evidence Status:** Direction, not a result. The organisations named in earlier versions of this page were described as partners; none is. This version names no organisation as a collaborator and cites published work only as sources. What we have tested: in Round 4 (July 2026) the raw models missed our barrier gate, our adsorption and lattice/elastic correction tests failed, and the magnetism test abstained; in Round 5 our barrier correction abstained; an error field predicted a never-fitted surface energy for nine fcc metals (three of four models).

# From Predicted Crystal to Commercial Cell

A predicted crystal is not a material. A synthesized powder is not a cell. A cell is not a fleet, a filter, a fertilizer plant or a solar farm. Between a computational screen and a deployed device stands a chain of specialized capabilities — synthesis, coating, cell fabrication, characterization, module integration and manufacturing scale-up — that no single institution owns. The question is not only "which compound is stable?" but "which compound can survive hand-off across this chain?"

![From 2.2 million predicted crystals to 736 synthesized](images/from-predicted-crystal-to-commercial-cell-01-prediction-funnel.jpg)
*GNoME reported 2.2 million predicted crystals, 380,000 of them computationally stable; 736 had been independently synthesized by late 2023 (Merchant et al., 2023).*

Generators keep getting larger. Google DeepMind's GNoME predicted 2.2 million crystals and identified 380,000 as thermodynamically stable; 736 had been independently synthesized by late 2023, about 0.2% of the stable set[^1]. The A-Lab Author Correction (Nature 650:E1, 2026) records 36 confirmed of 57 eligible targets, with 4 inconclusive and one compound removed for training-data leakage; a separate critique disputed the novelty classification of many targets[^2]. Volume is not the scarce part. Knowing which predictions to trust is.

That is the part we work on: measuring where the fast machine-learned models used for screening go wrong, against published references and pass/fail gates set in advance. This piece maps where in the hand-off chain that knowledge would matter. It does not claim that we can supply it yet.

![Six handoffs, six places for a prediction to fail](images/from-predicted-crystal-to-commercial-cell-02-handoff-chain.jpg)
*Between a computational screen and a product, a predicted material passes through a chain of hand-offs, and each can fail.*

## The hand-off chain, by type of organisation

| Stage | Who usually does it | What a prediction has to survive | Where model error would matter |
|---|---|---|---|
| Screen | Computational groups, materials databases | Ranking across very large composition spaces | Barriers, defect and surface energies that set the ranking |
| Synthesis | University and national-laboratory synthesis groups | A practical precursor route to the target phase | Metastable phases a convex-hull screen discards |
| Coating and processing | Coating and powder-processing companies | Surface reconstruction, interface stability | Interface and surface energetics |
| Device fabrication | Cell, membrane or module fabrication lines | Cycling, humidity, thermal and electrochemical stress | Degradation barriers |
| Characterization | Operando spectroscopy and microscopy facilities | Agreement between the predicted and the made structure | Whether the predicted structure is the one made |
| Integration and scale-up | Manufacturers | Cost, yield and lifetime at scale | Mostly outside what an atomistic model can say |

The earlier stages are where a model's error decides what gets made at all; the later stages are where it stops being the main risk.

![A practical cell as layered architecture — cathode, electrolyte separator, and current collector — with the ion-conduction route traced in indigo](images/from-predicted-crystal-to-commercial-cell-inline-01.jpg)

## Lane by lane

**Battery cathodes.** Cobalt-free lithium-manganese-rich cathodes depend on transition-metal migration and oxygen release, both governed by barriers at under-coordinated sites. A screen that mis-estimates those barriers would rank compositions wrongly before any synthesis group sees them.

**Solid electrolytes.** Halide and other ceramic electrolytes depend on Li⁺ hop barriers. Because ionic conductivity depends exponentially on the barrier, a barrier error of a hundred meV or more changes predicted conductivity by orders of magnitude at room temperature. On our own 30-path Li-ion migration panel, four foundation MLIPs missed published DFT-NEB barriers by 135.0–242.5 meV on average (Round 4, July 2026); see [the Z1 barrier panel](/articles/the-materials-we-test-against/).

**Carbon-removal sorbents.** Metal–organic frameworks for direct air capture fail through hydrolysis at metal–linker bonds, again an under-coordinated environment. The stakes are set by the IPCC's estimates of removal needs[^13]; we have not tested MOF hydrolysis.

**Ammonia catalysts.** Electrochemical nitrogen reduction depends on N₂ binding and dissociation at under-coordinated sites, where scaling relations propagate any error. Our only adsorption-correction test so far (Round 4, a different catalyst panel) made errors worse.

**Lead-free perovskite absorbers.** Tin perovskites oxidize through Sn vacancy formation. In our own measurement on lead-free halide perovskites, four uMLIPs disagreed on neutral B-site vacancy formation energies by 0.5–1.8 eV ([The Correction That Hurt](/articles/the-correction-that-hurt-and-the-theorem-that-stopped-it/)), so ranking candidates on any single raw potential is not yet meaningful there.

![A waist-high pilot line on a bare factory floor: a covered powder hopper feeds one compact sintering furnace, then a ceramic pellet exits onto a cell-test cradle — One continuous indigo material route follows the sample from hopper through furnace to the test cradle](images/from-predicted-crystal-to-commercial-cell-inline-03.jpg)

## What we have tested so far

None of the materials in this piece has been tested by us end to end. The results that bear on the hand-off chain:

- **Barriers.** In Round 4 (July 2026), MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV gate on 30 Li-ion migration paths (MAE 135.0–242.5 meV on completed paths). In Round 5 a direction-gated barrier correction abstained for all four models, so none was applied. See [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/).
- **Adsorption.** Every selected Δ-correction made catalyst-adsorption holdout error worse ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)).
- **Surfaces of fcc metals.** For nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models) ([the fcc error field](/articles/a-smooth-environment-resolved-error-field/)).

## Where this is aimed

The scarce resource in this chain is not prediction volume; it is knowing which predictions deserve the work. We would like to work with synthesis, characterization and device groups that want an independent, preregistered measurement of how far the models behind their shortlists can be trusted on their systems. The record and methods are open.

![An empty electric-bus depot beneath a broad solar canopy, with a quiet row of stationary battery cabinets beside the charging bays and a vast pale sky — The battery cabinets buffer power from the canopy before it reaches the charging pedestals](images/from-predicted-crystal-to-commercial-cell-spread.jpg)

## Footnotes

[^1]: A. Merchant *et al.*, "Scaling deep learning for materials discovery," *Nature* **624**, 80–85 (2023). https://doi.org/10.1038/s41586-023-06735-9

[^2]: N. J. Szymanski *et al.*, "An autonomous laboratory for the accelerated synthesis of novel materials," *Nature* **624**, 86–91 (2023); J. Leeman *et al.*, "Challenges in High-Throughput Inorganic Materials Prediction and Autonomous Synthesis," *PRX Energy* **3**, 011002 (2024). https://doi.org/10.1038/s41586-023-06734-7; https://doi.org/10.1103/PRXEnergy.3.011002

[^13]: IPCC, *Climate Change 2022: Mitigation of Climate Change*, Working Group III Contribution to AR6, Cambridge University Press, 2022.
