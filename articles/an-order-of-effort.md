# Where Corrections Hold: A Seven-Tier Map of MLIP Error (July 2026)

> **Type:** Research note
> **Date:** 2026-07-20  
> **Updated:** 2026-11-11
> **Deck:** A map, drawn in July 2026, of where corrections have held and where they have not, by type of property, and the order we planned to test next  
> **Summary:** A July 2026 map of MLIP error by property type, from lattice constants to magnetism: where a correction has held in a narrow, stated case, where only boundary results apply, and where the honest answer is abstention. Later results that changed the map are dated in the body.  
> **Status:** Published
> **Ontology:** T2, E4, E8

---

![The ladder: seven steps from calm to storm](images/tier-ladder.png)

<p class="lead">We spent two campaigns measuring where foundation models fail hardest — barriers and interfaces, the observables where errors run to electron-volts and every cheap fix dies. People reasonably ask why we started at the deep end. The answer: a boundary is only visible from the far side. Now that we've walked it, the whole ladder is in view — where a correction has held in a narrow case, where only boundary results can speak, and the order of effort we planned for the rounds ahead. This is that ladder, with the receipts.</p>

## Why map the hard end first

Barriers and interfaces are where MLIPs drifted farthest in our tests: 135.0–242.5 meV of barrier error against a 40 meV gate across four foundation models, and adsorption errors up to +25.6 eV. We deliberately ran there first, because a boundary is easiest to see from the hard side. The result, honestly recorded: no low-dimensional correction survived on that error field in our tests. But the same measurement produced something more useful than a win: the complete map of difficulty, from observables where corrections already pass to domains where the only honest answer is abstention.

## The ladder, as measured

![The boundary theorem as referee](images/tier-referee.png)

![A branching sample rail at a quiet allocation station: simple coupons enter a rapid screen while one complex interface coupon is diverted to a reference chamber — The physical switch routes work according to evidence difficulty](images/an-order-of-effort-inline-01.jpg)

**Tier 1 — statics (lattice constants, volumes, relaxed bulk).** In Round 3, a direction-gated correction cut lattice-constant error from 1.60% to 0.33% (ionics) and 1.75% to 0.74% (perovskites) on unseen candidates, inside a trial whose gates failed overall. *Update, 2026-11-11:* in Round 4 the same correction did not reach significance in either group, so this tier is Open. The error structure is small and one-sided, and the runtime cost is trivial.

**Tier 2 — elastic response (bulk modulus, elastic constants).** Harder, and we mark it honestly: our own kill condition fired on B0. The theorem work here is *boundary* theorems — classification of which cells may correct and which may not — not correction laws.

**Tier 3 — surface energies.** On nine fcc metals, a smooth error field predicted a blind facet for three of four models, and an energy-only correction beside one model cut that facet's error from 9.7% to 1.5% (nickel) at about 15% runtime overhead. A correction is possible here because the field is smooth enough to have an inverse; it has been shown for one model, two metals and one facet.

**Tier 4 — defect formation energies.** Cross-model spreads of 0.5–1.8 eV with sign instability. Corrections need per-defect anchoring; the theorem work is scope restriction.

**Tier 5 — transition-state barriers.** Where we just spent two campaigns. The verdict: energy *levels* fail beyond rescue by any cheap correction we tried, but energy *geometry* — saddle locations — was right on 82–86% of paths (89–93% within one image). The boundary results point to one route worth testing: sparse DFT anchors at model-chosen extrema.

**Tier 6 — interface adsorption.** Structured underbinding on our panel, up to +25.6 eV; frozen corrections made the holdout *worse*. Only on-policy corrections (fitted during the search itself) might have a chance here, and none has been tested.

**Tier 7 — magnetic and excited-state properties.** No measurement path exists in current models. Not a correction domain — an abstention domain, by construction.

## The rule that keeps the ladder from fighting itself

Non-competition is structural: each correction family may act only where the family below it *provably cannot*. Level shifts are dead everywhere — a theorem kills them (`barrier_shift_invariant`), so they never compete. Slope corrections are licensed only by sign stability. Environment-field corrections apply only where a smooth field exists. Anchors are priced exactly: two extrema, exactness, and the model demoted to geometry guide. And a single wobble bound referees all of it: no information-free correction can beat the model's profile wobble. These are Lean-checked statements about the arithmetic of corrections; whether a given correction helps on real materials is still decided by measurement.

![A high-pressure material cell enclosed by three nested mechanical containment rings, with the innermost ring carrying a restrained indigo boundary — The nested rings prevent a correction from extending beyond its tested material regime](images/an-order-of-effort-inline-02.jpg)

## What the next rounds look like

*As planned in July 2026:*

**Round easy-first:** Tier 1. The goal was a model-independent runtime gain on relaxed-structure observables, with overhead measured per cell. *Update, 2026-11-11:* Round 4 did not confirm the Tier-1 correction; see [Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/).

**Sparse-DFT pilot:** Tier 5's route — models guide, DFT measures only at model-chosen extrema. In simulation on the locked reference profile, that reproduced barriers at 1.2–9.4 meV mean error at about 7 evaluations per path. The memorandum of theory was frozen before results ([PDF](/papers/memorandum-correction-boundary-2026-07-20.pdf)). *Update, 2026-11-11:* when we ran it with GPAW, the preregistered gate against the published references failed; the check that passed is same-engine only, and the pilot was about 700 meV off the references. See [Sharing DFT anchors](/articles/shared-dft-anchors/).

**The boundary at each step:** when a round hits the tier where its correction family provably can't act, the boundary is already written down — that's what the Lean layer is for.

![A phased research hall with a simple coupon rack nearest the viewer and progressively enclosed thermal, reaction, and interface test bays farther away — Samples advance only when each increasingly specialized test bay supplies evidence](images/an-order-of-effort-inline-03.jpg)

## Receipts

- The memorandum of theory: [memorandum-correction-boundary-2026-07-20.pdf](/papers/memorandum-correction-boundary-2026-07-20.pdf) (frozen before results)
- The barrier campaigns: [Round 4: Three Failures and One Abstention, Preregistered](/articles/four-gates-three-honest-failures-one-live-experiment/) and the [Z1 barrier panel](/articles/the-materials-we-test-against/)
- The Lean correction-boundary module and full records at [library.lupine.science](https://library.lupine.science)
