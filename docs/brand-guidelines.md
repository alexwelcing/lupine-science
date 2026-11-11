# Lupine Science — Brand guidelines

> Look and voice for every Lupine Science surface. Words follow
> [messaging-canon.md](messaging-canon.md); where anything here disagrees with
> it, the canon wins. Visual detail is in [brand-book.md](brand-book.md).

---

## 1. The idea in one breath

**Lupine Science measures where machine-learned models of atoms go wrong,
against published references and pass/fail gates set in advance, and
publishes every verdict, failures included.**

Tagline: **Evidence before claim.** Mission: make AI predictions of new
materials checkable before a lab commits to them.

---

## 2. Voice

| Attribute | Do | Don't |
|---|---|---|
| **Scope first** | Say what was tested, on what, against which reference, then what it showed. | Lead with a number and leave its scope for later. |
| **Failures beside passes** | Put the failed and abstained results next to the ones that held. | Show only the passes, or bury failures below the fold. |
| **Plain words** | Make a hard idea understandable to a careful non-expert. | Jargon walls, hype adjectives, "category-defining" framing. |
| **Results, not counters** | Quote results with their qualifiers. | Counts of theorems, commits, articles or films as evidence. |

Write as "we" or "Lupine Science". Phrase lists, retired wording and status
labels are in [messaging-canon.md](messaging-canon.md).

**Numbers rule:** quote a figure only if it appears in a linked article or
data file, with its scope in the same sentence; never quote counts of
commits, articles or theorems as evidence.

---

## 3. Visual system

### Palette

| Token | Hex | Usage |
|---|---|---|
| **Paper** | `#faf9f6` | Dominant background. Warm, editorial, scientific monograph. |
| **Ink** | `#16171d` | Primary text. Near-black. |
| **Ink soft** | `#4c4e58` | Secondary text. |
| **Indigo** | `#3d4db3` | The only light source. Accent, links, data highlights. |
| **Indigo deep** | `#2e3a87` | Hover / emphasis. |
| **Ochre** | `#8a5e1f` | Rare third accent (caution, distinction). |
| **Green** | `#3a8f5b` (text: `#2f7449`) | The "Supported" result label only. |
| **Red** | `#a3402f` | The "Failed" result label only. |

**Rule:** every generated image is paper + indigo + ink. If it drifts, palette-lock it to a warm-white→indigo duotone.

### Typography

- **Headlines & body:** `Newsreader` (serif). Headlines are assertions; use italic emphasis for the emotional beat.
- **UI / labels / data:** `IBM Plex Mono` (monospace). Used for equations, status, and smallcaps labels.
- **Fallbacks:** Georgia / Times New Roman for serif; SF Mono / Cascadia Mono for mono.

### Mark

- Use the existing SVG mark (`public/lupine-science-mark.svg`) as the recurring corner element.
- The mark is an atom-orbit + petal system. Do not add flowers, literal lupine blooms, or photographic nature imagery.

---

### The background motif

The ribbon-and-particles motif on the homepage is decoration. It is drawn
from error statistics of four classical potentials and must always be
captioned as an illustration, never presented as a result about
machine-learned potentials. Do not label it a "hyper-ribbon", a "manifold" or
"the shape of wrongness" in public copy.

**No-go visuals:** flowers, people, text baked into images, dark neon
backgrounds, glowing-circuit AI tropes, stock 3D renders, and any picture
that implies a measurement it does not encode.

---

## 4. Do / don't for generated media

- **Do** start every prompt with the shared style suffix: *editorial scientific minimalism, warm off-white `#faf9f6` paper background, single indigo `#3d4db3` light/accent, near-duotone, generous negative space, calm and premium, no text, no people, no flowers, no neon.*
- **Do** generate many variants and keep almost nothing — curation is the competence signal.
- **Don't** let images become the story. One idea + one image per slide.
- **Don't** put text in images. Newsreader handles all type.

---

## 5. Surfaces and roles

| Surface | Role | URL |
|---|---|---|
| **Lupine Science** | Company site, results, corrections log | https://lupine.science |
| **LUPI** | Browser structure viewer (WebGPU-capable browser, no installation) | https://lupi.live |
| **Lupine Library** | Reader for the research record | https://library.lupine.science |
| **lupine-rhizo** | Research code, data and the hypothesis ledger | https://github.com/alexwelcing/lupine-rhizo |

---

## 6. Content design system

For templates and components for articles, white papers, research guides,
tutorials, evidence records and reports, see:

- **Content design system:** `docs/content-design-system.md`
- **Article CSS:** `public/articles/styles.css`
- **Component reference:** `public/articles/components.html`
- **Markdown templates:** `articles/_templates/`

## 7. Production files

- **Messaging canon:** `docs/messaging-canon.md`
- **Company facts and claims:** `data/company.json`
- **Brand asset manifest:** `data/brand-asset-pack.json`
- **Procedural brand patterns:** `public/brand-assets/patterns/`
- **Dark deck design tokens:** `public/brand-assets/deck-dark.css`
- **Share card source:** `media/og/og-lupine-science.html`
- **This guideline:** `docs/brand-guidelines.md`

## 8. Brand patterns and deck system

### Procedural patterns

`scripts/build-brand-patterns.mjs` generates vector patterns locked to the brand palette:

- `hyper-ribbon.svg` — the ribbon background motif on paper (decoration, not data).
- `error-vectors.svg` — scattered strokes for backgrounds (decoration, not data).
- `lattice-dots.svg` — subtle crystalline texture for backgrounds.
- `dark-ribbon.svg` — the ribbon motif on a deep ink ground for dark slides.

Regenerate with `npm run build` or `node scripts/build-brand-patterns.mjs`.

### Dark deck tokens

`public/brand-assets/deck-dark.css` provides a self-contained dark slide system:

- CSS custom properties for the dark palette (`--deck-paper`, `--deck-ink`, `--deck-indigo`).
- `.slide` class sized to 1280×720 with print-safe page breaks.
- Type scale, callouts, and corner mark placement. Stat rows hold results with their scope, never counters.

See `public/brand-assets/deck-dark-sample.html` for a two-slide reference.
