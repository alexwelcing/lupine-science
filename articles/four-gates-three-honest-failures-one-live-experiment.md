# Four Gates, Three Honest Failures, One Live Experiment

> **Field note from the live lab**
> **Date:** 2026-07-19  
> **Deck:** A plain-language status report on our four preregistered Round-4 campaigns — what we measured, what failed, what is still running, and how you can check every number  
> **Summary:** Three of our four campaign gates have reported in, and all three are failures or abstentions — recorded, hash-locked, and explained. The fourth is running right now. This is what open-science instrumentation looks like when the answers are no.  
> **Status:** Final — updated 2026-07-20 with the Z3 verdict and the Z1 float64 confirmation

---

![The Campaign Scoreboard](images/four-gates-three-honest-failures-one-live-experiment-01-four-gates-scoreboard.jpg)

<p class="lead">Every few months we write down, in advance and in public, what our software stack must prove about itself — then we force it to actually try. This week all four of those gates reported in. All four answers are "no" — three failures and one principled abstention. None of that is a disaster; it is the point of having gates at all. Here is the final status of each campaign, in plain language, with the receipts.</p>

## The setup, in one paragraph

Modern "foundation" machine-learning potentials — in our panel, three sizes of MACE and one CHGNet — promise to predict how atoms behave without running expensive quantum simulations. If they were accurate enough, battery materials and catalysts could be screened at computer speed. The question our Round-4 campaigns ask is narrow and unforgiving: *accurate enough, by how much, measured against which references, locked before we ran anything?* Each campaign has a preregistered acceptance test (a "gate"), a locked panel of test systems, and a pipeline that records every artifact by its content hash — so a number cannot be quietly edited after the fact.

## Z1 — the battery-barrier test: failed, systematically

**The question.** Can off-the-shelf models predict how fast ions move through solid battery electrolytes? That motion is controlled by *migration barriers* — the energy hill an ion must climb between stable sites. We set the gate at a mean error of **40 millielectronvolts (meV)** against published quantum-chemical (DFT-NEB) references, across 30 chemistries the models had no business having seen.

**The answer.** Not close — and interestingly not close:

![Z1: all four models miss the barrier gate; every completed path under-predicts the barrier](images/four-gates-three-honest-failures-one-live-experiment-02-z1-barrier-mae-vs-gate.jpg)

The best model missed by 3.4×, the worst by 6×. More telling than the size of the miss is its *shape*: for the model with full per-path data, **all 26 completed paths under-predict the barrier**. Random noise scatters in both directions; a one-sided miss is a systematic bias — these models, trained mostly on near-equilibrium structures, consistently underestimate how hard it is for an ion to squeeze through a transition state. That is exactly the failure mode our "Honest Errors" program exists to catch, and it replicates, at 30-chemistry scale, a smaller five-compound result we reported (and retracted the corresponding claim for) last round.

Two honesty notes. First, 1–4 of the 30 paths per model failed to converge under the frozen protocol; the pipeline records them as failures rather than estimating around them, so the MAEs above are computed only on completed paths. Second, our first execution ran the models at reduced numerical precision (float32) against the vendor's guidance for geometry optimization. We caught it, fixed it, and re-ran the full panel at float64 — the first run stays on record as executed; the re-run is a separate measurement chain, and we report both. **The float64 verdicts are identical to within 0.1 meV (135.0 / 151.9 / 174.7 / 242.5): the miss is model error, not numerical noise — full stop.**

## Round-4 — the elastic-correction test: failed, with an amendment on file

**The question.** Can our correction layer improve foundation-model predictions of basic mechanical properties (lattice constant, bulk modulus, elastic constants) on held-out materials?

**The answer.** No — both confirmatory groups failed (0/4 and 0/1). We also found, in pre-review before ingestion, that we had violated our own preregistration: the analysis tool was written *after* the candidate lock it was supposed to precede, one property (B₀) was counted in a denominator the preregistration said was descriptive-only, and some elastic numbers rested on shakier methodology than the claim required. Rather than tidy that up quietly, we filed an **amendment** alongside the results that records each violation, what was repaired, and what cannot be retroactively rescued. The verdicts did not change under the repairs — they were failures either way, and they are now immutable, hash-verified failures.

## Z2 — the magnetism test: abstained, on purpose

**The question.** Can the panel rank magnetic-anisotropy and ordering temperatures?

**The answer.** We can't ask it — not honestly. None of the declared available models exposes the spin-orbit / non-collinear machinery the measurement requires, and no suitable locked reference panel exists. The old move in this situation is to run *something* and spin the story. Our move was an **abstention audit**: a content-addressed document stating precisely what can and cannot be claimed, plus one hash-chained "unsupported" row per model. Building a spin-capable runner is now a scoped engineering task, parked until the current campaigns close.

## Z3 — the catalyst-adsorption test: failed, and the failure taught us why

