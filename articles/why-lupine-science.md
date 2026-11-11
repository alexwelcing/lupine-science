# Why Lupine Science?

> **The launch essay, June 2026**
> **Date:** 2026-06-30  
> **Updated:** 2026-11-11
> **Deck:** Why we started: AI can propose far more materials than any lab can make, and the models behind those proposals are wrong in ways that can be measured
> **Summary:** Our June 2026 launch essay, revised. Generative AI produces far more material candidates than labs can test, and the simulations used to rank them are wrong in structured ways. We set out to measure those errors before a lab commits to a candidate. A direction, not a result.  
> **Status:** Direction
> **Evidence Status:** Direction, not a result. The first version of this essay promised machine-checkable "certificates" of synthesis, stability and performance and said current potentials could replace DFT in many screening loops; our own results do not support either, and both are withdrawn. What we have tested is on the Round 4 and fcc error-field pages. Our current founding thesis is The Trust Layer.

---

## The belief

The next generation of materials — batteries, catalysts, alloys, membranes — will not be found just by generating more candidates. It will be found by knowing which predictions to trust before a lab spends a year on one.

That distinction matters. AI can now propose millions of new materials in an afternoon. But proposing a structure is not the same as making a thing. Many AI-generated materials are, in effect, fantasy frameworks: plausible on a screen, unstable in a flask. The bottleneck is no longer imagination. It is knowing which proposals deserve the lab's time.

---

## The problem in one sentence

**AI predicts matter, but the simulations behind those predictions are wrong in structured ways.**

![A sample-coupon transfer rail beginning at a simple pixel-pattern mask, passing through an X-ray instrument, and ending at a physical bend-test frame — The same coupon is fabricated, measured, and mechanically tested along one traceable rail](images/why-lupine-science-inline-01.jpg)

Those errors are not random noise. Where we have measured them, they cluster: machine-learned potentials that do well on bulk crystals miss surfaces, vacancies and transition states by much more, and in a pattern that can be measured. Our hypothesis when we started was that structured failure could be characterized and, in some cases, corrected. Since then, that has held in a narrow case (surface energies of fcc metals) and failed in others (migration barriers and catalyst adsorption in Round 4, July 2026).

---

## What we do

![A low evidence table holding three unmarked sample blocks in fitted trays, each tray linked by a tamper-evident physical seal to one nearby instrument socket — The fitted tray and seal preserve sample provenance between storage and measurement](images/why-lupine-science-inline-02.jpg)

1. **Measure.** We test machine-learned interatomic potentials against published references, on panels locked before the test runs.
2. **Test against gates set in advance.** Pass/fail lines are written down before results exist; any amendment made after results are seen is labelled as such.
3. **Publish the verdict.** Pass, fail or abstain, with the data. Lean 4 checks the arithmetic and stated inequalities behind published numbers; it does not check the physics, the reference data or the pipeline.

The public faces of this work are **LUPI**, a browser viewer for structures and simulation output, and the **open record** at `lupine.science` and in our repositories.

![Batteries, water systems, clean industry, and research instruments sharing one validation substrate, with open space for the work still to do](images/why-lupine-science-spread--retry-1.jpg)

---

## Why now

![A small bridge beam mounted in a laboratory load frame, with scattered displacement probes along the beam converging on one restrained indigo strain ribbon — The probes combine into one measured strain profile used to judge the beam](images/why-lupine-science-inline-03.jpg)

- **Generative models** for molecules and crystals are fast and cheap enough to flood the design space.
- **Machine-learning potentials** such as MACE and Orb make screening fast, and our own tests show where they are not yet accurate enough to replace DFT.
- **Proof assistants** such as Lean 4 can check the arithmetic and stated inequalities behind a result, which keeps published numbers honest even though it does not test the physics.

---

## The invitation

If you are a materials scientist with synthesis data or a team building models, the record is open and we would like to hear from you. Our current statement of why this matters is [The Trust Layer](/articles/the-trust-layer/).

**Visit [lupine.science](https://lupine.science).**
