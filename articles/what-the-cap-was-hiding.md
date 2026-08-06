# What the Cap Was Hiding

> **Field note from the live lab**
> **Date:** 2026-08-04
> **Deck:** A correction gate that refused seven in ten of the cases it could act on turned out to be measuring its own estimator, not the physics — and the failure that exposed it was preserved rather than discarded.
> **Summary:** A preregistered correction trial failed. Reopening the mathematics rather than the conclusion showed the gate was mis-tuned, the confirmatory test could not have passed even in principle, an escape statistic proposed as an input to the next round had no physical content, and the replacement gate carries a rounding hazard of its own. The license results are theorems in Lean 4; the rest is arithmetic replayed from the hash-locked records.
> **Status:** Draft for discussion — every number below was re-derived from the primary records before publication, and five claims in the first draft did not survive that check (see *Corrections to this piece*).

On 19 July 2026 a preregistered trial asked whether a theorem-licensed correction to universal machine-learning interatomic potentials would transfer to held-out materials. It failed. Both confirmatory groups missed their gates — ionics-rocksalt 0 of 4 properties, perovskites 0 of 1 — and the broad empirical claim that licensed corrections never worsen a prediction was false: of the 28 cases where the rule fired, 10 got worse.

One narrow result survived, and it is much narrower than it first sounds. Among cases that were both cap-licensed and inside the calibration hull, zero worsened — but there were **three** such cases. Three. That is not evidence that the theory works in a small region; it is a sample too small to distinguish a working theory from a coin that came up heads three times.

The obvious reading was still that the theory holds in some small region and fails outside it, and that the small region is what the mathematics can honestly claim. That reading was wrong, and the way it was wrong is the subject of this article.

## The failure was in the estimator, not the theory

The correction divides a prediction by a bias estimate `b` drawn from calibration data. A gate then decides whether the resulting correction is licensed — provably guaranteed not to make the prediction worse. The gate in the frozen protocol was conservative: it compared `|b − 1|` against the spread `s` of the calibration ratios (two spreads in one regime, three in the other) and added a floor requiring `b ≥ 0.5` in the deflation regime.

The trial produced 144 (material, model, property) cases across 32 model/material cells. The gate refused 116 of them: 50 because the calibration ratios straddled 1, where no bias can help anything, and **66 by the cap alone**. Of the 94 cases where a correction was in principle possible, the cap licensed 28.

Reopening the algebra produced a single identity that reorganises everything:

```
b²(r−1)² − (r−b)² = r(b−1)(r(1+b) − 2b)
```

where `r` is the ratio of prediction to reference on a case. The consequence is that dividing by `b` improves a case **if and only if** `r` lies on the far side of the harmonic mean `H(b) = 2b/(1+b)` from the neutral ratio 1. No hull. No spread. No cap. Every gate in the implementation was a conservative proxy for that one comparison. Replayed against the record, that comparison reproduces all 144 recorded improve/worsen outcomes exactly.

From there, three things followed, all formalised in Lean 4 with no unproven steps:

The **sharp license** — the exact necessary and sufficient condition for a bias to be uniformly safe over a calibration hull — is `b(2 − lo) < lo` in the inflation regime and `hi(1 + b) < 2b` in deflation, where `[lo, hi]` is the hull. The calibration spread never appears. Necessity is witnessed at the hull endpoint nearest 1, so the region cannot be widened further without weakening the guarantee. Both old caps provably imply these conditions, so every correction the caps licensed is still licensed; on the trial's own statistics the sharp gate raises the licensed count from 28 to 68 of the 94.

The **b ≥ 0.5 floor was an artefact**. It was never about the correction amplifying error at small `b`. The floor is exactly the root of the quadratic `2b² − 3b + 1`, which is what the old three-spread cap needs in order to imply the sharp condition — slack for a lossy intermediate bound, required only for that implication and not by the license itself. The sharp gate licenses `b = 0.30` on the hull `[0.30, 0.34]`, far below the old floor.

