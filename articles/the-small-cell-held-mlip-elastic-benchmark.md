# The Small Cell Held: A 16-Element MLIP Elastic Benchmark

> **Type:** Results note
> **Date:** 2026-08-03
> **Updated:** 2026-11-11
> **Deck:** A preserved 16-element comparison of 1×1×1 and 3×3×3 MatPES elastic calculations, with the correction failure reported alongside the result that survived
> **Summary:** On a 16-metal panel, 1×1×1 TensorNet/PBE cells matched 3×3×3 cells for elastic-constant error (14.55 vs 14.61 GPa MAE), while a global correction made the result worse (63.40 GPa).
> **Status:** Published
> **Evidence Status:** One recorded run on 16 cubic metals. Release v1.0.0 is archived; no DOI has been registered yet. Not peer-reviewed.
> **Ontology:** T4, E5, MC9

---

<p class="lead">A larger supercell did not buy better elastic-constant accuracy on this 16-element cubic-metal panel. The preserved aggregate reports 14.55 GPa mean absolute error for the 1×1×1 TensorNet/PBE arm and 14.61 GPa for the 3×3×3 reference arm. The recorded runtime ratio is 3.86× in favor of the smaller cell. The global correction we tested alongside it made the error worse, not better: 63.40 GPa.</p>

## The result

The benchmark compares five pre-defined arms against the `TPBE_0K` target reference. The central comparison is deliberately narrow:

| Arm | Mean absolute error | Recorded runtime |
|---|---:|---:|
| TensorNet/PBE, 1×1×1 | 14.55 GPa | 48.32 s |
| TensorNet/PBE, 3×3×3 | 14.61 GPa | 186.32 s |
| Three-model ensemble, 1×1×1 | 11.60 GPa | 130.26 s |
| Global LOO-PCA correction, 1×1×1 | 63.40 GPa | 48.32 s |

On this panel, the small-cell and large-cell arms report 14.55 and 14.61 GPa MAE, respectively, with a recorded runtime ratio of 3.86×. The ensemble is the accuracy winner, but costs more than the single-model small-cell arm.

## The result that failed

The correction operator did not help. A leave-one-element-out PCA bias learned from the other 15 elements increased MAE from 14.55 to 63.40 GPa. That negative result is part of the archive, not an omitted branch of the experiment. The package validator intentionally does not require a correction to improve: the pre-registered pivot was to report supercell independence if the operator failed.

## What is preserved

Release [`v1.0.0`](https://github.com/alexwelcing/lupine-mlip-benchmark/releases/tag/v1.0.0) contains the executable benchmark package, canonical aggregate, the raw JSON files present in the package, citation metadata, and a SHA-256 manifest. The repository-owned validator exits successfully against the canonical result. A second offsite copy of the release archive, aggregate, and `results/raw` tree is stored in the Lupine artifact bucket and was checked against the release archive hash.

The provenance boundary remains explicit. The canonical aggregate records MatPES release `2025.2` and run time `2026-06-27T03:44:17.276718+00:00`, but its generation-time `git_sha` and `host` fields are `unknown`. The release binds the preserved files together; it does not retroactively infer those missing fields.

## Scope

This is a cost–accuracy benchmark, not a claim of new physics or universal supercell independence. It covers 16 cubic metals, one recorded run, cache-warm single-relax timings, and a CPU-equivalent cost convention with one core. The headline target is PBE; r2SCAN values are a sensitivity check built from an approximated scalar bulk-modulus shift. Gold uses a PW91-GGA fallback. The raw directory in the package is not a complete 192-case rerun: some aggregate inputs came from the external Lupine data directories named in the configuration.

Use the release manifest to verify files and `scripts/verify.py` to validate the aggregate. No DOI has been registered yet; cite release v1.0.0.

## Related result: a correction ceiling, not a correction

A separate Round-2 analysis on the same 16 cubic metals used a different operator, and its headline is easy to misread next to this one. On 16 elemental cubic metals with four MatPES MLIPs (128 cases; r2SCAN targets approximate), one bias direction per functional transfers out of sample. When the held-out reference sets how far to correct, MAE falls from 17.84 to 10.36 GPa: a ceiling, not a deployable correction. A correction that works without seeing the answer is still open, and derived moduli are uncertified. The global operator above is the kind that does not see the answer, and it made the error worse. Source: lupine-rhizo `paper/lupine-layer2-3x3x3-final-paper.md`.
