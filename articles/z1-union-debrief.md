# The Union Verdict: A De-brief on the Z1 Campaign

> **Field note from the live lab**
> **Date:** 2026-07-24  
> **Deck:** The full account you asked for before we talk — the verdict, the economics, the failures, the catches, and where I'd push back  
> **Summary:** All four models scored strong-win on the same-engine gate, with a measured cost of $14.65 per 129 anchors. The interesting parts are not the wins — they're the guidance split, the bounded public economics, and what broke along the way.
> **Status:** FOR EDITOR REVIEW — draft for the lead, pre-conversation; not for citation
> **Ontology:** T6, E4, MC4

---

<p class="lead">You asked for the complete picture before our conversation, so here it is as I'd give it across the desk: what we set out to prove, what the campaign actually said, what it cost, what broke, and the places I'd push back before anyone quotes these numbers. The receipts for every claim are one click away in the Library, and the monitoring bug and two of the review catches below are mine — I've marked them.</p>

## What we set out to prove

The thesis under test: a universal MLIP can guide DFT to a handful of anchor points near a predicted transition state, and a sparse barrier assembled from those anchors recovers the dense-DFT barrier — and further, that several architecturally different models can *share* those anchors, because the anchors are model-independent evaluations and only the guidance differs. If both hold, barrier chemistry stops being a per-model expense and becomes shared infrastructure: every additional model's guidance validated at near-zero marginal cost.

## The verdict

**All four models scored STRONG_WIN** — same-engine sparse-barrier MAE within the ≤15 meV gate (WIN gate is 40):

![A broad array of untouched electrolyte coupons surrounding a compact central route through three shared physical diffusion-test stations — The union route reuses shared stations instead of repeating every possible barrier test](images/z1-union-debrief-inline-01.jpg)

- **chgnet: 0.0 meV** over 22 guided paths
- **mace-mp-medium: 0.0 meV** over 22
- **mace-mp-small: 6.8 meV** over 21
- **mace-mpa-0-medium: 6.8 meV** over 21

