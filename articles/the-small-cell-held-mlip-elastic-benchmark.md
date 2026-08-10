# The Small Cell Held: A 16-Element MLIP Elastic Benchmark

> **Type:** Results note
> **Date:** 2026-08-03
> **Deck:** A preserved 16-element comparison of 1×1×1 and 3×3×3 MatPES elastic calculations, with the correction failure reported alongside the result that survived
> **Summary:** On this benchmark, the 1×1×1 TensorNet/PBE arm and the 3×3×3 reference arm have nearly identical elastic-constant error, while the tested global correction operator makes the result substantially worse.
> **Status:** In review — release archived; DOI registration pending
> **Ontology:** T4, E5, MC9

---

<p class="lead">A larger supercell did not buy better elastic-constant accuracy on this 16-element cubic-metal panel. The preserved aggregate reports 14.55 GPa mean absolute error for the 1×1×1 TensorNet/PBE arm and 14.61 GPa for the 3×3×3 reference arm. The recorded runtime ratio is 3.86× in favor of the smaller cell.</p>

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

Use the release manifest to verify files, `scripts/verify.py` to validate the aggregate, and the DOI record once registration is complete to cite this exact version.
