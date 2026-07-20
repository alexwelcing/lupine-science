# An Order of Effort: Where Correction Laws Hold, and Where the Boundary Begins

> **Field note from the live lab**
> **Date:** 2026-07-20  
> **Deck:** The measured ladder from proven corrections to proven impossibility — and the order in which our next rounds climb it  
> **Summary:** We mapped the hard end first on purpose. Now the ladder is drawn: where our correction layer already wins, where only boundary theorems can speak, and the order of effort for the rounds ahead — each with its price list.  
> **Status:** Final

---

![The ladder: seven steps from calm to storm](images/tier-ladder.png)

<p class="lead">We spent two campaigns measuring where foundation models fail hardest — barriers and interfaces, the observables where errors run to electron-volts and every cheap fix dies. People reasonably ask why we started at the deep end. The answer: a boundary is only visible from the far side. Now that we've walked it, the whole ladder is in view — where our correction layer already delivers, where only boundary theorems can speak, and the order of effort for the rounds ahead. This is that ladder, with the receipts.</p>

## Why map the hard end first

Barriers and interfaces are where MLIPs drift farthest: 135–243 meV of barrier error against a 40 meV gate across four foundation models, adsorption underbinding up to +26 eV. We deliberately ran there first — not because it was kind, but because a trust layer that works there works anywhere, and one that fails there was never going to be one. The result, honestly recorded: no low-dimensional correction survives on that error field, and we can prove it in Lean 4. But the same measurement produced something more useful than a win: the complete map of difficulty, from observables where corrections already pass to domains where the only honest answer is abstention.

## The ladder, as measured

![The boundary theorem as referee](images/tier-referee.png)

**Tier 1 — statics (lattice constants, volumes, relaxed bulk).** Our correction layer *already wins here*: direction-gated corrections cut lattice-constant error from 1.60% to 0.33% and 1.75% to 0.74% in a preregistered round. The error structure is small, one-sided, and tame — and the runtime cost is trivial.

**Tier 2 — elastic response (bulk modulus, elastic constants).** Harder, and we mark it honestly: our own kill condition fired on B0. The theorem work here is *boundary* theorems — classification of which cells may correct and which may not — not correction laws.

**Tier 3 — surface energies.** A smooth, low-dimensional error field: our environment-resolved correction cut one facet error from 9.7% to 1.5% at ~15% runtime overhead. Correction laws exist because the field is smooth enough to have an inverse.

**Tier 4 — defect formation energies.** Cross-model spreads of 0.5–1.8 eV with sign instability. Corrections need per-defect anchoring; the theorem work is scope restriction.

**Tier 5 — transition-state barriers.** Where we just spent two campaigns. The verdict: energy *levels* fail beyond rescue by any cheap correction, but energy *geometry* — saddle locations — is right 82–93% of the time. The boundary theorems price the only honest route: sparse DFT anchors at model-chosen extrema.

**Tier 6 — interface adsorption.** Structured underbinding fields to +26 eV; frozen corrections made the holdout *worse*. Only on-policy corrections (fitted during the search itself) have a chance here.

**Tier 7 — magnetic and excited-state properties.** No measurement path exists in current models. Not a correction domain — an abstention domain, by construction.

## The rule that keeps the ladder from fighting itself

Non-competition is structural, and it's the part worth stealing: each correction family is licensed only where the family below it *provably cannot act*. Level shifts are dead everywhere — a theorem kills them (`barrier_shift_invariant`), so they never compete. Slope corrections are licensed only by sign stability. Environment-field corrections apply only where a smooth field exists. Anchors are priced exactly: two extrema, exactness, and the model demoted to geometry guide. And a single wobble bound referees all of it: no information-free correction can beat the model's profile wobble, ever. The ladder is not a pile of tricks; it's an ordered stack of licenses with a machine-checked referee.

## What the next rounds look like

**Round easy-first (now):** Tier 1, where corrections are already proven. The goal is a model-independent runtime win: our system improving *any* model's simulation loop on relaxed-structure observables, with overhead measured per cell. The correction layer is in the runner; the instrumentation is next.

**Sparse-DFT pilot (executing):** Tier 5's priced route — models guide, DFT measures only at model-chosen extrema. In exact simulation on the locked panel, that reproduces barriers at 1–9 meV mean error at roughly 7 evaluations per path, against a gate the raw models miss by 3–6×. The memorandum of theory is frozen before results ([PDF](/papers/memorandum-correction-boundary-2026-07-20.pdf)); the campaign fills its slots.

**The boundary at each step:** when a round hits the tier where its correction family provably can't act, the boundary is already written down — that's what the Lean layer is for.

## The upside, stated plainly

What does this process buy? Three things nobody else in this space is selling. **Measured trust**: every accuracy claim hash-locked and preregistered, so "the model says" becomes "here is what the model is worth, per observable." **Machine-checked limits**: the correction boundary means you never spend on a correction that can't work — the impossibility is proved, not discovered. **Priced accuracy**: where corrections pass, runtime wins at laptop cost; where they can't, sparse anchors deliver DFT-grade accuracy at ~10× less DFT compute — with the cost declared before the measurement, not after. That's the offer, and the receipts are the pitch.

## Receipts

- The memorandum of theory: [memorandum-correction-boundary-2026-07-20.pdf](/papers/memorandum-correction-boundary-2026-07-20.pdf) (frozen before results)
- The barrier campaigns: [Four Gates, Three Honest Failures, One Live Experiment](/articles/four-gates-three-honest-failures-one-live-experiment/) and the [Z1 panel field guide](/articles/the-materials-we-test-against/)
- The Lean correction-boundary module (machine-checked) and full records at [library.lupine.science](https://library.lupine.science)
