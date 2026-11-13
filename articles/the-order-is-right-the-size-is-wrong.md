# The Order Is Right, the Size Is Wrong

> **Type:** Results note
> **Date:** 2026-07-02  
> **Updated:** 2026-11-11
> **Deck:** Foundation machine-learned interatomic potentials (CHGNet, MACE-MP, MACE-MPA-0) measured across 21 materials and up to 9 properties against 228 published reference values  
> **Summary:** Across 21 materials and 228 published reference values, four foundation MLIPs ranked surface energies almost correctly (Spearman 0.88–1.00) while missing magnitudes by tens of percent. Apparent cross-model alignment sat inside a coupling-aware null, so we do not count it as a result.
> **Status:** Published
> **Evidence Status:** Four uMLIPs, 21 materials, 228 published reference values. The arithmetic and stated inequalities are checked in Lean over hashed data; the physics is tested against the references, not by Lean. Not peer-reviewed.
> **Artifacts:** manuscript, pre-registration with amendments, Lean checks of the arithmetic, and the full evidence corpus in the [repository](https://github.com/alexwelcing/lupine-rhizo/pull/14) and [Library](https://library.lupine.science)  

---

## The question

Foundation potentials promise density-functional accuracy at classical cost.
On bulk properties they nearly deliver: across the benchmark matrix, lattice constants
land within half a percent and formation enthalpies within a few percent of
published references. On the properties that decide real materials questions —
surfaces, vacancies, stacking faults — the same models miss by tens of
percent, systematically.

The question is whether that failure has *structure*: something measurable,
correctable, and explicit about its limits.

## What did not survive

The obvious hypotheses were pre-registered first, with coupling-aware nulls —
statistical controls that grant the physics its own internal correlations
before crediting any model with "shared structure."

![An unattended specimen pipeline with a model cartridge, a bounded correction jig, and a final engineering decision tray connected by one narrow rail — The rail carries one sample through rank-preserving correction into a physical decision tray](images/the-order-is-right-the-size-is-wrong-inline-03.jpg)

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
energy and it is almost always right — rank correlations of 0.88 to a perfect
1.000 across materials — even while the magnitudes are wrong by tens of
percent. All 22 reference-ordered facet hierarchies reproduce. The order is
right; the size is wrong.

**A form.** Within a property family the error is approximately a power
law, `prediction ≈ c·T^α`. The four fitted surface exponents (1.065–1.138)
spread less between models than a single model's uncertainty — consistent
with, though not demonstrating, an exponent that belongs to the property
family. The prefactor moves with training data, from 0.66 (CHGNet) to 0.98
(MACE-MPA-0).

**A field.** Both regularities are projections of something simpler
underneath: a smooth error field over local atomic environments, keyed on
coordination. Measured from just three standard observables per material,
the field predicted a fourth observable it had never seen — the (110)
surface energy, which probes an unfitted coordination — with r = 0.906
across 36 cells (nine fcc metals × four models), zero adjustable parameters,
surviving material-clustered resampling and a permutation null reported at
its true center (0.44, not zero). It is significant for three of the four
models, not for MACE-MP-0 medium. Details are on the
[fcc error-field page](/articles/a-smooth-environment-resolved-error-field/).

![Surface-energy rankings translated into coating and catalyst sample plates: the order holds while the measured distances reveal the magnitude error](images/the-order-is-right-the-size-is-wrong-inline-01--retry-1.jpg)

## From map to correction

Because the field lives on atomic environments, its inverse is an additive
energy term with analytic forces that can run beside the live model. Used as
an energy-only correction beside CHGNet, it recovered the fitted observables
exactly through full relaxations, improved the *blind* facet (9.7% → 1.5%
error on nickel; 28.0% → 13.7% on copper: one model, two metals, one facet),
left bulk lattice constants unchanged, and ran stable molecular dynamics.

Where it cannot work, we can say so in advance: MPtrj-trained models scramble
the ranking of stacking-fault energies, and a short Lean-checked lemma with
concrete witnesses shows that no order-preserving correction can map those
predictions onto the references.

One null result is part of the record: the first-shell field corrects
energies, not near-equilibrium forces — force error lives in the curvature,
not the coordination step. That boundary is stated in the manuscript's
abstract, because knowing where a method stops is most of knowing what it is.

## What the Lean checks do

Lean 4 checks the arithmetic and stated inequalities behind the numbers
above, over integer-scaled data with hashed provenance. It does not check the
physics, the reference data or the pipeline; those are tested against the
published references. One check changed a reported count: at the 10⁻⁴ J/m²
precision used for checking, one cell's improvement rounds to zero (`decide`
refuses `813 < 813`), so we report 26 of 36 improved cells (27 of 36 at
float64).

## What this means if you run simulations

- **Screening:** on these 21 materials, the models' rankings of surfaces,
  vacancies and bulk moduli tracked the references closely. Treat that as
  evidence for this domain, not a guarantee elsewhere, and treat MPtrj-trained
  stacking-fault rankings as unusable.
- **Correction:** an energy-only correction built from three anchor
  observables improved one blind facet on two metals beside one model. It is
  a research result, not a tool to apply to other materials.
- **Boundaries:** where the order is broken, a Lean-checked inequality shows
  that no monotone fix exists.

The registered next tests — hcp metals, alloys, a continuous-coordinate
field for forces — are in the record with their kill conditions. If they
break the picture, that will be published with the same prominence.

![A clean-industry pilot selection scene: correct ordering saves experimental capacity even though final magnitudes still require reference measurement](images/the-order-is-right-the-size-is-wrong-spread--retry-1.jpg)

---

*Evidence trail: pre-registration and amendments, confirmatory artifacts,
statistical hardening, the manuscript with its five-figure hashed pipeline,
and the Lean modules are in the [repository](https://github.com/alexwelcing/lupine-rhizo)
and the [Lupine Library](https://library.lupine.science). The ledger's
records landed under `y-matrix-2026-07-02`.*