Then the result that matters most. Every one-sided calibration hull admits a bias estimate, drawn from inside that hull, which improves **every** in-hull case with no gate at all: `b = lo` in inflation, `b = hi` in deflation, the endpoint nearest 1. Applied to the trial, that bias clears the sharp gate on all 94 one-sided cases rather than 28 — and of the 37 whose target ratio in fact landed inside its hull, it improves all 37. The gate's discriminating power, on every case where a correction was possible at all, came from estimating the bias by the **median** — a choice made for statistical robustness, which sits further from 1 than the near endpoint and therefore pulls against the license in both regimes.

Of the 66 cases the cap refused, 34 were inside the hull, and 32 of those would have been improved by the very bias that was refused. The gate was not protecting the result. It was discarding it.

Two qualifications belong here rather than in a footnote. First, "inside the hull" is not something the gate could have known: it requires the reference value, the quantity being predicted. Every in-hull count in this article is retrospective, computed with the answer in hand. Second, the optimum is not symmetric between the regimes. Under the guaranteed margin measured relative to `b`, inflation's unique maximiser is the endpoint `b = lo`; deflation's maximiser is strictly interior, at `b* = (lo+hi)/(2+lo−hi)`, with optimal margin `2·lo·(1−hi)/(lo+hi)`. The near endpoint `b = hi` is licensed in deflation but is not the best available bias.

## The test could not have passed

A second defect was hiding underneath. The perovskite group's only confirmatory property recorded 4 applied cases, 4 improved, 0 worsened — and was scored a failure at p = 0.125 against the preregistered threshold α = 0.10.

A two-sided exact sign test on 4 observations has a minimum attainable p-value of 2 × 2⁻⁴ = 0.125. A perfect result could not have reached significance. And because tightening the cap reduces the number of licensed cases, the very act of strengthening the guarantee destroyed the statistical power needed to detect it. The design contained a trap in which rigour consumed itself.

This is not a subtle error in hindsight, but it is invisible from inside a result that reports "0 of 1 properties passed." The number looks like evidence about materials. It was arithmetic about sample size. Unlike the license results, this one is not a Lean theorem; it is a fact about the binomial distribution that nobody checked.

## A statistic with no physical content

The same pattern appeared a third time.

To decide how much to trust a correction, one wants to know how often a target's ratio falls outside the hull built from its calibration neighbours — the escape rate. Computed by leave-one-out over the existing campaigns, using the same hull construction the campaigns have run since Round 3, it came to 0.556 on the Round-4 panel and 0.072 on the Z1 barrier panel, with Wilson intervals attached.

Under leave-one-out, the hull is the minimum and maximum of the remaining points. At most one point in any bucket can fall below every leave-one-out lower endpoint and at most one above every upper endpoint, so at most two points per bucket can ever escape — and with distinct values, exactly two do. The escape rate is therefore forced to be `2G/N`: two per bucket, `G` buckets, `N` points. Both numbers are exactly that: (2 × 40)/144 = 0.556, and (2 × 4)/111 = 0.072. Across eight different grouping rules on the Z1 panel, the escape count equals 2 × (number of groups) every single time.

Replacing every physical ratio with uniform random numbers reproduces 0.555556 across independent seeds. The statistic measures panel bookkeeping. The intervals were binomial intervals on a deterministic quantity. Of that analysis only the overshoot magnitudes — how far outside a target lands when it does escape, median 1.044 and p90 1.257 — carry information about the physics.

This one was caught before it was reported, but only barely: it was on its way to becoming the empirical input that sets the robustness parameter for the next round. Measuring escape honestly requires a hull built from a calibration subset and targets that contributed nothing to it. The exact distribution-free null for that design — the escape count is Beta-binomial in the calibration and evaluation sizes — is now derived and its power tabulated. That experiment is designed; it is not what had been run.

## A fourth defect, in the replacement

The sharp gate is exact as a statement about real numbers. The pipeline does not carry real numbers. It carries ratios rounded onto a 1/10000 grid, and the gate is evaluated on the rounded pair while the guarantee is wanted for the true one.

The gate is a strict inequality, so it is robust — but only above a margin, and the margin is of order 10⁴ in the integer scale, not order 1. A machine-checked witness has true hull floor 1.004951 and true bias 1.010040, both rounding to values that pass the gate with apparent margin 5000, and the correction strictly harms. A second witness makes the corrected error nearly four times the raw error while passing. An exhaustive search over admissible rounded pairs puts the worst harm ratio at ≈3.99 on the inflation side and ≈1.99 on the deflation side.

