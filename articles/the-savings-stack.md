# The Savings Stack: A Booklet on Doing Less, and the Commons That Makes Everyone Faster

> **Release:** Savings Stack v1 — booklet + data pack
> **Date:** 2026-07-21  
> **Deck:** Seven savings layers from the literature, one measured sharing economy, and the theorem commons — as a free, designed booklet with a hashable data pack  
> **Summary:** The Savings Stack v1 release: a 16-page booklet on compute-savings in atomistic simulation — 72.4% fewer DFT evaluations when four models share anchors (558 naive vs 154 union, 29 paths, 3.62×), 163 citations verified, every number hashable and reproducible.  
> **Status:** Final
> **OG Image:** /articles/the-savings-stack/hero.jpg
> **Artifacts:** [the booklet (PDF)](/booklets/the-savings-stack.pdf), [the v1 data pack](/data/savings-stack-v1/README.md) with sha256 manifest, and full scientific detail in the [Library](https://library.lupine.science) (group “savings-stack”)

<p class="lead">Today we are releasing <em>The Savings Stack</em> — a sixteen-page booklet on how atomistic simulation learned to do less, what that savings stack is still missing, and the measured economics of sharing the expensive part. It is a free download, built to be read: the literature digests, the union-anchor measurement, and the citation audit are all in the pack behind it, hashed and reproducible.</p>

<div class="cta">
  <p><strong>Download:</strong> The Savings Stack — 16 pages, US Letter, free.</p>
  <a href="/booklets/the-savings-stack.pdf" download>Get the booklet (PDF, 748 KB) →</a>
</div>

## Inside the booklet

The booklet is the designed edition of the Savings Stack v1 release: typography-led, one idea per page, every number anchored to the committed record.

![The seven-layer stack, drawn to scale — each layer with its strongest verified literature number, the shared crack “no certificate” through all seven, and the missing capstone layer](images/spread-stack.jpg)

Seven chapters of the underlying book survey the savings layers the field invented independently — surrogate transition-state search, active learning, Δ-learning, abstention economics, systems-level DFT acceleration, electronic-structure surrogates, and path and sampling algorithms — each with its strongest verified number and its named hole. Two backdrop chapters cover four decades of supercomputing economics and today's compute-resourcing landscape. The hole is the same shape in every layer: plenty of signals for where the model is <em>probably</em> wrong, no certificate for where physics is <em>definitely</em> violated.

![The big-number page: 72.4% fewer DFT evaluations when four models share anchors instead of each paying for its own](images/spread-big-number.jpg)

![The chart: naive per-model anchor cost explodes 139.5 → 558 as models go from one to four, while the shared union stays nearly flat at 139.5 → 154](images/spread-chart.jpg)

## The measured core, in one paragraph

On the locked 30-path Z1 panel, path 14 failed CI-NEB convergence in all four model artifacts — the honest denominator is 29. Across those 29 analyzable diffusion paths, the frozen sparse-anchor protocol would consume **558 naive per-model DFT anchors; shared across the four models, the union is 154 — 72.4% fewer evaluations, a 3.62× reduction.** The scaling law is the headline: as guidance models go from one to four, the naive bill multiplies ~4× (139.5, 279, 418.5, 558) while the union stays nearly flat (139.5, 147.8, 152, 154) — four models of guidance cost ~10% more DFT than one. The numbers were recomputed from recorded campaign artifacts under the frozen anchor rule; an earlier informal figure was retracted as arithmetic drift, and the analysis note in the pack reconciles it line by line. No new DFT was run to produce any of it.

## What it is — and what it is not

The booklet makes the case for a <em>theorem commons</em>: teams contributing formally verified physical-law theorems back, so everyone's gates get sharper. Theorems are non-rival and leak nothing about the contributor's chemistry; the measured union economics are the evaluation-side instance of the same sharing. The case for restraint is designed with equal care: the measured basis is one 30-path panel, four universal MLIPs, one DFT engine, one chemistry family; the multiplicative stacking figure is a derived estimate and is labeled as such wherever it appears; the digests keep their [UNVERIFIED] flags; and none of this is peer-reviewed — it is a research release with committed, hashable records.

The citation audit behind the book verified every identifier against its registry: **115/115 arXiv, 48/48 DOI, zero unresolved** — with three corrections applied on the record, including the VASP MLFF venue reconciliation. Identifier verification does not upgrade abstract-only evidence, and the booklet says so.

## Data and reproduction

The booklet is the cover story; the pack is the evidence. [The v1 pack](/data/savings-stack-v1/README.md) ships all ten chapters, the machine-readable union-anchor record ([JSON](/data/savings-stack-v1/z1-union-anchor-economics.json) + [sha256 sidecar](/data/savings-stack-v1/z1-union-anchor-economics.json.sha256)), the [analysis note](/data/savings-stack-v1/z1-union-anchor-economics.md) and [script](/data/savings-stack-v1/union_anchor_economics.py), the [citation audit](/data/savings-stack-v1/citation-verification-2026-07-21.md), and a [MANIFEST.sha256](/data/savings-stack-v1/MANIFEST.sha256) over every file. Structured data is released under the Open Data Commons Open Database License 1.0 (ODbL-1.0), mirroring the source repository's data license; prose and code keep their repository licenses.

`sha256sum -c MANIFEST.sha256` verifies the pack; `python3 union_anchor_economics.py --local <artifacts> --out z1-union-anchor-economics.json` recomputes the record.

## Receipts

- The booklet: [the-savings-stack.pdf](/booklets/the-savings-stack.pdf) (16 pages, Letter; source and build script in the repository)
- The data pack: [/data/savings-stack-v1/](/data/savings-stack-v1/README.md) — ten chapters, record + sidecar, analysis note + script, audit, manifest
- Full scientific detail: [library.lupine.science](https://library.lupine.science), group “savings-stack”

<div class="cta">
  <p><strong>Next:</strong> read the booklet, hash the pack, recompute the record.</p>
  <a href="/booklets/the-savings-stack.pdf" download>Download The Savings Stack →</a>
</div>
