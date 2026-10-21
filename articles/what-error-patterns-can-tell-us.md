# Learning What an Error Pattern Can Tell Us

> **Type:** article
> **Date:** 2026-10-21
> **Deck:** Inside Lupine’s research process: building a broad evidence library, challenging the geometry we hoped to find, and turning simulation errors into better decisions.
> **Summary:** Shared errors, useful disagreement, and a diffusion correction that reaches its limit: what our October investigations found, how we checked it, and what would change our conclusions.
> **Status:** Published
> **Evidence Status:** Research-process explainer and scoped results, reviewed October 21, 2026. Includes retrospective analysis, literature extraction and conditional mathematics; no new physical validation is claimed.

Three models can agree and all be wrong. A compact pattern in their errors can be real and still offer little help in correcting a prediction. A simulation can resemble an experiment after a change of temperature scale while remaining inaccurate at the temperature an engineer actually needs.

These possibilities have become the working material of Lupine’s research.

Our broad question is whether the structure of simulation error can help us make better materials decisions. The recent work has made that question more precise. We are asking which patterns survive a strong comparator, what information is missing, and whether a proposed intervention improves the observable that matters.

This article follows that change in the research: from assembling evidence, through several tests of our own preferred explanations, to the next measurements worth making. The [numerical companion](/data/error-patterns-october-2026.json) records the selected values, evidence dates and limitations behind the tables below.

## Start with a comparison that means something

An interatomic potential is a computational rule for predicting how atoms interact. It lets a simulation estimate forces, follow atomic motion, or calculate properties such as stiffness and diffusion. Different potentials can make different mistakes. The same potential can also look better or worse depending on the reference, physical state and scoring rule.

That makes a comparison more than a pair of numbers.

We now record the material and composition, temperature and phase, observable, units, model identity, calculation procedure, and reference kind. Experiment, density functional theory, another simulation, and a fitted target occupy different roles. A missing uncertainty stays missing. Two papers using the same reference do not automatically provide two independent confirmations.

We also changed how we collect. A single difficult paper can absorb an investigation indefinitely. Our default is now a portfolio of source batches across materials and observables, with deeper checks chosen for the number of records or scientific decisions they can clarify. Elasticity, thermal transport, adsorption and ion motion provide different tests of the same error-geometry ideas.

**The working snapshot on October 21 contained 3,397 extracted comparison rows across 70 comparison-study keys, plus 1,810 unpaired numerical observations.** Together, those records span 137 mixed numerical source keys. These are bookkeeping units with different provenance, not 137 independent physical validations. One comparison and 13 unpaired observations were explicitly quarantined from analysis; passing that filter still does not make all remaining rows mutually comparable. Another 62 text-reviewed panels from seven studies remained outside the admitted totals.

