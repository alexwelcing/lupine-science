# Round 4: Three Failures and One Abstention, Preregistered

> **Type:** Results note
> **Date:** 2026-07-19  
> **Updated:** 2026-11-11
> **Deck:** A plain-language report on our four preregistered Round-4 campaigns (July 2026): what we measured, what failed, what abstained, and how to check every number  
> **Summary:** In four preregistered campaigns in July 2026 (Round 4), no gate passed: three failed and one abstained. MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet missed a 40 meV migration-barrier gate (MAE 135.0–242.5 meV on completed paths); a lattice- and elastic-constant correction on rocksalt ionics and perovskites failed; every selected Δ-correction made catalyst-adsorption holdout error worse; and the magnetism campaign abstained. Each result is hash-locked, including our own preregistration violations.  
> **Status:** Published
> **Evidence Status:** Four preregistered Round-4 campaigns, July 2026; updated 2026-07-20 with the Z3 verdict and the Z1 float64 confirmation. Verdicts are hash-locked. The Round-4 analysis tool was committed after the measurements existed; the amendment that records this is listed under Sources. Not peer-reviewed.
> **Featured:** 1
> **Ontology:** T2, T6, E4

---

![Four rigorous test gates — battery barriers, elastic response, magnetism, catalyst adsorption — three paths stopped, one still under measurement](images/four-gates-three-honest-failures-one-live-experiment-hero--retry-1.jpg)

<p class="lead">Every few months we write down, in advance and in public, what our software stack must prove about itself — then we force it to actually try. This week all four of those gates reported in. All four answers are "no" — three failures and one principled abstention. None of that is a disaster; it is the point of having gates at all. Here is the final status of each campaign, in plain language, with the receipts. None of it is peer-reviewed.</p>

## The setup, in one paragraph

Modern "foundation" machine-learning potentials — in our panel, MACE-MP-0 small and medium, MACE-MPA-0 medium and CHGNet — promise to predict how atoms behave without running expensive quantum simulations. If they were accurate enough, battery materials and catalysts could be screened at computer speed. The question our Round-4 campaigns ask is narrow and unforgiving: *accurate enough, by how much, measured against which references, locked before we ran anything?* Each campaign has a preregistered acceptance test (a "gate"), a locked panel of test systems, and a pipeline that records every artifact by its content hash — so a number cannot be quietly edited after the fact.

## Z1 — the battery-barrier test: failed, systematically

