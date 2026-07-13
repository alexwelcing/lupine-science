# The Order Is Right, the Size Is Wrong

> **Field note from the live lab**
> **Date:** 2026-07-02  
> **Deck:** Foundation machine-learned interatomic potentials (CHGNet, MACE-MP, MACE-MPA-0) measured across 21 materials and up to 9 properties against 228 published reference values  
> **Status:** Live evidence — every number reported is sealed as a machine-checked theorem over provenance-hashed data; kills and corrections are preserved in the record  
> **Artifacts:** manuscript, pre-registration with amendments, 100+ Lean theorems, and the full evidence corpus in the [repository](https://github.com/alexwelcing/lupine-rhizo/pull/14) and [Library](https://library.lupine.science)  

---

## The question

Foundation potentials promise density-functional accuracy at classical cost.
On bulk properties they nearly deliver: across the benchmark matrix, lattice constants
land within half a percent and formation enthalpies within a few percent of
published references. On the properties that decide real materials questions —
surfaces, vacancies, stacking faults — the same models miss by ten to forty
percent, systematically.

The question is whether that failure has *structure*: something measurable,
correctable, and explicit about its limits.

## What did not survive

The obvious hypotheses were pre-registered first, with coupling-aware nulls —
statistical controls that grant the physics its own internal correlations
before crediting any model with "shared structure."

Two headline hypotheses died. Cross-property error is **not** low-dimensional
in the linear sense: participation ratios sit inside the null band. And
apparent cross-model alignment — raw cosine similarities as high as 0.96 —
sits *inside* a null that reaches 0.98. A naive analysis would have published
both as discoveries. The nulls exist so that false discoveries are not published.

The kills are preserved in the registration document alongside a third entry:
the first explanation for an iron anomaly, falsified by measurement the
same day it was written, with the falsification logged in place.

## What survived

**Rankings.** Ask any of these models *which* metal has the higher surface
energy and it almost never lies — rank correlations of 0.88 to a perfect
1.000 across materials — even while the magnitudes are wrong by tens of
percent. All 22 reference-ordered facet hierarchies reproduce. The order is
right; the size is wrong.

**A form.** The error is approximately a power law, `prediction ≈ c·T^α`,
and the two parameters have different owners. The exponent belongs to the
*property family* — surfaces sit near α ≈ 1.10 in all four models, across
two architectures and three training sets — while the prefactor belongs to
the *model's training data*, moving from 0.66 (CHGNet) toward 1 (0.98,
OMat-lineage MACE) as training distributions improve. Retraining fixes the
bias and barely touches the exponent.

**A field.** Both regularities are projections of something simpler
underneath: a smooth error field over local atomic environments, keyed on
coordination. Measured from just three standard observables per material,
the field predicted a fourth observable it had never seen — the (110)
surface energy, which probes an unfitted coordination — with r = 0.906
across 36 cells, zero adjustable parameters, surviving material-clustered
resampling and a permutation null reported at its true center (0.44, not zero).

## From map to correction

Because the field lives on atomic environments, its inverse is not a
spreadsheet adjustment — it is an additive energy term with analytic forces,
running beside the live model. Deployed over CHGNet, it recovered the fitted
observables exactly through full relaxations, improved the *blind* facet at
run time (9.7% → 1.5% error on nickel; 28.0% → 13.7% on copper), left the
bulk provably untouched, and ran stable molecular dynamics.

And where it cannot work, the failure is provable: MPtrj-trained models
scramble the ranking of stacking-fault energies, and a short quantified lemma
shows no order-preserving correction can ever map those predictions onto the
references. The impossibility is a theorem with concrete witnesses, checked
by the Lean proof kernel — the system refuses, with a proof, before a
core-hour is spent.

One null result is part of the record: the first-shell field corrects
energies, not near-equilibrium forces — force error lives in the curvature,
not the coordination step. That boundary is stated in the manuscript's
abstract, because knowing where a method stops is most of knowing what it is.

## Why the proof kernel is in the loop

Every claim above — the wins, the kills, the impossibility — is sealed as
decidable theorems over integer-scaled data carrying cryptographic
provenance. This is not decoration. During preparation the kernel rejected
one claimed result: a blind-prediction win whose margin vanished
at the fourth decimal (`decide` refused `813 < 813`). The corrected count is
the published one. The proof assistant edited the science, in exactly the
direction of honesty.

## What this means if you run simulations

- **Screening today:** rankings from these models are already trustworthy
  in the measured domain (surfaces, vacancies, bulk moduli) — pick candidates
  with confidence, and treat MPtrj stacking-fault rankings as unusable.
- **Certification:** a handful of anchor measurements per property family,
  plus the family exponent, buys a several-fold error reduction at zero
  additional simulation cost.
- **Boundaries:** where the order is broken, no monotone fix exists — the
  proof is provided rather than a worse number.

The registered next tests — hcp metals, alloys, a continuous-coordinate
field for forces — are in the record with their kill conditions. If they
break the picture, that will be published with the same prominence.

---

*Evidence trail: pre-registration and amendments, confirmatory artifacts,
statistical hardening, the manuscript with its five-figure hashed pipeline,
and the Lean modules are in the [repository](https://github.com/alexwelcing/lupine-rhizo)
and the [Lupine Library](https://library.lupine.science). The ledger's
records landed under `y-matrix-2026-07-02`.*
