# The Z1 Barrier Panel: 42 Li-ion Migration Paths from a Published DFT-NEB Benchmark

> **Type:** Research note
> **Date:** 2026-07-20  
> **Updated:** 2026-11-11
> **Deck:** The locked Li-ion migration-path panels behind our barrier campaigns: what is in them, why we chose them, what a migration barrier is, and what Round 5 found  
> **Summary:** Our barrier campaigns run on 42 published Li-ion migration paths from the LiTraj nebDFT2k benchmark: 30 frozen test paths and 12 disjoint training paths. In Round 4, four foundation MLIPs missed a 40 meV gate on the test panel; in Round 5, a direction-gated correction abstained for all four models, so none was applied.  
> **Status:** Published
> **Ontology:** T2, E4, MC4

---

![The Z1 test range: varied solid-electrolyte sample cells between a charging station and a grid battery, one barrier path crossing each specimen](images/the-materials-we-test-against-hero--retry-1.jpg)

<p class="lead">Every battery is a traffic problem. Ions have to move, and the toll they pay at each crowded passage — the <em>migration barrier</em> — decides whether the battery is fast, safe, and worth building. Our Z1 campaigns measure how well AI models predict those tolls across 42 real materials. This is the tour of what is in the panels, and why we chose them.</p>

## Why lithium-ion conductors, and why these