The fix is a proved safe-margin rule — require the gate quantity to exceed the rounding slack, which at the project's scale means `lo(10⁴ + b) − 2·10⁴·b ≥ 20000` in inflation — and it is a one-line runtime addition. Recomputing the widening under that rule: all 68 of the newly licensed Round-4 cases clear it, and so do all 94 under the near-endpoint bias. The Round-4 numbers survive. They were not entitled to until they were checked, and the note that records the defect says so explicitly.

There is also a cost to widening that is not a defect but is a real trade. Under the old two-spread cap, a hull like the Round-2 FeNi calibration hull `[1.02, 1.175]` could not clear the gate for any in-hull bias at all — a refusal that was *runtime-checkable*, independent of whether the target behaved like its classmates. Under the sharp gate a bias of 1.03 clears it. For hulls of that shape the refusal now rests entirely on the in-hull hypothesis, which is unverifiable at prediction time. Nothing previously *proved* is lost; a checkable guard is traded for an oracle one. That belongs in the next preregistration.

## What the process did right, and what it did wrong

Four defects, none of them in the physics: a mis-tuned gate, an underpowered test, a statistic that measured its own construction, and a rounding hazard in the replacement gate. Two things made them findable.

The first is that the failure was preserved with its inputs. The candidate set was hash-locked before measurement, the failures were recorded without imputation, and the outcomes were registered in the claim registry as *contradicted* and *withdrawn* rather than quietly revised. Every claim in the preceding sections was recomputed from those records sixteen days later. Had the campaign been re-run to a better outcome, or the counter-results dropped, none of this would have been recoverable. The record of being wrong was the instrument.

That record includes the trial's own procedural failure, and it is worth stating plainly rather than in the register of a footnote. The preregistration required the analysis implementation to be committed and tested before the evaluation set was locked. It was not: the evaluation set was locked on 17 July and the tool that executed the analysis was first committed on 19 July, after the measurements existed. The amendment that records this calls the remedy fix-forward and explicitly not absolution, and marks the promised freeze as void. The measurements are hash-locked and re-verify byte-for-byte, so the analysis cannot have been tuned against undisclosed intermediate states *from that point forward* — which is a weaker guarantee than the one that was registered, and the difference is the point.

The second thing that made the defects findable is mechanical proof. The license results are theorems in Lean 4 — 515 named theorems and lemmas across eight modules, together with 116 anonymous `example` checks, 631 machine-checked propositions in total, with no `sorry` and no `native_decide` anywhere, under toolchain v4.29.0. (The four modules this article draws on most — the sharp characterisation, the optimal estimator, the robustness family, the structural counterexamples — account for 325 of the named results; the rest are the conformal-δ, escape-bound and oracle modules.) That matters less for confidence in the algebra than for a specific failure mode: it is very easy to convince oneself that a conservative gate is safe. It is not possible to convince a proof checker that a gate is necessary when it is merely sufficient.

Mechanical proof also produced the least comfortable result in this work, and also the most easily overstated. Componentwise licensing *does* imply what one would hope at the aggregate level: if every component of a vector-valued prediction carries a licensed, in-hull correction, the error vector shrinks componentwise, hence in every positively weighted MAE and Frobenius norm. That is a theorem. What componentwise licensing does **not** control is quantities *derived* from the components. Two licensed corrections on `c₁₁` and `c₁₂` can worsen the tetragonal shear `C′ = (c₁₁ − c₁₂)/2`: in the recorded witness both component errors fall, both norms improve, and a derived modulus that was exactly right goes to 7.3% wrong, because the raw prediction was correct by error cancellation and the correction destroyed the cancellation. The same happens for products across regimes — a licensed inflation correction on one property and a licensed deflation correction on another, each strictly improving, turning a perfectly predicted product into an 8.7% error. Per-component licensing plus *derived-quantity* reporting is the combination the theorems do not support. Finding it required looking for a counterexample rather than a proof.