**The question.** Can a small *correction model* (Δ-learning) lift foundation-model adsorption energies to within **0.1 eV** of published DFT references on 20 held-out catalyst systems — the accuracy catalyst screening needs?

**The answer.** No — and the reason is more useful than a pass would have been. The baseline measurements (4 models × 32 systems, 128/128 completed, zero failures) confirmed the first datapoint's pattern at panel scale: every MACE variant underbinds nearly everything, with errors from −1 to **+25.6 eV** growing with molecule size.

![Z3 first datapoint: the whole miss lives at the interface](images/four-gates-three-honest-failures-one-live-experiment-03-z3-interface-error-anatomy.jpg)

Then came the honest part. The correction model was fitted on the 6 training systems and selected on the 6 validation systems, exactly as frozen — and on the 20-system holdout, **every selected correction made things worse than doing nothing**:

| Model | Raw baseline MAE | After Δ-correction | Gate ≤ 0.1 eV |
|---|---|---|---|
| chgnet | 0.69 eV | 2.27 eV | ✗ |
| mace-mp-medium | 2.11 eV | 5.01 eV | ✗ |
| mace-mp-small | 3.24 eV | 5.00 eV | ✗ |
| mace-mpa-0-medium | 4.27 eV | 5.91 eV | ✗ |

A single average shift is wrong for every family at once; a size-based fit trained on two giant plastics molecules extrapolates badly. The bias is *structured* — it depends on chemistry and molecule size — so six training points cannot learn a general fix. That is a real result: it tells us exactly what a working correction would need (a much bigger fit budget, or physics features like contact-atom counts), and it rules out the easy version forever.

The best bare-model number, chgnet's 0.69 eV, is still 6.9× the screening gate: **no current foundation MLIP is catalyst-screening accurate on adsorbates this size.** Combined with Z1's barriers and Round-4's elastics, that is three independent measurements of the same systematic direction: these models underbind — at transition states and at interfaces alike.

## Why you can check all of this

Every stage of every campaign is content-addressed: the manifest we preregistered, the locked panels, each cloud artifact, the measurement rows, and the claims registry that turns rows into verdicts. If any number in this article were edited after the fact, the hashes would stop verifying and the pipeline would refuse to publish it.

![The receipts pipeline: manifest → locked panel → cloud execution → measurement rows → ingestion and gates](images/four-gates-three-honest-failures-one-live-experiment-04-receipts-pipeline.jpg)

The formal machinery is equally explicit about its limits: the claims registry marks every gate **unsupported** until real ingestion lands, and the Lean gate-clearance theorems are labeled, in their own source, as scaffolding placeholders awaiting that evidence. We do not cite ourselves; every reference panel comes from published, external science.

## What happens next

- **Z1:** both precision chains are in and identical; ingestion turns the rows into a formal gate verdict (expected: fail — recorded, not buried).
- **Z3:** complete — baseline table and the refuted Δ-correction are on record; a viable retry needs a bigger fit budget or physics features, under a new preregistration.
- **Round-4:** a relaxed-ion elastic recompute is queued as scoped follow-up work.
- **Z2:** returns when a spin-capable runner exists.

Every one of these results is or will be on the library shelf ([library.lupine.science](https://library.lupine.science)) with the full tables, protocols, and hashes. Failing in public, with receipts. More soon.

---

## Sources and provenance

- **Z1 reference panel:** 30 chemistry-held-out DFT-NEB paths from the LiTraj nebDFT2k benchmark (*npj Computational Materials*, 2025, DOI [10.1038/s41524-025-01571-z](https://doi.org/10.1038/s41524-025-01571-z)); locked at `data/candidates/z1_nebdft2k_barriers.lock.json` (SHA-256 `192fe54a…`) in lupine-rhizo.
- **Z3 reference panel:** 32 rows from the CatBench BM_dataset adsorption benchmark (Zenodo, DOI [10.5281/zenodo.17157086](https://doi.org/10.5281/zenodo.17157086), CC BY 4.0), structures and energies from the GAME-Net study (*Nature Computational Science*, 2023, DOI [10.1038/s43588-023-00437-y](https://doi.org/10.1038/s43588-023-00437-y), VASP PBE+D2). The panel records DFT — not experimental — references, and we do not describe errors against it as error against experiment.
- **Models:** MACE-MP-0 family (Batatia et al., *A foundation model for atomistic materials chemistry*, [arXiv:2401.00096](https://arxiv.org/abs/2401.00096)); CHGNet (Deng et al., *Nature Machine Intelligence*, 2023, DOI [10.1038/s42256-023-00716-3](https://doi.org/10.1038/s42256-023-00716-3)).
- **Receipts:** campaign manifests, locked panels, measurement rows, and the preregistration amendment live in the `lupine-rhizo` repository under `campaigns/`, `data/candidates/`, `registry/`, and `docs/plans/2026-07-19-round4-preregistration-amendment.md`. The Z1/Z3 acceptance gates remain marked `unsupported` in the claims registry until ingestion completes.
