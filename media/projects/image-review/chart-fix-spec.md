# Chart defect fix spec — adversarial image audit follow-up

Context: an OCR-based audit (`scripts/review-images.mjs`) plus human eyeball review found
13 real defects in article charts. All are matplotlib text-collision defects EXCEPT #1,
which is an AI-generated image full of hallucinated gibberish text that must be REPLACED
by a matplotlib rebuild (never re-generate with an image model).

Generators live in `media/projects/article-visuals/generate_<slug>.py` and write JPGs
directly into `public/articles/<slug>/images/`. Re-run with `python3 <script>` (headless
matplotlib is already configured). Each script regenerates ALL of that article's charts —
that is fine (they are deterministic), but verify the untouched ones look unchanged.

Rules for every fix: no text may overlap any other text, marker, bar, arrow, or ellipse
edge. Keep the existing brand palette/constants of each script. Do not change chart data,
titles, or wording — only layout. After regenerating each chart, open it with
ReadMediaFile and confirm zero overlaps before moving on.

## 1. REPLACE beyond-carbon-10-platform-roadmap.jpg (AI gibberish — top priority)

Current image is AI-generated gibberish ("Arasttiveiotool cordenhemiars" etc). Delete it
from the generator's AI-image flow if present there, and instead build a clean matplotlib
concept diagram at the SAME output path
`public/articles/beyond-carbon-the-error-geometry-of-environmental-materials/images/beyond-carbon-the-error-geometry-of-environmental-materials-10-platform-roadmap.jpg`
(add a `viz` function to `generate_beyond_carbon_visuals.py` matching its house style).

Content (real numbers from `articles/beyond-carbon-the-error-geometry-of-environmental-materials.md`):
- Title: "The Path From Measured Error to Trust"
- Three stages, left → right, connected by arrows, one brand-colored rounded box each:
  1. "1 · MEASURE" — "Atomic coordination error field" — detail: "3 anchor observables\ncubic spline + bulk constraint P(12) = 0"
  2. "2 · CORRECT" — "Analytic forces at runtime" — detail: "r = 0.906 blind prediction\nzero adjustable parameters\n15.6% → <1% compiled overhead"
  3. "3 · PROVE" — "Machine-checked trust" — detail: "190 build-locked Lean 4 theorems\nzero sorry\nimpossibility proofs where unsupported"
- Small caption line at bottom: "Each installment follows the same arc: measure, correct, prove."
- Source line: "Source: Lupine Science, Strategic Discovery Plan"
Also update `public/articles/beyond-carbon-the-error-geometry-of-environmental-materials/images/manifest.json`:
the `...-10-platform-roadmap.jpg` entry's `type` becomes `concept-diagram` (keep title/caption).

## 2. five-materials-06-impact-funnel — `generate_five_materials_visuals.py` `viz_06`
Title text ("Device performance") collides with the 3-line detail block (">400 Wh/kg…")
inside the 3rd box; bottom caption is clipped by the red box. Fix: title at y+0.38,
detail anchored va='top' at y-0.05; extend ylim to -0.7 and place the caption at y=-0.35.

## 3. critical-minerals-04-umlip-softening-error — `generate_critical_minerals_pfas.py`
Right panel has TWO overlapping y-axis labels ("Coordination number" over "Energy error (%)");
"Softening bias at low CN" annotation sits on the dashed diagonal; "bulk CN = 12" label
collides with the green dashed vline. Fix: remove the duplicate ylabel, move the
annotation into open space (upper right of left panel) with an arrow to the low-CN
cluster, offset the bulk label left of the vline.

## 4. from-predicted-crystal-03-correction-loop — `generate_from_predicted_crystal_to_commercial_cell.py`
Edge labels are clipped by node ellipses: "bulk-trained potential", "bounded error
budget", "measured from anchors", "machine-checked guarantee", "analytic, conservative".
Fix: push each edge label to mid-edge with a radial offset clear of both ellipses, and
give every edge label a solid background bbox (facecolor BG, pad ~0.25).

