> **Date:** 2026-07-09
> **Updated:** 2026-11-11
> **Deck:** A July 2026 draft on why trust, not prediction volume, limits computational materials discovery, kept for the record
> **Summary:** Archived. A July 2026 draft that framed our work as an investment case. With that framing removed, what remains repeats the founding thesis, The Trust Layer.
> **Status:** Archived
> **Archived:** 2026-11-11
> **Superseded By:** /articles/the-trust-layer/
> **Archive Note:** This July 2026 draft framed our work as an investment case. With the investment framing removed, what remains repeats the founding thesis, The Trust Layer.


# Investing in the Trust Layer

<p class="lead">This page held a July 2026 draft that presented our work as an investment case, with a budget, a list of organisations described as collaborators, and capability claims our later results did not support. We have removed those parts. No organisation named in the draft was a partner. The argument that remains is stated more carefully in <a href="/articles/the-trust-layer/">The Trust Layer</a>, and the result it relied on is on <a href="/articles/a-smooth-environment-resolved-error-field/">the fcc error-field page</a>.</p>

## What the draft argued

Computational materials discovery is no longer short on imagination. GNoME reported 380,000 computationally stable structures, of which 736 had been independently synthesized by late 2023, about 0.2%[^1]. The A-Lab Author Correction (Nature 650:E1, 2026) records 36 confirmed of 57 eligible targets, with 4 inconclusive and one compound removed for training-data leakage; a separate review disputed the novelty classification of many targets[^2]. The scarce resource is no longer the ability to propose or simulate a material. It is knowing which predictions to believe.

![From millions of predictions to a handful of validated materials](images/investing-in-the-trust-layer-01-generation-funnel.jpg)

The draft's evidence was the fcc error field. Its current, scoped statement: for nine fcc metals, an error field fitted to three other observables predicted the never-fitted (110) surface-energy error of four foundation MLIPs at r = 0.906 across 36 model–material cells (material-clustered 95% CI 0.82–0.96; permutation null centred near 0.44; significant for three of the four models). Used as an energy-only correction beside CHGNet, the field cut blind (110) surface-energy error from 9.7% to 1.5% on nickel and from 28.0% to 13.7% on copper: one model, two metals, one facet.

## What we removed, and why

- **The investment framing, budget and "the ask".** We do not publish funding statements on this site.
- **The partner architecture.** The draft listed laboratories, companies and a national laboratory as collaborators. None was, and we do not name organisations as partners unless they have agreed.
- **Capability claims.** Statements that the correction transfers to barriers, halide electrolytes or other structure families, and that corrected models are "trustworthy", went beyond the evidence. In Round 4 (July 2026) the raw models missed our barrier gate and our adsorption and lattice/elastic correction tests failed ([Round 4](/articles/four-gates-three-honest-failures-one-live-experiment/)); in Round 5 our barrier correction abstained for all four models.
- **A misattributed citation.** The draft credited our own 15–60× defect/bulk error ratio to an external benchmark paper.
- **A theorem count used as evidence.** Lean checks the arithmetic and stated inequalities behind published numbers; it does not check the physics, the reference data or the pipeline.

The retired claims are listed with dates in the [corrections log](/corrections/).

## Footnotes

[^1]: A. Merchant *et al.*, "Scaling deep learning for materials discovery," *Nature* **624**, 80–85 (2023). https://doi.org/10.1038/s41586-023-06735-9

[^2]: N. J. Szymanski *et al.*, "An autonomous laboratory for the accelerated synthesis of novel materials," *Nature* **624**, 86–91 (2023); J. Leeman *et al.*, "Challenges in High-Throughput Inorganic Materials Prediction and Autonomous Synthesis," *PRX Energy* **3**, 011002 (2024). https://doi.org/10.1038/s41586-023-06734-7; https://doi.org/10.1103/PRXEnergy.3.011002