129 of 129 anchors evaluated, zero failures, zero memory skips. Full table and per-path breakdown in the [verdict of record](https://library.lupine.science/#/read/z1-union-campaign-verdict).

Two honest notes before the headline goes further. First, the split inside that win is the real result: chgnet and mace-mp-medium located the true extrema on *every* guided path — their sparse barriers are exactly the dense barriers, and our union law theorem explains why that must be so. mace-mp-small and mace-mpa-0 *missed* the true saddle on some paths, and their 6.8 meV deficit is pure undercoverage error. The protocol now **ranks model guidance for free** — a capability we did not have last week. Second, the gate's teeth are thin on short paths: with 5–7 images, our dense extension makes "sparse" nearly equal "dense" by construction, so part of the verdict is structural. What is *not* structural: the guidance split, the economics, and the cost. The true stress test of sparsity is a longer-path panel — that is question one for us.

## The economics, measured

- Approved public sharing result: **72.4% fewer DFT evaluations.** The reviewed basis and scope are preserved in the [union-anchor record](https://library.lupine.science/#/read/z1-union-anchor-economics).
- Measured execution cost: **$14.65 per 129 anchors.** The full ledger is in the [cost record](https://library.lupine.science/#/read/z1-union-cost-ledger).
- Other campaign-specific ratios, comparisons, and local-energy estimates remain outside approved public copy pending review.
- The best illustration: path-16 consumed **62 CPU-hours** at the old frozen settings and never produced a receipt. At the adopted settings it ran at **about five minutes an anchor.**

## The journey, honestly

This did not go straight. **Path-7 failed** at 118.8 meV and the failure turned out to be the most valuable datapoint of the campaign: the GPAW↔VASP offset isn't constant, it *wanders* — 139 meV on path-7, up to 4.2 eV on path-0 — and barriers difference energies, so wander lands on the verdict. That became amendment 01 (same-engine basis), the T1 wander gate, and eventually a machine-checked theorem: barrier error is bounded by offset wander, never by the offset's size. The measured MAE (693–706 meV) sits under the mean wander (952 meV), as the law requires.

**Path-16's 62 CPU-hours** forced your call: frozen runs are investment-grade. The escape was a 12-anchor revalidation — Gamma k-points and a looser grid, each gated against a pre-agreed 5 meV criterion. Both passed, and the combined profile passed (−4.36 meV) after a code-review bot caught *my* invalid adoption of the untested combination 40 minutes after I wrote it. The fix cost 18 minutes of compute.

The wander itself then got a mechanism: the extreme cases are **metallic transition states** (0.018 eV gap at path-0's saddle) where the two engines converge to different electronic descriptions on exactly that image. And when GPAW warned that a 34.4° skewed cell might corrupt its own results, we audited instead of hoping: [barrier shifted 3.5 meV](https://library.lupine.science/#/read/t1-niggli-audit), valid. That is the third instance of the pattern this campaign produced — convention offsets, settings offsets, cell offsets: barriers cancel constants; only wander matters.

## What this does not prove

I'd want these five caveats attached to any external use:

![Five battery-material coupons ordered along a bench beneath spring-loaded response gauges, the pointer order agrees while every predicted stop sits short of its measured stop — The gauges preserve candidate ranking while exposing underestimated barrier magnitude](images/z1-union-debrief-inline-02.jpg)

1. Short-path structure: on ≤7-image paths the sparse protocol is nearly dense by design. The accuracy-of-sparsity claim is untested at length.
2. The VASP-referenced basis is contaminated across 22 of 23 paths (mean wander 952 meV). We measured it, bounded it, and explained the extreme cases — but a GPAW↔VASP equivalence claim is not ours to make yet.
3. One panel, one chemistry family (Li-migration LiTraj), one engine, one functional.
4. Seven ≥159-atom paths remain deferred; their verdicts are pending, not absent.
5. Two models showed guidance misses; where and why is uncharacterized.

## What outlasts the campaign

The [BarrierTransfer theorem family](https://library.lupine.science/#/read/z1-union-anchor-economics) is machine-checked in Lean 4: the T1 wander law, the same-extrema identity, the sparse-anchor law (sparse ≤ dense), the union law (extrema-covered sample sets are exactly dense), the kinetic corollary (rates bounded by exp(wander/kT)), and the coverage bound (deficit ≤ 2·L·d). The pilot's protocol now has a proved skeleton. The mechanism note is filed [here](https://library.lupine.science/#/read/t1-wander-mechanism) — with the candidate next theorem, a saddle-metallicity gate, inside.

![A provenance corridor of sealed sample panels, compute receipts, and reproduced checkpoints leading into the de-brief table](images/z1-union-debrief-inline-03--retry-1.jpg)

## The questions for our conversation

1. Commission a **longer-path panel** (the real sparsity test), or first re-attack the **deferred big-7** at adopted settings (now plausibly ~2–4 h/path locally)?
2. **Engine-equivalence repair** (smearing/occupation policy at metallic saddles) to reclaim the VASP basis — or declare same-engine permanent and re-baseline panels to GPAW-computed references?
3. Characterize the **mace-small / mace-mpa-0 guidance misses** (which chemistries) before anyone quotes 6.8 meV.
4. **Wavefunction reuse between neighboring anchors** — an unclaimed 20–33% lever the literature review surfaced; implement before the next campaign?
5. Z2: the Tiwari fix failed review twice — small physics fix; do I take it directly, or leave it with the team?

![A next-campaign staging area: reusable anchors and preserved evidence supporting a smaller, more focused solid-state battery experiment](images/z1-union-debrief-spread--retry-1.jpg)

## Resources

- [Verdict of record](https://library.lupine.science/#/read/z1-union-campaign-verdict) — per-model and per-path tables
- [Measured cost ledger](https://library.lupine.science/#/read/z1-union-cost-ledger) — $14.65 per 129 anchors
- [Union-anchor economics](https://library.lupine.science/#/read/z1-union-anchor-economics) — 72.4% fewer DFT evaluations
- [T1 wander mechanism](https://library.lupine.science/#/read/t1-wander-mechanism) — metallic saddles, SCF fragility
- [Niggli audit](https://library.lupine.science/#/read/t1-niggli-audit) — the skewed-cell validity check
- Campaign machine record: `data/candidates/z1-union-campaign.json` (sha256-pinned) in the [open repository](https://github.com/alexwelcing/lupine-rhizo)

*This is a de-brief draft for the lead's review ahead of our conversation. Numbers are of record; framing is mine to defend.*
