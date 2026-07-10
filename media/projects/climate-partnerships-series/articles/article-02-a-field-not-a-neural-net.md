# A Field, Not a Neural Net

> **Type:** article
>
> **Date:** 2026-07-23
>
> **Scope:** Lupine Science's environment error field, runtime correction, and formal verification layer.
>
> **Description:** How measuring systematic error as a physical field over local atomic environments makes AI-designed materials trustworthy.
>
> **Audience:** Investors, materials scientists, AI-for-science teams, and the curious public
>
> **Status:** Draft

<p class="lead">AI predicts matter, but its predictions are wrong in structured ways. The shape of that wrongness is a field — and a field can be measured, corrected, and machine-checked.</p>

---

## The wrongness has a shape

Body: Introduce the environment error field over coordination number; define the fcc bulk reference at c=12; explain why uMLIPs soften the potential energy surface at defects and surfaces.

## Measured, not learned

Body: Three anchor observables (100, 111, vacancy formation energy) fix the field; cubic spline with P(12)=0; blind prediction of the never-fitted 110 surface energy.

## The r=0.906 result

Body: Present the blind-prediction table and the core result: Pearson r=0.906 (p=10⁻⁴, 95% CI [0.82, 0.96]) across 36 (model, material) combinations with zero adjustable parameters.

## Runtime correction

Body: Additive correction with analytic forces; LAMMPS overlay compatibility; 15.6% overhead in Python dropping below 1% in compiled C++; corrected uMLIPs remain ~10⁵× faster than DFT.

## Machine-checked proof

Body: 77 build-locked Lean 4 theorems, zero sorry proofs; the kernel-rejected claim vignette; impossibility proofs as actionable boundary information.

## The six-step loop

Body: Simulate → identify → validate → generate → verify → improve. How the loop closes between computation and experiment.

<div class="cta">
  <p><strong>Next:</strong> The method maps onto five specific climate-critical materials.</p>
  <a href="/articles/five-materials-that-could-unlock-5-12-gtco2-year/">Read the next article →</a>
</div>
