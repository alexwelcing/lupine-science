# The Z1 Barrier Panel: Evaluating Foundation MLIPs on 42 Solid-State Electrolyte Chemistries

> **Field note from the live lab**
> **Date:** 2026-07-20  
> **Deck:** One step in the trust-layer program: the locked Li-ion conductor panels behind our barrier campaigns — what they are, why they are the right adversaries, and what a migration barrier actually is  
> **Summary:** Our barrier campaigns run on 42 published Li-ion electrolyte materials: 30 frozen test chemistries and 12 disjoint training chemistries. Here is what is in the panels and why these materials decide whether solid-state batteries ever ship.  
> **Status:** Final

---

![A lithium ion squeezing through a lattice bottleneck](images/li-hop-journey.png)

<p class="lead">Every battery is a traffic problem. Ions have to move, and the toll they pay at each crowded passage — the <em>migration barrier</em> — decides whether the battery is fast, safe, and worth building. Our Z1 campaigns measure how well AI models predict those tolls across 42 real materials. This is the tour of what is in the panels, and why these particular materials get a vote on the future of solid-state batteries.</p>

## Why lithium-ion conductors, and why these

The next battery generation — solid-state, safer, denser — needs electrolytes made of ceramic, not liquid. Lithium ions have to hop through a dense crystal lattice, and whether they can do it quickly is the single number that decides if the chemistry works. The materials in our panels come from the published **LiTraj nebDFT2k** benchmark (*npj Computational Materials*, 2025, [DOI 10.1038/s41524-025-01571-z](https://doi.org/10.1038/s41524-025-01571-z)): quantum-chemically computed migration paths through real lithium conductors, with reference barriers from **0.068 eV (barely a speed bump) to 3.25 eV (a wall)**.

Each path is one specific hop: a lithium ion leaving a comfortable site, squeezing through the narrowest point of its lattice — the transition state — and landing in the next site. The energy at the top of that squeeze, relative to the start, is the barrier. Models that predict barriers accurately can screen thousands of candidate electrolytes on a laptop; models that *under*-predict them — which is what we measured, systematically, in every model we tested — quietly tell engineers that dead materials look alive.

## The test panel: 30 frozen adversaries

The test panel is locked — 30 chemistries, one migration path each, chosen so no single family dominates. It splits into recognizable neighborhoods of the solid-state-battery map:

![The 30-path Z1 test panel: barrier height by chemistry class](images/panel-barriers-by-class.jpg)

- **Oxides (10 paths)** — the garnet/NASICON/perovskite families (`Al-Li-O`, `Al-Li-O-Si`, `Al-Li-O-V`, `Al-Li-Mn-O`, `B-Li-O-Ti`, `B-Li-O-Zn`, `C-Li-Mn-O`, `C-Li-O-V`, and more). The widest barrier range in the panel, 0.11–3.25 eV: from genuinely promising fast conductors to hopeless ceramics.
- **Borates and other mixed polyanions (10)** — borate frameworks and mixed-anion hosts (`As-B-Cr-Li-O`, `B-Bi-Li-O`, `B-Co-Li-O`, `B-Li-Ni-O`, `B-Li-O`, `B-Li-O-Sn`), 0.33–1.14 eV. An under-studied family where models have the least training exposure.
- **Phosphates and mixed polyanions (5)** — the LiFePO₄ working horses (`C-Fe-Li-O-P`, `C-Fe-Li-Na-O-P`, `C-Li-Mn-O-P-V`, `C-Li-O-P-V`), 0.52–0.73 eV — the materials already inside commercial cells.
- **Halides (2)** — `Ag-F-Li` and `Cl-Cr-Li`, the halide electrolyte class now drawing serious commercial attention, 0.07–1.58 eV.
- **Sulfides (2)** — `Bi-Li-S`, `C-Fe-Li-O-S`, the soft-lattice family behind several production programs, 0.46–0.64 eV.
- **Nitride (1)** — `Ca-Li-N-Si`, a nitridosilicate at 2.07 eV.

Every number comes from published DFT-NEB calculations — not experiment, and we say so. The panel is frozen with a SHA-256 lock (`192fe54a…`), so the test set cannot quietly change after results come in.

## The training panel: 12 chemistries we never test on

![Six electrolyte classes, specimen-plate style](images/electrolyte-class-gallery.png)

For the correction pilot (Round-5), a correction model is allowed to *learn* — but never from test materials. The training panel is 12 chemistries from the same dataset's training split, with **zero overlap** in chemistry or material identity with the test panel, selected by a deterministic hash order:

`Al-Cr-Li-O`, `B-Cr-Li-O-P`, `Ba-Li-O`, `Bi-Li-O-P`, `Fe-Li-Mn-O-Ti`, `Fe-Li-Mn-O-V`, `Fe-Li-O`, `Fe-Li-O-Ti`, `In-Li-O-Sc-Si`, `Li-Na-O-Ti`, `Li-O-P-Ti`, `Li-O-V-Zn`

This is the honest version of what a real screening loop demands: the correction has to transfer to chemistries it has never seen — if it only works on familiar materials, it is a parlor trick, and the protocol is designed to catch exactly that.

## Why these are the right adversaries

Three reasons this panel fights back:

1. **It spans the whole decision space.** Barriers from 0.068 to 3.25 eV mean the panel covers "ship it" (under ~0.3 eV), "maybe, with engineering" (0.3–0.7), and "walk away" (>1 eV) — a model that only gets the easy half right will be caught.
2. **It hits the models' blind spot.** These are dense ceramics with under-coordinated transition states — exactly the out-of-equilibrium configurations foundation models under-train on. Our Round-4 result (all four models under-predicting, 135–243 meV mean error against a 40 meV gate) is the proof.
3. **It is public and reproducible.** Anyone can rebuild the panel from the source archive (`tools/build_z1_barrier_panel.py`, byte-identical), check the hash, and re-run the comparison — adversaries with receipts.

## Receipts

- Test panel: `data/candidates/z1_nebdft2k_barriers.lock.json` (SHA-256 `192fe54a…`), 30 paths
- Training panel: `data/candidates/z1r5_correction_train.lock.json` (SHA-256 `4099f4fc…`), 12 disjoint paths
- Source: LiTraj nebDFT2k benchmark ([DOI 10.1038/s41524-025-01571-z](https://doi.org/10.1038/s41524-025-01571-z)), source revision and archive hash pinned in both locks
- Campaign results: [Four Gates, Three Honest Failures, One Live Experiment](/articles/four-gates-three-honest-failures-one-live-experiment/) and the full records at [library.lupine.science](https://library.lupine.science)
