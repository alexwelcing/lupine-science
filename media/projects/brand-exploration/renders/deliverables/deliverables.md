# Brand production deliverables

Generated from the winning brand-exploration still (`v3/shape-of-wrongness_wide_v3.jpg`) using `scripts/build_deliverables.py`.

| File | Size | Usage | Deployed to |
|---|---|---|---|
| `og-card.jpg` | 1200×630 | Open Graph / Twitter card | `public/og-lupine-science.jpg` |
| `site-hero.jpg` | 2400×1200 | Fallback hero background behind the live ribbon | `public/ribbon-still.jpg` |
| `one-pager-cover.jpg` | 1024×576 | One-pager top image | `public/one-pager-assets/cover-shape-of-wrongness.jpg` |
| `deck-slide-16x9.jpg` | 1920×1080 | Pitch deck background (16:9) | — |
| `deck-slide-4x3.jpg` | 1600×1200 | Pitch deck background (4:3) | — |

## Build notes

- All crops are center-cropped to the target aspect ratio and resized with Lanczos.
- A paper-wash overlay is applied to keep type readable:
  - OG card: bottom-weighted vignette.
  - Site hero: bottom-third ease-out fade.
  - Deck slides: left-to-right quadratic fade.
- Type on the OG card is set in Noto Serif (italic headline) and Noto Sans Mono (URL).
- The public site meta tags in `public/index.html` now reference `https://lupine.science/og-lupine-science.jpg`.

## Pitch slides

Headline/subhead slides rendered over the deck backgrounds by `scripts/build_pitch_slides.py`:

- `slides/slide-01-16x9.jpg` — Title: "The trust layer for the age of AI-designed matter."
- `slides/slide-02-16x9.jpg` — Inflection: AI is leaving the screen and entering matter.
- `slides/slide-03-16x9.jpg` — Catch: every prediction is wrong in a structured way.
- `slides/slide-04-16x9.jpg` — Insight: the wrongness has a shape.
- `slides/slide-05-16x9.jpg` — Proof: 36 cells, blind γ₁₁₀ r = 0.906, p = 10⁻⁴.
- `slides/slide-06-16x9.jpg` — Product: a run-time correction beside the calculator.
- `slides/slide-07-16x9.jpg` — Product: floor + ceiling.
- `slides/slide-08-16x9.jpg` — Moat: proof, not promises.
- `slides/slide-09-16x9.jpg` — Vision: validation substrate for a real-world Replicator.

All slides are also rendered in 4:3.

## Rebuild

```bash
python3 media/projects/brand-exploration/scripts/build_deliverables.py
python3 media/projects/brand-exploration/scripts/build_pitch_slides.py
```