**The question.** Can off-the-shelf models predict how fast ions move through solid battery electrolytes? That motion is controlled by *migration barriers* — the energy hill an ion must climb between stable sites. We set the gate at a mean error of **40 millielectronvolts (meV)** against published quantum-chemical (DFT-NEB) references, across 30 paths the benchmark holds out by chemistry. (We have not audited the models' training data for overlap with these paths.)

![A solid-electrolyte migration rig with one ink ridge formed by measurement pins and a lower indigo trajectory passing beneath it — The rig exposes systematic underestimation of the ion migration barrier](images/four-gates-three-honest-failures-one-live-experiment-inline-01.jpg)

**The answer.** Not close — and interestingly not close:

![Z1: all four models miss the 40 meV barrier gate](images/four-gates-three-honest-failures-one-live-experiment-02-z1-barrier-mae-vs-gate.jpg)

The best model missed by 3.4×, the worst by 6×. More telling than the size of the miss is its *shape*: for the model with full per-path data, **all 26 completed paths under-predict the barrier**. Random noise scatters in both directions; a one-sided miss is a systematic bias. That model, on this panel, consistently underestimates how hard it is for an ion to squeeze through a transition state. We have per-path signs for that one model only, so we do not extend the direction to the other three. The pattern matches, at 30-path scale, a smaller five-compound result we reported (and retracted the corresponding claim for) last round.

Two honesty notes. First, 1–4 of the 30 paths per model failed to converge under the frozen protocol; the pipeline records them as failures rather than estimating around them, so the MAEs above are computed only on completed paths. Second, our first execution ran the models at reduced numerical precision (float32) against the vendor's guidance for geometry optimization. We caught it, fixed it, and re-ran the full panel at float64 — the first run stays on record as executed; the re-run is a separate measurement chain, and we report both. **The float64 verdicts are identical to within 0.1 meV (135.0 / 151.9 / 174.7 / 242.5 meV): the miss is not a numerical-precision artifact.**

## The lattice- and elastic-constant correction test: failed, with an amendment on file

**The question.** Can a ratio-rule correction improve foundation-model lattice and elastic constants on held-out rocksalt ionics and perovskites?

**The answer.** No. Both confirmatory groups failed: rocksalt ionics 0 of 4 properties, perovskites 0 of 1. The perovskite group's one confirmatory property is the lattice constant, because an amendment written after the measurements existed moved its elastic constants to exploratory. This test is separate from our cubic-metal elastic results and does not measure them. We also found, in pre-review before ingestion, that we had violated our own preregistration: the analysis tool was written *after* the candidate lock it was supposed to precede, one property (B₀) was counted in a denominator the preregistration said was descriptive-only, and some elastic numbers rested on shakier methodology than the claim required. Rather than tidy that up quietly, we filed an **amendment** alongside the results that records each violation, what was repaired, and what cannot be retroactively rescued. The verdicts did not change under the repairs — they were failures either way, and they are now immutable, hash-verified failures.

## Z2 — the magnetism test: abstained, on purpose

**The question.** Can the panel rank magnetic-anisotropy and ordering temperatures?

**The answer.** We can't ask it — not honestly. None of the declared available models exposes the spin-orbit / non-collinear machinery the measurement requires, and no suitable locked reference panel exists. The old move in this situation is to run *something* and spin the story. Our move was an **abstention audit**: a content-addressed document stating precisely what can and cannot be claimed, plus one hash-chained "unsupported" row per model. Building a spin-capable runner is now a scoped engineering task, parked until the current campaigns close.

## Z3 — the catalyst-adsorption test: failed, and the failure taught us why

**The question.** Can a small *correction model* (Δ-learning) lift foundation-model adsorption energies to within **0.1 eV** of published DFT references on 20 held-out catalyst systems — the accuracy catalyst screening needs?

![A magnetic specimen rests in a sealed side tray outside a nonmagnetic correction fixture whose empty cradle is clearly incompatible — The workflow abstains by keeping unsupported magnetic material outside the correction fixture](images/four-gates-three-honest-failures-one-live-experiment-inline-03.jpg)

**The answer.** No — and the reason is more useful than a pass would have been. The baseline measurements (4 models × 32 systems, 128/128 completed, zero failures) confirmed the first datapoint's pattern at panel scale: on this panel every MACE variant underbinds nearly every system, with errors from −1 to **+25.6 eV** growing with molecule size.

![Z3 first datapoint: the whole miss lives at the interface](images/four-gates-three-honest-failures-one-live-experiment-03-z3-interface-error-anatomy.jpg)

Then came the honest part. The correction model was fitted on the 6 training systems and selected on the 6 validation systems, exactly as frozen — and on the 20-system holdout, **every selected correction made things worse than doing nothing**:

| Model | Raw baseline MAE | After Δ-correction | Gate ≤ 0.1 eV |
|---|---|---|---|
| chgnet | 0.69 eV | 2.27 eV | ✗ |
| mace-mp-medium | 2.11 eV | 5.01 eV | ✗ |
| mace-mp-small | 3.24 eV | 5.00 eV | ✗ |
| mace-mpa-0-medium | 4.27 eV | 5.91 eV | ✗ |

A single average shift is wrong for every family at once; a size-based fit trained on two giant plastics molecules extrapolates badly. The bias is *structured* — it depends on chemistry and molecule size — so six training points cannot learn a general fix. That is a real result: it tells us what a working correction would need (a much bigger fit budget, or physics features like contact-atom counts), and it rules out this simple version on this panel.

The best bare-model number, chgnet's 0.69 eV, is still 6.9× the screening gate: **none of the four models we tested is accurate enough for catalyst screening on adsorbates this size.**

## Why you can check all of this

Every stage of every campaign is content-addressed: the manifest we preregistered, the locked panels, each cloud artifact, the measurement rows, and the claims registry that turns rows into verdicts. If a recorded number were edited after the fact, its hash would stop verifying.

![The receipts pipeline: manifest → locked panel → cloud execution → measurement rows → ingestion and gates](images/four-gates-three-honest-failures-one-live-experiment-04-receipts-pipeline.jpg)

The measurements have since been ingested: the claims registry records the Z1 barrier and Z3 adsorption accuracy claims as **contradicted**, and the Lean registry records both acceptance gates as refuted by the ingested evidence. The magnetism claim is still marked pending in the registry; on this page it is an abstention. Lean checks the arithmetic of those gate comparisons, not the physics, the reference data or the pipeline. Every reference panel comes from published, external science.

## What happened next

*Updated 2026-11-11.*

- **Z1:** ingested; the gate failed, as recorded above. In Round 5 (preregistered 2026-07-20) we tested a direction-gated barrier correction on this same panel, fitted on a disjoint 12-path training panel. All four models abstained at the direction gate, so no correction was applied; the outcome is on the [Z1 barrier panel page](/articles/the-materials-we-test-against/). A sparse-DFT pilot on the same panel is reported, with its amendments, in [Sharing DFT anchors](/articles/shared-dft-anchors/).
- **Z3:** complete. A retry would need a bigger fit budget or physics features under a new preregistration; none has been run.
- **Lattice and elastic constants:** the follow-up preregistrations written in August 2026 have not been run, so there is no later result.
- **Z2:** returns when a spin-capable runner exists.

The full tables, protocols and hashes are in the [Library](https://library.lupine.science) and the open repository.

---

## Sources and provenance

- **Z1 reference panel:** 30 chemistry-held-out DFT-NEB paths from the LiTraj nebDFT2k benchmark (*npj Computational Materials*, 2025, DOI [10.1038/s41524-025-01571-z](https://doi.org/10.1038/s41524-025-01571-z)); locked at `data/candidates/z1_nebdft2k_barriers.lock.json` (SHA-256 `192fe54a…`) in lupine-rhizo.
- **Z3 reference panel:** 32 rows from the CatBench BM_dataset adsorption benchmark (Zenodo, DOI [10.5281/zenodo.17157086](https://doi.org/10.5281/zenodo.17157086), CC BY 4.0), structures and energies from the GAME-Net study (*Nature Computational Science*, 2023, DOI [10.1038/s43588-023-00437-y](https://doi.org/10.1038/s43588-023-00437-y), VASP PBE+D2). The panel records DFT — not experimental — references, and we do not describe errors against it as error against experiment.
- **Models:** MACE-MP-0 family (Batatia et al., *A foundation model for atomistic materials chemistry*, [arXiv:2401.00096](https://arxiv.org/abs/2401.00096)); CHGNet (Deng et al., *Nature Machine Intelligence*, 2023, DOI [10.1038/s42256-023-00716-3](https://doi.org/10.1038/s42256-023-00716-3)).
- **Receipts:** campaign manifests, locked panels, measurement rows, and the preregistration amendment live in the `lupine-rhizo` repository under `campaigns/`, `data/candidates/`, `registry/`, and `docs/plans/2026-07-19-round4-preregistration-amendment.md`. The claims registry records the Z1 and Z3 accuracy claims as `contradicted`.
