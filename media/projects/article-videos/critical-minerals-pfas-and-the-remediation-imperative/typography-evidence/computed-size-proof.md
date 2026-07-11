# Typography floor proof

Composition: `index.html`
Canvas: 1920 × 1080
Verified: 2026-07-10

## Source and computed-size inventory

| Selector | Source size | Computed size | Elements | Overflow |
|---|---:|---:|---:|---:|
| `.small-stat` | 36 px | 36 px | 1 | 0 |
| `.loop-node` | 36 px | 36 px | 3 | 0 |
| `.filter` | 36 px | 36 px | 1 | 0 |
| `.waste` | 36 px | 36 px | 1 | 0 |
| `.site-row .chip` | 36 px | 36 px | 4 | 0 |
| `.engine` | 36 px | 36 px | 1 | 0 |
| `.campaign` | 36 px | 36 px | 2 | 0 |

Computed styles were read in Chromium from the mounted 1920 × 1080 composition. Overflow is counted when `scrollWidth > clientWidth` or `scrollHeight > clientHeight`. All 13 affected informational elements report zero overflow.

The `.small-stat` line-height is 1.3 (47 px computed box height) so IBM Plex Mono glyph bounds fit without vertical overflow. The compact PFAS filter and waste cards retain 36 px type with 134 px content boxes and no horizontal or vertical overflow.

## Exact settled-frame evidence

- `frame-00-at-23.0s.png` — World 02
- `frame-01-at-41.0s.png` — World 03
- `frame-02-at-58.0s.png` — World 04
- `frame-03-at-93.0s.png` — World 06

Each PNG is full-resolution 1920 × 1080 output from HyperFrames 0.7.48 `snapshot` at the exact requested timestamp.
