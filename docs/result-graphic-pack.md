# Lupine Science — Result Graphic Pack

> Publication-ready data graphics for articles, proof packs, decks, and research notes. Generated from structured data as brand-compliant SVGs.

## Scope

This pack covers the quantitative claims that recur across Lupine Science content:

- Climate and refrigerant metrics (GWP, radiative forcing shares)
- Materials-discovery funnels and yields
- Formalization progress (Lean theorem inventory)
- MLIP error-geometry benchmarks

Each graphic is:

- **Data-driven**: source data lives in `data/result-graphics.json`.
- **Brand-locked**: paper background, indigo accent, Newsreader + IBM Plex Mono typography.
- **Accessible**: SVG with `<title>`, `role="img"`, and aria-labelledby.
- **Source-attributed**: every graphic names its source and carries an explanatory note.
- **Downloadable**: individual SVG files in `public/result-graphics/`.

## Files

- `data/result-graphics.json` — source data and metadata.
- `scripts/build-result-graphics.mjs` — generates SVGs from the data file.
- `public/result-graphics/` — generated SVGs and `index.json` manifest.
- `public/result-graphics/index.html` — gallery page.

## Build

```bash
npm run build:graphics
```

This regenerates all SVGs from `data/result-graphics.json`. The full site build (`npm run build`) includes this step.

## Adding a graphic

1. Add an entry to `data/result-graphics.json`:
   - `id`: URL-safe identifier.
   - `title`, `subtitle`: headline and eyebrow.
   - `width`, `height`: SVG canvas size (default 800×450).
   - `type`: `bar`, `stacked-bar`, `funnel`, or `line`.
   - `data`: array of data points.
   - `source`, `note`: attribution and interpretation.
2. Implement or extend the renderer in `scripts/build-result-graphics.mjs`.
3. Run `npm run build:graphics` and inspect the output.
4. Add the graphic to `public/result-graphics/index.html` and to the relevant article(s).

## Usage in articles

```html
<figure>
  <img src="/result-graphics/gwp-comparison.svg"
       alt="Refrigerant 100-year GWP comparison">
  <figcaption>
    IPCC AR6 · mass basis, CO₂ = 1.
    Lower-GWP refrigerants reduce non-CO₂ climate forcing from cooling.
  </figcaption>
</figure>
```

## Design tokens

Inherited from `docs/content-design-system.md`:

| Token | Value | Usage |
|---|---|---|
| `--paper` | `#faf9f6` | SVG background |
| `--ink` | `#16171d` | Titles, body |
| `--ink-soft` | `#4c4e58` | Captions, notes |
| `--indigo` | `#3d4db3` | Primary data marks |
| `--verified` | `#3a8f5b` | Positive / low-GWP |
| `--ochre` | `#8a5e1f` | Methane / distinction |
| `--serif` | `Newsreader, Georgia, serif` | Titles |
| `--mono` | `IBM Plex Mono, monospace` | Labels, numbers |

## Roadmap

- Add MLIP error-geometry benchmark charts (participation ratio, cross-MLIP cosine).
- Add proof-pack figure variants (smaller aspect ratios, print-optimized).
- Add a dark variant for deck slides.
- Add responsive `srcset` generation for PNG fallbacks.