The distinction matters. A source lead, an extracted number, a compatible comparison, a runnable proposal and a completed experiment are different achievements. A useful library preserves those differences so that the next calculation can ask a defensible question. Our [corpus workflow](https://github.com/alexwelcing/lupine-rhizo/blob/main/tools/scientific-pi/skills/lupine-pi/references/corpus-workflow.md) describes that progression.

## The research loop: make the alternative explanation concrete

Each investigation begins with a proposed explanation and an alternative that could defeat it.

If errors appear concentrated in a few directions, perhaps models share a physical failure mode. But perhaps the shared reference, normalization, or small number of model channels creates much of that appearance.

If model disagreement selects difficult cases, perhaps it can guide reference calculations. But that does not yet tell us whether disagreement estimates the error accurately, or whether retraining on those cases improves a particular target.

If a correction reduces an average loss, perhaps it is useful. But it might worsen the material group or derived property that motivated the calculation.

The inexpensive first test is often an identity, a counterexample, or a recalculation on preserved data. We then state what evidence would change the result. Successful checks become explicit assumptions; failures change the formula or the experiment. This is how qualifications accumulate into a better theory.

The research system supports that loop with source records, deterministic calculations, a hypothesis history and selected formal specifications. AI tools assist discovery and analysis, while numerical checks and source attribution carry the factual claims. Internal review is recorded separately from external reproduction. A stopped computation remains stopped in the record.

## Finding 1: concentrated errors need a stronger baseline

One of our motivating ideas is that prediction errors may occupy a narrow region of a much larger space. Such concentration could make correction economical.

We challenged that idea on a preserved archive of **800 configurations in 100 groups**, split across MatPES and OMat24 panels. This was a retrospective analysis of previously examined data. It was not a fresh blind evaluation.

The diagnostic compared a learned rank-one direction with a simple direction in which all three model channels move together. Each panel used 25 source groups and 25 target groups; references were kept separate. The question was whether the learned direction captured appreciably more target residual energy than that common direction.

| Panel and metric | Learned direction | Common direction | Added capture |
| --- | ---: | ---: | ---: |
| MatPES, raw | 66.15% | 64.13% | +2.02 percentage points |
| MatPES, source RMS scaled | 65.38% | 65.29% | +0.09 points |
| OMat24, raw | 62.94% | 65.98% | −3.04 points |
| OMat24, source RMS scaled | 65.03% | 68.97% | −3.94 points |

Here, “source RMS scaled” means rescaling model channels using root-mean-square quantities from the source portion. The result concerns three model-channel axes. It does not measure the dimension of the physical configuration space.

The concentration survived, but its interpretation weakened: the learned direction added little or no advantage over the simple baseline. Shared model bias, reference discrepancy and shared training exposure remained competing explanations.

There is also an algebraic warning. Subtracting the same reference from each model adds a common component to their residuals. Removing the common direction leaves at most two contrast directions when there are three model channels. That rank limit is built into the construction.

Most importantly, these projections used target reference labels. They describe how compressible the known errors are. They do not supply a deployable rule for predicting a correction’s amplitude.

**What would strengthen the idea?** Freeze both a geometry and a usable correction predictor, then demonstrate improved task loss against the unchanged model and a common-error baseline on genuinely disjoint data. A second compatible reference could help distinguish reference discrepancy from correlated model error.

## Finding 2: disagreement helped us decide where to look

The same archive supported a more encouraging, narrower result.

We ranked target groups by model disagreement and selected five of the 25 groups in each panel. Those selections contained:

| Panel | Share of total target group error captured | Uniform random five: expected share |
| --- | ---: | ---: |
| MatPES | 35.53% | 20% |
| OMat24 | 47.05% | 20% |

“Error” here is the sum of group-average force-component mean squared errors. The experiment was retrospective and fixed the number of selected groups. It did not equalize computational cost or measure improvement after retraining. The [reviewed Library record](https://library.lupine.science/#/activity/disagreement-triage-20261017-completed-v1) preserves that scope.

This is useful evidence for prioritization: disagreement found a disproportionate share of error in these panels.

It is weaker evidence for error prediction. Some groups had low disagreement and high error. A disagreement-based predictor could improve mean absolute error while doing worse under squared error on the MatPES panel. The loss function changed the verdict.

A standard identity explains why agreement cannot certify accuracy:

$$
\frac{1}{M}\sum_m\|f_m-y\|^2
=
\|\bar f-y\|^2+
\frac{1}{M}\sum_m\|f_m-\bar f\|^2.
$$

The first term on the right is the ensemble mean’s error; the second is model spread. Models with identical predictions have zero spread even when their common prediction is far from the reference.

Our practical conclusion is to use disagreement as a candidate prioritization signal while retaining checks that can detect shared bias. Its value should be measured for the intended task and cost.

## Finding 3: choosing an informative case is only the beginning

Suppose a new reference calculation reveals a large error. What happens next depends on the update it produces.

For a quadratic target loss, a parameter displacement $s$ gives the exact change

$$
L(\theta+s)-L(\theta)
=
g^{\mathsf T}s+\tfrac12s^{\mathsf T}Hs,
$$

where $g$ is the target gradient and $H$ its curvature matrix. Improvement requires this expression to be negative.

A large source residual alone does not determine either term. An update can point away from the target, have no effect on it, or overshoot after initially pointing in a useful direction. We constructed exact synthetic examples of each case. These are mathematical checks of an inference, not materials experiments.

Related fixed-ensemble work asked whether one reweighting could improve an aggregate while protecting every group. Under the stated convexity and positive-curvature conditions, some retained finite panels admit an obstruction: every nonzero change from uniform model weights harms at least one protected group. That conclusion applies to the fixed predictions, groups and loss. It does not rule out new models, local corrections or a different justified task.

This moves the question from “which case has the biggest error?” to “which feasible measurement and update improve the target, with which tradeoffs?”

The mathematics uses established ideas from quadratic optimization, robust bounds and data selection. We do not claim those ideas as new. Work such as [Learning to Reweight Examples](https://proceedings.mlr.press/v80/ren18a.html) already connects example weighting to validation performance.

## Finding 4: one diffusion timescale cannot repair every species

A recent literature test made the correction question concrete.

Sandberg and colleagues tabulate diffusion coefficients from a high-dimensional neural-network potential (HDNNP) and ab-initio molecular dynamics (AIMD) for Al–Ni melts. Seven species/composition entries use matched temperatures and 256 atoms. In the 75% Ni melt at 1800 K, the two species err in opposite directions. [Primary preprint, Table 1](https://arxiv.org/pdf/2410.07886).

| Species | HDNNP | AIMD |
| --- | ---: | ---: |
| Ni | 3.884 | 3.640 |
| Al | 2.646 | 3.043 |

*Diffusion coefficients in $10^{-9}\,\mathrm{m^2/s}$.*

We asked whether one positive multiplier on all seven predicted diffusivities could fix the mismatch. The optimum multiplier is **1.032754**, but its worst relative error is still **10.20%**. Allowing independent rounding by half the last printed digit gives a lower bound of **10.17%**.

This is a conditional limit on common rescaling, not experimental validation. The table has no sampling error bars, and independence from AIMD training exposure is unestablished. Uncertainty-resolved values could change the conclusion.

For this panel, the next useful check is species-specific residuals and independent reference uncertainty before calibrating one overall clock.

The calculation itself is simple and reusable. For positive prediction/reference ratios with minimum $m$ and maximum $M$, minimizing the largest absolute relative error balances the two extremes:

$$
a_* = \frac{2}{M+m},
\qquad
E_* = \frac{M-m}{M+m}.
$$

The companion contains all seven inputs so this arithmetic can be reproduced without rerunning a simulation.

## Finding 5: the observable is part of the comparison

“Diffusion coefficient” can hide different questions.

Mean squared displacement summarizes how far particles travel. A scattering experiment measures a signal whose dependence on distance, time, species and instrument resolution matters. A heterogeneous population can give those summaries different emphases.

In a deliberately synthetic example, 80% of particles diffuse at $0.1D_0$ and 20% at $10D_0$. Their mean-displacement diffusivity is $2.08D_0$. Yet at a specified finite scattering window, the single-point log-decay summary is about $0.323D_0$. Compared with a uniform population at $D_0$, the ordering reverses.

No molecular trajectory changed in that example. The summary changed. The log-decay quantity is not a fitted experimental linewidth, and the example is not a quantitative model of an experiment.

Temperature comparisons need similar care. Herwig and colleagues’ study of butane and hexane monolayers compares scattering and simulation near their respective melting transitions. The reported simulation/experimental melting temperatures are 152/116 K and 221/170 K. Equal reduced temperature, $T/T_m$, therefore corresponds to different absolute temperatures. This can be appropriate for studying mechanisms near melting, but it does not establish accuracy at a chosen operating temperature. The authors discuss the limitation. [Primary paper](https://doi.org/10.1063/1.474881).

The lesson for a potential-selection task is concrete: specify the observable, state and measurement procedure before ranking models. Agreement after changing the comparison target answers a different question.

## Where formalization fits

Lean is useful because it forces a claim to name its premises. Exact arithmetic is useful because a rounding error can change a narrow decision margin. Numerical tests are useful because a correct formula can be implemented incorrectly.

Each has a different reach.

A proof about real-valued inputs does not by itself establish floating-point correctness. A correct program does not establish that the reference describes the intended physical state. A theorem about a supplied uncertainty set does not calibrate that uncertainty set from nature.

The calculations highlighted here have their actual checking levels stated in the companion. We are not labeling all of them Lean proofs. The program’s task is to connect the relevant mathematical statement, executable calculation and physical comparison where the intended claim needs all three.

## What we will do differently next

The next stage follows from these results.

First, evaluate proposed corrections against simple baselines and a declared task tolerance. A low-dimensional pattern earns further attention when it predicts an improvement that a common-bias explanation cannot provide.

Second, test acquisition policies through the updates they cause. Finding high-error labels is promising; the stronger result is improved target performance at matched cost.

Third, choose additional observations for the ambiguity they resolve. A more precise repeat of the same measurement may leave shared bias or an unobserved population untouched. Another compatible reference, a species-resolved measurement, or a matched observation window may distinguish the alternatives.

Finally, continue broad extraction across studies while testing the most consequential uncertainties. The library supplies contrasts; focused calculations tell us which contrasts deserve new physical work.

Our progress is a more demanding account of what an error pattern can justify. We have a useful prioritization result, a weaker case for special low-rank correction than concentration alone suggested, a concrete limit on common diffusion rescaling, and clearer specifications for comparing simulations with measurements.

Those findings give us better choices about what to compute, what to measure, and when to revise an appealing explanation.

---

### Evidence and reproducibility

This is a research explainer, not a peer-reviewed paper. Literature values belong to the cited studies; Lupine’s contributions here are the scoped reanalyses, conditional calculations and research decisions.

- [Numerical companion: values, formulas, evidence dates and limits](/data/error-patterns-october-2026.json).
- [Reviewed disagreement-prioritization result](https://library.lupine.science/#/activity/disagreement-triage-20261017-completed-v1).
- [Lupine research Library](https://library.lupine.science/) and [Rhizo source repository](https://github.com/alexwelcing/lupine-rhizo).
- [Sandberg et al., Al–Ni diffusion table](https://arxiv.org/pdf/2410.07886).
- [Herwig et al., monolayer scattering and molecular dynamics](https://doi.org/10.1063/1.474881).

The archive analyses use preserved, previously examined configurations. Their full underlying archive is not redistributed with this post. The companion exposes selected reviewed summaries and arithmetic inputs; it is not a full reproduction package for the archive analyses.