## 5. cement-05-correction-loop — `generate_cement_concrete_visuals.py`
Arrows pass through node labels ("Anchor observables", "Error field"); the bottom stats
line is three overlapping segments ("uMLIP speedup vs. DFT 10⁵×" / "Correction overhead
15.6% → <1%" / "build-locked theorems 7/7, zero sorry" — verify exact strings in code).
Fix: node labels get opaque bbox + highest zorder; place the three stats as three
separate non-overlapping lines (or evenly spaced columns) below the diagram.

## 6. a-field-06-discovery-loop — `generate_a_field_not_a_neural_net.py`
Arrows strike through node labels ("Simulate", "Identify", "Validate", "Verify",
"Generate"); edge labels ("EOS, slabs", "228-value reference database", "anchors →",
"Lean 4 theorems", "re-run or prove stop", "P(c)") overlap nodes. Fix: node labels with
opaque bbox on top zorder; edge labels to mid-edge with radial offset + bbox.

## 7. a-field-04-blind-prediction-scatter — `generate_a_field_not_a_neural_net.py`
The bottom caption sentence overlaps the x-axis label ("Measured signed error (J/m²)");
inside the model cards the model name overlaps its stats ("MACE-MP-0 small" / "r = 0.9",
"MACE-MP-0 medium" / "r = 0.47"). Fix: move the caption to `fig.text` below the axes
(add bottom margin via subplots_adjust); inside cards left-align the name and
right-align the stats with clear separation.

## 8. beyond-carbon-09-economics-moat — `generate_beyond_carbon_visuals.py`
"1e+05×" value label overlaps the sentence "DFT cannot afford to screen these spaces
exhaustively"; inside the right-hand cards the category label overlaps its count
("Refrigerant molecules"/"millions", "Cement oxide compositions"/"multi-component").
Fix: move the sentence to a clear area (e.g. under the axis as caption); card layout:
label left-aligned, count right-aligned, vertically centered, no overlap.

## 9. methane-03-environment-error-field — `generate_methane_and_refrigerants.py`
"Low-coord … blind pred" zone label overlaps "Anchor 1 (100)"; "Local force correction"
overlaps "Anchor 3 / vacancy"; "Bulk constraint P(12)=0" overlaps "Force correction" and
the structure inset. Fix: use ax.annotate with offsets + arrows for the three anchors,
move the zone label to clear space, relocate the inset or the bulk/force labels so
nothing touches.

## 10. methane-07-refrigerant-gwp-landscape — same script
Point labels overlap their markers (Propane, Target, R-32). Fix: per-point (dx, dy)
label offsets so every label sits clear of every marker and gridline intersection.

## 11. water-04-blind-prediction — `generate_water_and_air_visuals.py`
"Source: …" line overlaps the x-axis label "Reference value (eV or J/m²)"; the marginal
histograms are misaligned with the scatter (bars float, x-ranges don't line up).
Fix: source line via fig.text at the very bottom; put the marginals on a gridspec with
sharex/sharey (or manually sync their limits/positions with the main axes).

## 12. critical-minerals-02-pfas-contamination-map — `generate_critical_minerals_pfas.py`
The rotated legend label is illegible at render size; the banner line "Global market:
$5–10B by 2030" overlaps the "Sources: …" line. Fix: make the legend horizontal with a
readable font size and a clear title (e.g. "Known contaminated sites"); space the banner
lines so nothing overlaps (Sources as its own fig.text line at bottom).

## 13. a-smooth-environment-resolved-error-field/fig5.png — legend overlaps bars
First search the repo for its generator (`grep -rn "blind facet" --include=*.py .`).
If found: move the legend outside the data area (bbox_to_anchor above the axes) and move
the "* blind facet (never fitted)" note below the axis. If there is NO generator (legacy
hand-made figure), skip it and note that in your report.

## Acceptance
1. Every chart above re-opened with ReadMediaFile: zero text overlaps, all text real.
2. Full audit re-run: `cd /home/alex/Dev/lupine/lupine-science && node scripts/review-images.mjs --no-fail`
   → expect 0 P0; any remaining P1 on these files must be eyeballed by you and explained.
3. Report back: per chart — fixed/skipped, what changed, and the final audit P0/P1 counts.
   Do NOT git-commit anything. Do not touch files outside the listed generators,
   the two image dirs, and the one manifest.json.
