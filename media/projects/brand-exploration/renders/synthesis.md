# Brand exploration synthesis — v1 through v7

## What we ran

Seven generations of motif × variant matrices (80 images total), with progressively stricter style suffixes and a concept swap for the weakest motif.

| Version | Prompt strategy | Result |
|---|---|---|
| v1 | Base art-direction style suffix | Heavy palette drift: cyan, purple, orange, gold. |
| v2 | Added `strict two-color palette`, `no cyan/teal/purple/orange/gold`, `not photographic` | Much closer; shape-of-wrongness and bits-to-atoms usable. |
| v3 | Added `solid flat background`, `no gradients/sky/fog/bokeh`, `only crisp vector lines` | **Best overall.** Shape-of-wrongness is clean, readable, on-brand. |
| v4 | Pushed `minimalist line-art`, `blueprint precision`, `single continuous ribbon` | Bits-to-atoms improved; upstream-cascade still weak. |
| v5 | Tried `risograph print`, `halftone`, `bold graphic shapes` | Bits-to-atoms became a strong graphic; upstream-cascade exploded into cyan. Risograph keyword is too volatile for this motif. |
| v6 | Re-ran shape-of-wrongness + two replacement motifs (`error-vector-alignment`, `calibration-grid`) with the v3 style suffix | Replacement motifs landed conceptually but palette still drifted (cyan arrows, 3D glass waves). |
| v7 | Stripped poetic language, added `no glow/blur/shadows/3D/photography`, and explicitly forbade text/numbers | **Error-vector alignment is the clear replacement winner.** Clean indigo arrows on warm paper. Calibration grid still produced unwanted labels/axes. |

## Winners

- **Cover / hero:** `v3/shape-of-wrongness_wide.jpg` — clean paper, clear indigo ribbon, strong negative space, readable under text.
- **Bits → atoms:** `v4/bits-to-atoms_wide.jpg` for a soft transition; `v5/bits-to-atoms_wide.jpg` for a bold risograph poster look.
- **Upstream cascade replacement:** `v7/error-vector-alignment_wide.jpg` — indigo arrows fanning out and converging, clean paper, no cyan, reads as consensus/correction.

## Production deliverables

Built from the cover/hero winner and committed to the public site:

- `renders/deliverables/og-card.jpg` → `public/og-lupine-science.jpg` (1200×630)
- `renders/deliverables/site-hero.jpg` → `public/ribbon-still.jpg` (2400×1200)
- `renders/deliverables/one-pager-cover.jpg` → `public/one-pager-assets/cover-shape-of-wrongness.jpg` (1024×576)
- `renders/deliverables/deck-slide-16x9.jpg` (1920×1080)
- `renders/deliverables/deck-slide-4x3.jpg` (1600×1200)

The site `index.html` OG/Twitter meta tags now point to the new card, and the public-ledger fallback entries were refreshed to the latest commits.

## Lessons

- MiniMax `image-01` understands color constraints better when they are framed as negative commands (`no cyan, no purple`) *and* positive constraints (`strict two-color palette`).
- `solid flat background` and `no gradients` were the most effective levers for killing sky/fog/bokeh.
- `risograph` produces high-impact graphics but the model freely reinterprets the background color and accent color; it needs to be combined with an even tighter palette lock.
- Poetic words (`luminous`, `gracefully`, `rippling`) invite glow, blur, and 3D. The winning prompts use flat, geometric language.
- Some concepts (`upstream-cascade`, `calibration-grid`) are inherently harder for the model than others; it is cheaper to swap the concept than to keep hammering the same one.
- Error-vector alignment works because it is simple geometry (lines/arrowheads) with a clear left→right narrative.

## Next loops

1. Build deck slides with actual headline/subhead copy over `deck-slide-16x9.jpg`.
2. Generate a few palette-locked variations of `error-vector-alignment` (denser, quieter, square) to round out the motif library.
3. Run a small v8 that tries `bits-to-atoms` with the v7 flat-vector suffix to see if we can get a cleaner on-brand version.
