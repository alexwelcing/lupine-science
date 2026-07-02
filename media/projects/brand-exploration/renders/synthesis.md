# Brand exploration synthesis — v1 through v5

## What we ran

Five generations of a 3-motif × 4-variant matrix (60 images total), each with a progressively stricter style suffix.

| Version | Prompt strategy | Result |
|---|---|---|
| v1 | Base art-direction style suffix | Heavy palette drift: cyan, purple, orange, gold. |
| v2 | Added `strict two-color palette`, `no cyan/teal/purple/orange/gold`, `not photographic` | Much closer; shape-of-wrongness and bits-to-atoms usable. |
| v3 | Added `solid flat background`, `no gradients/sky/fog/bokeh`, `only crisp vector lines` | **Best overall.** Shape-of-wrongness is clean, readable, on-brand. |
| v4 | Pushed `minimalist line-art`, `blueprint precision`, `single continuous ribbon` | Bits-to-atoms improved; upstream-cascade still weak. |
| v5 | Tried `risograph print`, `halftone`, `bold graphic shapes` | Bits-to-atoms became a strong graphic; upstream-cascade exploded into cyan. Risograph keyword is too volatile for this motif. |

## Winners

- **Cover / hero:** `v3/shape-of-wrongness_wide.jpg` — clean paper, clear indigo ribbon, strong negative space, readable under text.
- **Bits → atoms:** `v4/bits-to-atoms_wide.jpg` for a soft transition; `v5/bits-to-atoms_wide.jpg` for a bold risograph poster look.
- **Upstream cascade:** None of the five landed. The motif keeps drifting to lavender/cyan bokeh or a cyan explosion. Recommend replacing it with a different concept (e.g., "error-vector alignment" or "calibration grid") rather than more prompt tightening.

## Lessons

- MiniMax `image-01` understands color constraints better when they are framed as negative commands (`no cyan, no purple`) *and* positive constraints (`strict two-color palette`).
- `solid flat background` and `no gradients` were the most effective levers for killing sky/fog/bokeh.
- `risograph` produces high-impact graphics but the model freely reinterprets the background color and accent color; it needs to be combined with an even tighter palette lock.
- Some concepts (`upstream-cascade`) may be inherently harder for the model than others; it is cheaper to swap the concept than to keep hammering the same one.

## Next loops

1. Generate a replacement motif for upstream-cascade: `error-vector alignment` or `calibration grid` using the v3 style suffix.
2. Run a v6 that palette-locks the v3 cover winner with slight variations (closer crop, darker ink, more paper).
3. Build the OG card, one-pager hero, and deck backgrounds from the chosen winners.
