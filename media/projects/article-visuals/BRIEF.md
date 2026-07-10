# Visual Brief

## Brand system

- Background: warm paper `#faf9f6` or soft indigo wash `#d9d8ff`.
- Primary accent: indigo `#3d4db3`.
- Text: ink `#1a1a1a`, secondary `#555555`.
- Chart colors: indigo `#3d4db3`, amber `#e8a838`, sage `#5a8a6e`, slate `#6b7c8e`, rose `#c75b5b`.
- Typography: IBM Plex Mono for labels, Newsreader for titles (when possible); otherwise use system sans-serif with tight leading.

## Output specs

- Landscape: 1280×720 px, 150 DPI, JPG quality 90.
- Square: 1080×1080 px for social crops.
- File naming: `<slug>-<nn>-<short-name>.jpg`.
- Captions: one sentence, source-attributed, placed in article markdown as `<figure>` captions.

## Visual archetypes

1. **Data chart** — bar, line, scatter, funnel, Sankey, area. Built with Python matplotlib/seaborn/plotly from real numbers.
2. **Concept diagram** — SVG or matplotlib: boxes, arrows, fields, lattices, process loops.
3. **Evidence panel** — side-by-side before/after, error map, comparison table rendered as an image.
4. **Scene illustration** — MiniMax-generated, used only when the concept is narrative (e.g., a lab bench, a global map, a material surface).

## Sources

- Peer-reviewed papers referenced in each article's footnotes.
- IEA, IPCC, DOE/NREL, IRENA, UNEP, World Bank, UN Water.
- No internal-only numbers unless explicitly labeled "Lupine estimate / unaudited."