Against that, the process failed in a way worth naming. When the trial's verdicts came back negative, the first instinct — mine — was to treat them as a scope boundary: to catalogue what could still be defended, drop the material classes where claims had been contradicted, and lead with whatever survived external scrutiny. That instinct is not rigour. It reads early errors as terminal verdicts, and it stops exactly where the interesting mathematics starts. The correction came from outside: *you are looking for exits rather than pursuing the theory more fully.* Everything above followed from reopening the mathematics instead of narrowing the claim, and the specific thing that had to be reopened was the thing the failure had made look settled.

## Where it leaves the theory

The licensed region is no longer the object of interest. Its boundary was an artefact of an estimator choice, and once the estimator is chosen to suit the license, the gate on in-hull cases becomes vacuous. What remains genuinely open is the condition the gate was standing in for.

Improvement requires the target ratio to sit on the correct side of `H(b)`. The hull was a proxy for that, and a conservative one — hull membership is sufficient but not necessary, and a target outside the hull can still be improved, by a quantified amount of slack the gate buys. But hull membership is also not checkable at prediction time, which is precisely why the honest escape measurement matters. What is needed is not a wider license but a computable bound on where the target ratio can be, which is a statement about how far a calibration set can be trusted to travel — across a structure prototype, a composition region, a chemistry.

There is now a one-parameter family that makes this precise: for each escape level δ, the bias that maximises the guaranteed margin over a correspondingly inflated set, with a closed-form capacity — `δ_max = lo − 1` in inflation, `1/hi − 1` in deflation — beyond which no bias helps at all and the correct action is to abstain. Choosing δ is an empirical question, which is why the escape measurement had to be honest. Running that measurement properly, rather than reporting the number that was already in hand, is the current work.

## Corrections to this piece

This article asserts that preserved failure plus mechanical proof is what makes error findable. It would be self-refuting to publish it without applying that standard to itself. Every quantitative claim above was re-derived from the Lean sources and the hash-locked campaign records before publication. Five claims in the first draft did not survive:

- **The theorem count.** The draft attributed a single round figure to four theorem families. The tree in fact holds {{TA_THEOREMS}} `theorem` declarations and {{TA_LEMMAS}} `lemma`s — {{TA_NAMED}} named results — plus {{TA_EXAMPLES}} `example` checks, across {{TA_MODULES}} modules; the four families it attributed the count to hold {{TA_FAMILY_NAMED}} of them. Corrected to the true numbers and the true scope, and every figure in this bullet is now hydrated from `public/data/theory_artifacts_count.json` at build time rather than typed.
- **"The trial was frozen before execution."** Contradicted by the trial's own amendment: the analysis tool post-dates both the evaluation-set lock and the measurements, and the registered freeze is recorded as void. Corrected, and given its own paragraph rather than a footnote.
- **"Nothing previously guaranteed is lost; the sharp gate simply licenses strictly more."** True of the proofs, false of the operational guarantee: the sharp gate gives up a runtime-checkable refusal that the old cap provided. Corrected.
- **"The escape statistic had been reported for months," and "recomputed months later."** Neither is true. The trial ran on 19 July 2026 and this analysis is dated 4 August 2026 — sixteen days. No escape rate had been reported anywhere before this audit. Corrected.
- **"Per-component licensing and aggregate reporting are a combination the theorems do not support."** Overstated in the direction that flatters the finding: componentwise licensing *does* imply improvement in weighted MAE and Frobenius norms, and that is a theorem. Only derived quantities fail. Corrected.

Two things were added rather than corrected. The sample size behind "exactly zero worsened" is **three**, and omitting it was the same error the article accuses the escape statistic of. And the rounding defect in the sharp gate — machine-checked, capable of licensing a correction that quadruples the error — was absent from a draft that claimed to enumerate the defects found. The recomputation it demands has now been run: the Round-4 widening survives it.

The claim that the sign-test floor and the escape identity are "machine-checked" was also imprecise. The escape bound is a Lean theorem — at most one member of a pool can violate every leave-one-out lower endpoint, and one the upper — but the exact `2G/N` value is arithmetic replayed from the records, and the sign-test minimum is elementary and was never formalised at all.

---

*All theorems referenced are in the Lupine Rhizo repository. The Round-4 campaign records, including the failed verdicts and the preregistration amendment documenting a protocol violation that was mitigated fix-forward and recorded as void rather than erased, remain in their original hash-locked form.*
