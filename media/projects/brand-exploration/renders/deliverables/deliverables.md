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

## Rebuild

```bash
python3 media/projects/brand-exploration/scripts/build_deliverables.py
```