The next battery generation — solid-state, safer, denser — needs electrolytes made of ceramic, not liquid. Lithium ions have to hop through a dense crystal lattice, and whether they can do it quickly is the single number that decides if the chemistry works. The materials in our panels come from the published **LiTraj nebDFT2k** benchmark (*npj Computational Materials*, 2025, [DOI 10.1038/s41524-025-01571-z](https://doi.org/10.1038/s41524-025-01571-z)): quantum-chemically computed migration paths through real lithium conductors, with reference barriers from **0.068 eV (barely a speed bump) to 3.25 eV (a wall)**.

Each path is one specific hop: a lithium ion leaving a comfortable site, squeezing through the narrowest point of its lattice — the transition state — and landing in the next site. The energy at the top of that squeeze, relative to the start, is the barrier. Models that predict barriers accurately can screen thousands of candidate electrolytes on a laptop; models that *under*-predict them make slow materials look fast. In Round 4 all four models we tested missed a 40 meV gate; CHGNet and MACE-MP-0 medium under-predicted most barriers, while the other two were mixed.

![An exploded solid-state cell: the electrolyte as the safety-critical bridge between electrodes, rendered in indigo while the casing stays ink linework](images/the-materials-we-test-against-inline-01--retry-1.jpg)

## The test panel: 30 frozen adversaries

The test panel is locked — 30 chemistries, one migration path each, chosen so no single family dominates. It splits into recognizable neighborhoods of the solid-state-battery map:

![A solid-electrolyte diffusion cell mounted in a small test rig, with one ceramic grain boundary enlarged in cutaway and a restrained indigo path crossing it — The test rig measures the ion migration barrier across one grain boundary](images/the-materials-we-test-against-inline-03.jpg)

![The materials adversary panel: varied ceramic pellets, thin films, and pressed cells under identical measurement arches](images/the-materials-we-test-against-inline-02--retry-1.jpg)

![The 30-path Z1 test panel: barrier height by chemistry class](images/panel-barriers-by-class.jpg)

- **Oxides (10 paths)** — the garnet/NASICON/perovskite families (`Al-Li-O`, `Al-Li-O-Si`, `Al-Li-O-V`, `Al-Li-Mn-O`, `B-Li-O-Ti`, `B-Li-O-Zn`, `C-Li-Mn-O`, `C-Li-O-V`, and more). The widest barrier range in the panel, 0.11–3.25 eV: from genuinely promising fast conductors to hopeless ceramics.
- **Borates and other mixed polyanions (10)** — borate frameworks and mixed-anion hosts (`As-B-Cr-Li-O`, `B-Bi-Li-O`, `B-Co-Li-O`, `B-Li-Ni-O`, `B-Li-O`, `B-Li-O-Sn`), 0.33–1.14 eV. An under-studied family where models have the least training exposure.
- **Phosphates and mixed polyanions (5)** — including chemistries from the LiFePO₄ cathode family (`C-Fe-Li-O-P`, `C-Fe-Li-Na-O-P`, `C-Li-Mn-O-P-V`, `C-Li-O-P-V`), 0.52–0.73 eV. These are cathode-related phosphates rather than electrolytes; the benchmark includes them as Li-ion conductors, which is why this page does not call all 42 paths electrolytes.
- **Halides (2)** — `Ag-F-Li` and `Cl-Cr-Li`, 0.07–1.58 eV.
- **Sulfides (2)** — `Bi-Li-S`, `C-Fe-Li-O-S`, the soft-lattice family, 0.46–0.64 eV.
- **Nitride (1)** — `Ca-Li-N-Si`, a nitridosilicate at 2.07 eV.

Every number comes from published DFT-NEB calculations — not experiment, and we say so. The panel is frozen with a SHA-256 lock (`192fe54a…`), so the test set cannot quietly change after results come in.

## The training panel: 12 chemistries we never test on

![Six electrolyte classes, specimen-plate style](images/electrolyte-class-gallery.png)

For the correction pilot (Round-5), a correction model is allowed to *learn* — but never from test materials. The training panel is 12 chemistries from the same dataset's training split, with **zero overlap** in chemistry or material identity with the test panel, selected by a deterministic hash order:

`Al-Cr-Li-O`, `B-Cr-Li-O-P`, `Ba-Li-O`, `Bi-Li-O-P`, `Fe-Li-Mn-O-Ti`, `Fe-Li-Mn-O-V`, `Fe-Li-O`, `Fe-Li-O-Ti`, `In-Li-O-Sc-Si`, `Li-Na-O-Ti`, `Li-O-P-Ti`, `Li-O-V-Zn`

This is what a real screening loop demands: the correction has to transfer to chemistries it has never seen. If it only works on familiar materials, it is not a correction, and the protocol is designed to catch exactly that.

## What Round 5 found

*Added 2026-11-11.* Round 5 (preregistered 2026-07-20) fitted a direction-gated linear barrier correction for each model on this training panel, to be applied to the frozen Round-4 test predictions. The rule lets the correction act only where every training path errs in the same direction. That condition failed for all four models, so every model abstained and no correction was applied (lupine-rhizo `data/candidates/z1r5/correction-score.json`). An abstention is not a pass: barrier correction on this panel remains open.

## Why these are the right adversaries

Three reasons this panel fights back:

1. **It spans the whole decision space.** Barriers from 0.068 to 3.25 eV mean the panel covers "ship it" (under ~0.3 eV), "maybe, with engineering" (0.3–0.7), and "walk away" (>1 eV) — a model that only gets the easy half right will be caught.
2. **It hits the models' blind spot.** These are dense ceramics with under-coordinated transition states — out-of-equilibrium configurations that foundation-model training data covers thinly. In Round 4 all four models missed a 40 meV gate, with mean absolute errors of 135.0–242.5 meV on completed paths.
3. **It is public and reproducible.** Anyone can rebuild the panel from the source archive (`tools/build_z1_barrier_panel.py`, byte-identical), check the hash, and re-run the comparison — adversaries with receipts.


![An empty fleet-charging depot with a row of chargers backed by sealed solid-state storage cabinets, two electrolyte coupons lie in a foreground test tray — The storage cabinets discharge into the chargers during a brief demand peak](images/the-materials-we-test-against-spread.jpg)
## Receipts

- Test panel: `data/candidates/z1_nebdft2k_barriers.lock.json` (SHA-256 `192fe54a…`), 30 paths
- Training panel: `data/candidates/z1r5_correction_train.lock.json` (SHA-256 `4099f4fc…`), 12 disjoint paths
- Source: LiTraj nebDFT2k benchmark ([DOI 10.1038/s41524-025-01571-z](https://doi.org/10.1038/s41524-025-01571-z)), source revision and archive hash pinned in both locks
- Round-5 correction outcome: `data/candidates/z1r5/correction-score.json` (all four models abstained at the direction gate)
- Campaign results: [Round 4: Three Failures and One Abstention, Preregistered](/articles/four-gates-three-honest-failures-one-live-experiment/) and the full records at [library.lupine.science](https://library.lupine.science)
