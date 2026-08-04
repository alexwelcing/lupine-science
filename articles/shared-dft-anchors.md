# Sharing DFT anchors reduces projected evaluations by 72.4%

> **Type:** proof-pack
> **Date:** 2026-08-03
> **Deck:** A frozen, artifact-backed analysis of 29 analyzable diffusion paths compares four separately evaluated sparse-anchor sets with their shared union.
> **Summary:** Under the preregistered sparse-anchor rule, the locked Z1 records require 558 projected DFT evaluations when four model-specific anchor sets are counted separately and 154 when duplicate image indices are shared: 72.4% fewer DFT evaluations.
> **Status:** Published
> **OG Image:** /articles/shared-dft-anchors/hero.jpg

<div class="callout claim">
  <strong>Claim.</strong> On the locked Z1 panel’s 29 analyzable paths, sharing identical sparse-anchor image indices across four universal interatomic-potential guides reduces the projected DFT evaluation count from 558 to 154: 72.4% fewer DFT evaluations.
</div>

<p class="lead">Reference calculations are the scarce part of many atomistic workflows. This proof pack asks a narrow accounting question: if four models nominate sparse images on the same paths, how many distinct reference evaluations remain after identical image indices are evaluated once and shared?</p>

<div class="cta">
  <p><strong>Evidence proof pack:</strong> publication PDF with the locked figure, method, boundaries, bibliography, and audit links.</p>
  <a href="/proof-packs/shared-dft-anchors.proofpack.pdf" download>Download the arXiv-ready PDF →</a>
</div>

## Abstract

We analyze recorded prediction profiles from four universal machine-learned interatomic potentials on a locked panel of diffusion paths. A frozen rule selects endpoints, a predicted minimum, and a bounded neighborhood around the predicted maximum for each available model–path profile. The separate-model accounting contains 558 projected reference evaluations. Deduplicating equal image indices within each path leaves a union of 154 projected evaluations, or **72.4% fewer DFT evaluations**. One panel path is excluded because all four recorded artifacts lack a converged prediction profile; three additional paths retain only their available model records, without imputation. This is prediction-side accounting, not a claim that the shared set has already been evaluated by DFT, not an accuracy result, and not a universal savings rate.

## Result

<figure>
  <img src="images/projected-evaluation-counts.png" alt="Horizontal comparison of 558 projected separate-model DFT evaluations and 154 projected shared-union evaluations, labeled 72.4 percent fewer across 29 analyzable paths.">
  <figcaption><strong>Figure 1.</strong> Frozen evaluation-count comparison on the 29 analyzable Z1 paths. The two bars report the separate-model anchor count and the deduplicated within-path union count. <span class="figure-source">Source: committed machine-readable analysis record; figure checksum is locked in the proof-pack manifest.</span></figcaption>
</figure>

| Accounting basis | Analyzable paths | Projected DFT evaluations |
|---|---:|---:|
| Four model-specific anchor sets, counted separately | 29 | 558 |
| Within-path union of identical image indices | 29 | 154 |

The percentage is reported exactly as the reviewed public claim. No dollar amount, wall-time conversion, annualization, or additional economic multiplier is inferred in this paper.

## Method

For model \(m\) and path \(p\), let \(A(m,p)\) be the anchor indices selected from the recorded predicted image-energy profile. The frozen rule includes both endpoints, the predicted minimum, and a clamped neighborhood around the predicted maximum. The separate-model total counts every available \(A(m,p)\). The shared total counts each index in the within-path union only once.

The analysis reads the locked panel and four recorded campaign artifacts. It does not rerun DFT. Input SHA-256 digests are stored in the machine-readable record. The accompanying script reproduces the JSON from repository-relative local artifacts or the recorded object locations; a pinned recording timestamp supports byte-for-byte JSON verification.

## Exclusions and fail-closed handling

The panel contains 30 paths, but the primary denominator is 29 analyzable paths. One path lacks a converged prediction profile in every model artifact and is excluded rather than imputed. Three paths have partial model coverage; their available profiles are included and their missing profiles remain missing. The record preserves per-model failure entries.

The result is deliberately separate from any realized execution record. This paper does not combine projected and realized denominators, does not substitute one anchor count for another, and does not infer a new percentage from a different campaign.

## What the result establishes

- It establishes the projected reference-evaluation count under one frozen selection rule on one locked panel.
- It shows that identical image indices nominated by different model guides can be deduplicated before reference evaluation.
- It provides a machine-readable record, input digests, a deterministic analysis script, and a locked figure.

## What the result does not establish

- It does not show that the 154-member union has been evaluated by DFT.
- It does not establish accuracy parity between shared and separately evaluated anchors.
- It does not estimate dollars, wall time, energy use, or emissions.
- It does not claim that 72.4% transfers to other panels, chemistries, engines, model sets, or anchor rules.
- It does not upgrade literature items that remain marked unverified or abstract-only in the underlying research digests.

## Historical context

The nudged elastic band method made a discrete chain of images a standard way to optimize minimum-energy paths. Later surrogate-assisted NEB work reduced the number of expensive evaluations required inside a single search. The present result addresses a different reuse boundary: multiple model guides nominate images on the same path, and identical reference-evaluation sites are shared across those guides. The context is established by independent literature; the 558-to-154 measurement itself is supported by the internal auditable record linked below, not by those papers.

## Reproduction and audit

From the released data pack, verify all file digests with:

`sha256sum -c MANIFEST.sha256`

Recompute the union-anchor JSON with the released `union_anchor_economics.py`, the recorded local inputs, and the pinned `--recorded-at` timestamp documented in the pack README. Compare the resulting JSON against its SHA-256 sidecar. The proof-pack manifest separately locks the figure input and generated PDF.

## Bibliography

1. Henkelman, G.; Uberuaga, B. P.; Jónsson, H. *A climbing image nudged elastic band method for finding saddle points and minimum energy paths.* Journal of Chemical Physics 113, 9901–9904 (2000). DOI: [10.1063/1.1329672](https://doi.org/10.1063/1.1329672).
2. Garrido Torres, J. A.; Jennings, P. C.; Hansen, M. H.; Boes, J. R.; Bligaard, T. *Low-Scaling Algorithm for Nudged Elastic Band Calculations Using a Surrogate Machine Learning Model.* Physical Review Letters 122, 156001 (2019). DOI: [10.1103/PhysRevLett.122.156001](https://doi.org/10.1103/PhysRevLett.122.156001).
3. Deng, B. et al. *CHGNet as a pretrained universal neural network potential for charge-informed atomistic modelling.* Nature Machine Intelligence 5, 1031–1041 (2023). DOI: [10.1038/s42256-023-00716-3](https://doi.org/10.1038/s42256-023-00716-3).

## Audit links

- [Released data and reproduction pack](/data/savings-stack-v1/README.md)
- [Machine-readable union-anchor record](/data/savings-stack-v1/z1-union-anchor-economics.json)
- [SHA-256 sidecar](/data/savings-stack-v1/z1-union-anchor-economics.json.sha256)
- [Analysis note](/data/savings-stack-v1/z1-union-anchor-economics.md)
- [Reproduction script](/data/savings-stack-v1/union_anchor_economics.py)
- [Citation identifier audit](/data/savings-stack-v1/citation-verification-2026-07-21.md)
- [Complete data-pack manifest](/data/savings-stack-v1/MANIFEST.sha256)

---

**Author:** Alex Welcing · **Institution:** Lupine Science · **Evidence cutoff:** 2026-07-21 · **Editorial status:** Independently reviewed and approved for publication 2026-08-03.
