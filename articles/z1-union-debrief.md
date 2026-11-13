# The Z1 Sparse-Anchor Pilot: A De-brief (July 2026)

> **Date:** 2026-07-24  
> **Updated:** 2026-11-11
> **Deck:** A working de-brief on the July 2026 sparse-DFT anchor pilot on the Z1 barrier panel, kept for the record
> **Summary:** Archived. The pilot's preregistered accuracy gate failed; its passing check is a same-engine self-consistency check adopted by an amendment written after that failure, and against the published references the pilot was about 700 meV off.
> **Status:** Archived
> **Archived:** 2026-11-11
> **Superseded By:** /articles/shared-dft-anchors/
> **Archive Note:** This July 2026 de-brief was a working draft published before editing. Its "strong win" is a same-engine self-consistency check written in after a failure, not an accuracy result: against the published references the pilot was about 700 meV off. The current account is the dated section "What happened when we ran it" in Sharing DFT Anchors.
> **Ontology:** T6, E4, MC4

---

<p class="lead">This page held a working de-brief of the Z1 sparse-anchor pilot, written on 24 July 2026 and published before it was edited for the public. We have kept its URL and its measured content, removed the internal framing and a cost figure whose provenance we have not reconciled, and relabelled its verdict. The current account is in <a href="/articles/shared-dft-anchors/">Sharing DFT anchors</a>.</p>

## What the pilot set out to test

A universal MLIP might guide DFT to a handful of anchor points near a predicted transition state, so that a sparse barrier assembled from those anchors recovers the dense-DFT barrier. Several models could then share the same anchors, because the anchors are model-independent evaluations and only the guidance differs.

## What it found

- **The preregistered gate failed.** The pilot was preregistered on 2026-07-20 against the panel's published VASP reference barriers, with a 40 meV gate. Path 7 missed it at 118.8 meV.
- **The gate was moved after that failure.** Amendment 01 (2026-07-21) made the primary gate a same-engine comparison: sparse GPAW barriers against a dense GPAW profile of the same images. Amendment 02 (2026-07-21) loosened two GPAW settings after a one-path revalidation.
- **The same-engine check passed, and it is a self-consistency check.** On the 23 paths that ran, every image was evaluated (the paths have 5–7 images), and sparse barriers matched the dense same-engine profile to within 0.0–6.8 meV for all four models. The draft called this a "strong win"; with every image evaluated, the agreement is close to guaranteed by construction, and it is not an accuracy result.
- **Against the published references the pilot was about 700 meV off:** a mean absolute error of 693.0–705.7 meV. The GPAW–VASP energy offset varied from image to image on 22 of the 23 paths (mean variation 952 meV).
- **Seven large-cell paths were deferred** and have no verdict.

![A broad array of untouched electrolyte coupons surrounding a compact central route through three shared physical diffusion-test stations — The union route reuses shared stations instead of repeating every possible barrier test](images/z1-union-debrief-inline-01.jpg)

## Caveats the draft already listed

1. On paths of seven images or fewer, the sparse protocol is nearly dense by design; whether sparse anchors stay accurate on longer paths is untested.
2. The VASP-referenced comparison is contaminated by engine offsets on 22 of 23 paths; a GPAW–VASP equivalence claim is not ours to make.
3. One panel, one chemistry family (Li migration, LiTraj), one engine, one functional.
4. Two models missed the true saddle on some paths; where and why is uncharacterized.

## Records

- Campaign machine record: `data/candidates/z1-union-campaign.json` (sha256-pinned) in the [open repository](https://github.com/alexwelcing/lupine-rhizo)
- Preregistration and amendments: `docs/plans/2026-07-20-sparse-dft-pilot-preregistration.md`, `docs/plans/2026-07-21-sparse-dft-pilot-amendment-01.md`, `docs/plans/2026-07-21-sparse-dft-pilot-amendment-02.md`
- Projected anchor accounting (the 558/154 record): [Sharing DFT anchors](/articles/shared-dft-anchors/)
