# Lupine Science Brand Book

> The complete guide to the Lupine Science brand — identity, visual system, content formats, asset creation process, and governance. Hand this to any team that needs to produce on-brand work.

---

## 1. Brand Identity

### 1.1 Mission

Lupine Science is the trust layer for the age of AI-designed matter. AI is crossing from bits to atoms; every prediction of matter still rests on interatomic potentials that are wrong in structured ways. Lupine measures that wrongness, proves it, corrects it, and makes the evidence inspectable.

### 1.2 Positioning

**Category:** error geometry for interatomic potentials

**Winning thesis:** Own the trust question for interatomic potentials — what does this model get wrong, is the wrongness structured, can the evidence be inspected, and what correction target follows?

**Primary wedges:**
- MLIP Failure Geometry Audit
- Evidence Pack for a paper, dataset, or benchmark
- Potential Trust Report for a material family
- Ledger-backed research loop for model evaluation

### 1.3 Voice

| Attribute | Do | Don't |
|---|---|---|
| **Proof-first** | Lead with measured numbers and machine-checked claims | "Revolutionary," "game-changing," hype adjectives |
| **Confident, not arrogant** | State what is proven plainly; name what is still open | Overclaim or hide uncertainty |
| **Frontier-technical but legible** | Make a hard idea understandable to a smart non-expert | Jargon-wall the reader |
| **Category-defining** | Speak as the one creating "error geometry for interatomic potentials" | Sound like a generic simulation SaaS |

**Preferred phrases:** error geometry · field evidence · science spine · claim lifecycle · inspectable evidence · lab-facing research corpus · MLIP Failure Geometry Audit · agentic research control plane

**Retired phrases:** atom-logo framing · legacy Atlas labels · "materials organization" generics · unsupported claims that the science is settled

### 1.4 Narrative spine for pitches

1. **Inflection:** AI is leaving the screen and entering matter
2. **Catch:** It is designing matter on predictions that are wrong
3. **Insight:** The wrongness has a shape — a low-dimensional error geometry
4. **Proof:** We mapped it, tested it across classical and foundation MLIPs, and machine-checked the map in Lean 4
5. **Product:** A correction layer (floor) and a materials-IP discovery engine (ceiling)
6. **Moat:** Proof-grade rigor + self-refutation discipline + compounding manifold coverage
7. **Vision:** The validation substrate for a real-world Replicator

---

## 2. Visual System

### 2.1 Palette

| Token | Hex | Usage |
|---|---|---|
| **Paper** | `#faf9f6` | Dominant background. Warm, editorial, scientific monograph |
| **Paper deep** | `#f2efe7` | Code blocks, figures, meta boxes |
| **Ink** | `#16171d` | Primary text. Near-black |
| **Ink soft** | `#4c4e58` | Secondary text, captions |
| **Ink faint** | `#6e707a` | Labels, metadata |
| **Indigo** | `#3d4db3` | The only light source. Accent, links, data highlights |
| **Indigo deep** | `#2e3a87` | Hover / emphasis |
| **Indigo wash** | `rgba(61,77,179,0.08)` | Soft backgrounds |
| **Indigo line** | `rgba(61,77,179,0.24)` | Borders, underlines |
| **Ochre** | `#8a5e1f` | Rare third accent (caution, distinction) |
| **Ochre wash** | `rgba(168,119,43,0.10)` | Caution backgrounds |
| **Verified** | `#3a8f5b` | Status badges only |

**Rule:** Every generated image is paper + indigo + ink. If it drifts, palette-lock it to a warm-white→indigo duotone.

### 2.2 Typography

| Element | Font | Fallback | Usage |
|---|---|---|---|
| **Headlines & body** | Newsreader (serif) | Georgia / Times New Roman | Headlines are assertions; use italic emphasis for the emotional beat |
| **UI / labels / data** | IBM Plex Mono (monospace) | SF Mono / Cascadia Mono | Equations, status, smallcaps labels |

**Print rule:** Use repository-local `proof-unicode.ttf` (Noto Serif) for reading text and `IBM Plex Mono` for labels, numbers, metadata, and source lines. Never use Google Fonts or CDN fonts in generated PDFs.

### 2.3 The Mark

- Use the existing SVG mark (`public/lupine-science-mark.svg`) as the recurring corner element
- The mark is an atom-orbit + petal system
- **Do not** add flowers, literal lupine blooms, or photographic nature imagery

### 2.4 The ownable hero motif: "the shape of wrongness"

The central, repeatable image is the **hyper-ribbon manifold**: scattered faint error vectors resolving onto a single luminous indigo ribbon on warm paper. It is the thesis made visible.

**Where it repeats:**
- Cover / OG image
- Site hero background
- Proof slide
- Moat / vision slides

**Secondary motifs:**
- **Bits → atoms:** pixels/glyphs dissolving into a crystalline lattice
- **Error vectors aligning:** many near-parallel arrows collapsing to one direction
- **Compounding geometry:** a crystal/flywheel growing outward
- **Upstream cascade:** a single point of indigo light rippling through a sparse lattice
- **Crystalline form:** abstract mineral-like structures rendered in paper and indigo
- **Diffraction:** wave interference patterns suggesting measured fields and correction layers

**No-go visuals:** flowers, people, text baked into images, dark neon backgrounds, glowing-circuit AI tropes, stock 3D renders

---

## 3. Content Design System

### 3.1 Design tokens

| Token | Value |
|---|---|
| `--paper` | `#faf9f6` |
| `--paper-deep` | `#f2efe7` |
| `--ink` | `#16171d` |
| `--ink-soft` | `#4c4e58` |
| `--ink-faint` | `#6e707a` |
| `--indigo` | `#3d4db3` |
| `--indigo-deep` | `#2e3a87` |
| `--indigo-wash` | `rgba(61,77,179,0.08)` |
| `--indigo-line` | `rgba(61,77,179,0.24)` |
| `--ochre` | `#8a5e1f` |
| `--ochre-wash` | `rgba(168,119,43,0.10)` |
| `--verified` | `#3a8f5b` |
| `--serif` | `Newsreader, Georgia, serif` |
| `--mono` | `IBM Plex Mono, monospace` |

### 3.2 Content formats

#### Article
- **Purpose:** Research note, essay, or announcement
- **Structure:** title → editorial header → hero media → body → optional footnotes
- **Tone:** rigorous but readable; one big idea
- **Hero:** image or video, 16:9 or 3:2

#### White paper
- **Purpose:** Definitive document for investors, reviewers, or collaborators
- **Structure:** title → abstract → metadata → table of contents → sections → conclusion → references
- **Tone:** formal, proof-forward, exhaustive
- **Special:** page numbers in print; numbered sections; equation support

#### Research guide
- **Purpose:** Help a lab or model builder run a Lupine protocol
- **Structure:** title → prerequisites → objective → steps → expected outputs → troubleshooting → further reading
- **Tone:** direct, instructional, precise
- **Special:** numbered steps; callouts for warnings and tips; code blocks

#### Tutorial
- **Purpose:** Hands-on walkthrough for a tool, dataset, or API
- **Structure:** title → goal → prerequisites → numbered steps → expected result → next steps
- **Tone:** friendly but minimal; every step is actionable
- **Special:** step counters; terminal/code blocks; `tip` and `warning` callouts

#### Proof pack
- **Purpose:** Compact evidence bundle attached to a claim
- **Structure:** claim statement → status badge → evidence summary → methods → data → conclusion → audit links
- **Tone:** sparse, courtroom-like; every sentence is verifiable
- **Special:** `claim`, `evidence`, and `refuted` callouts; linked artifacts; status badges

#### Report
- **Purpose:** Periodic or project summary
- **Structure:** title → summary → key findings → figures/tables → methodology → next steps
- **Tone:** measured, data-rich, self-critical
- **Special:** stat blocks; data tables; figure captions

### 3.3 Frontmatter convention

The first blockquote in any `.md` file is treated as metadata:

```markdown
> **Title:** Why Lupine Science?
>
> **Type:** article
>
> **Date:** 2026-06-30
>
> **Scope:** Trustworthy AI for materials discovery
>
> **Description:** One-line summary for cards and meta tags.
>
> **Audience:** Investors, materials scientists, AI-for-science teams
>
> **Status:** Published
```

**Type values:** `article`, `white-paper`, `research-guide`, `tutorial`, `proof-pack`, `report`

### 3.4 Shared components

#### Editorial article header

Generated automatically from the first metadata blockquote:
1. `.article-kicker` — optional `Type`, rendered as a compact indigo publication label
2. `h1` — the article title from the Markdown body
3. `.article-deck` — `Scope`, promoted to a plain-language standfirst
4. `.article-byline` — semantic list containing the human-formatted `Date` and normalized `Status`
5. `.article-hero` — image or video, when available

#### Callouts

```markdown
<div class="callout info">
  <strong>Note.</strong> Body text.
</div>
```

Variants: `.info`, `.warning`, `.proof`, `.todo`, `.claim`, `.refuted`

#### Status badges

```markdown
<span class="status published">Published</span>
<span class="status draft">Draft</span>
<span class="status verified">Verified</span>
<span class="status refuted">Refuted</span>
```

#### Stat row

```markdown
<div class="stat-row">
  <div class="stat"><span class="num">14/15</span><span class="caption">Elements transfer</span></div>
  <div class="stat"><span class="num">&gt;0.8</span><span class="caption">Cross-MLIP cosine</span></div>
</div>
```

#### CTA box

```markdown
<div class="cta">
  <p><strong>Next:</strong> read the evidence in LUPI.</p>
  <a href="https://lupi.live">Open LUPI →</a>
</div>
```

### 3.5 Typography scale

| Element | Size | Weight | Notes |
|---|---|---|---|
| H1 | `clamp(34px,5vw,52px)` | 500 | Title only |
| H2 | `clamp(24px,3vw,32px)` | 500 | Border-bottom rule |
| H3 | `20px` | 600 | No rule |
| Body | `18px` | 400 | Line-height 1.7 |
| Lead | `20px` | 400 | Slightly larger opening |
| Mono labels | `12–13px` | 400–600 | Uppercase, tracked |

### 3.6 Visual rules

- **One idea per section.** A heading + a few paragraphs + one figure or callout
- **Generous whitespace.** Margins are part of the identity
- **No dark mode by default.** The paper surface is the brand
- **Images:** duotone-friendly (paper + indigo). Add a subtle border and caption
- **Code:** `IBM Plex Mono`, paper-deep background, rule border
- **Print:** header becomes static, links expose URLs, heroes avoid page breaks

---

## 4. Image Creation Process

### 4.1 The style suffix

Start every prompt with the shared style suffix:

> *editorial scientific minimalism, warm off-white `#faf9f6` paper background, single indigo `#3d4db3` light/accent, near-duotone, generous negative space, calm and premium, no text, no people, no flowers, no neon.*

### 4.2 Generation workflow

For brand-vibe iteration we run a **make → evaluate → mutate** loop:

1. **Generate** a controlled matrix of stills across motifs and variants with `media/projects/brand-exploration/scripts/generate_matrix.py`
2. **Review** in `media/projects/brand-exploration/renders/gallery.html` with palette / composition / on-brand / hero-usable scoring and a shortlist
3. **Explore** live combinations in `media/projects/brand-exploration/renders/playground.html`: procedural hyper-ribbon overlaid with any still, tunable density, curve, opacity, and speed
4. **Mutate** the shortlist into next-generation prompts with `scripts/mutate_prompts.py`
5. **Regenerate** and repeat

### 4.3 Curation rules

- Generate many variants and keep almost nothing — curation is the competence signal
- One idea + one image per slide or article
- Don't put text in images. Newsreader handles all type
- Don't let images become the story

### 4.4 Asset variants

Each motif is generated in multiple aspect ratios:
- **wide** (16:9) — hero, OG image, deck cover
- **square** (1:1) — social media
- **quiet** (16:9, low contrast) — background, title cards, section dividers
- **dense** (16:9, high contrast) — thumbnails, small displays

Current motifs:
- `shape-of-wrongness` — scattered error vectors resolving onto a single luminous indigo ribbon
- `bits-to-atoms` — pixels/glyphs dissolving into a crystalline lattice
- `upstream-cascade` — a single point of indigo light rippling through a sparse lattice
- `crystalline-form` — abstract mineral-like structures
- `diffraction` — wave interference patterns

---

## 5. Video Production

### 5.1 Voice and narration

- **Voice:** Professional, deep, calm explainer voice (M3-powered TTS or human voiceover)
- **Avoid:** High-pitched, creepy, or robotic voices
- **Style:** Fast-talking but clear, 20s "Cali" energy when appropriate
- **Narration script:** Written for the ear, not the eye. Short sentences. One idea per sentence.

### 5.2 Visual language

- **Motion over static:** Prefer subtle motion (parallax, slow zoom, ribbon animation) over static images
- **No baked-in text:** All text rendered as overlays or captions, never baked into the image
- **Palette lock:** Every frame is paper + indigo + ink. If a generated frame drifts, palette-lock it in post
- **Hero motif:** The hyper-ribbon manifold is the recurring visual anchor

### 5.3 Production pipeline

1. **Storyboard** — `media/projects/article-visuals/storyboard.yaml` defines scenes, timing, and narration
2. **Asset generation** — Generate stills per scene using the brand style suffix
3. **Motion** — Use HeyGen or HyperFrames for animation; keep motion subtle and purposeful
4. **Review** — The "video review" process checks for: palette compliance, no gibberish text, no uncanny valley, motion smoothness, narration clarity
5. **Export** — 16:9 for YouTube/site, 1:1 for social, 9:16 for Shorts/Reels
6. **QA** — Check file size (target <100MB), codec (H.264), audio levels (-16 LUFS)

### 5.4 Review standards

Many frames that came through were not usable. The bar is:
- **No gibberish text** — any text in generated images must be legible and correct
- **No uncanny valley** — human figures must not look AI-generated
- **Palette compliance** — paper + indigo + ink, no drift
- **Motion quality** — smooth, purposeful, not distracting
- **Narration sync** — audio matches visual timing

---

## 6. Proof Pack Design

### 6.1 Purpose

Each proof pack is a compact scientific dossier, not a printout of the article. The hierarchy is deliberately editorial: claim first, evidence second, audit trail always visible.

### 6.2 Pack anatomy

1. **Cover** — wordmark, document type/version, title and deck, evidence status, figure/reference counts, publication date, document ID, author/institution, canonical URL
2. **Executive summary** — one-paragraph synthesis, three to five findings, explicit evidence verdict, boundary/uncertainty statement
3. **Key figures** — only decision-relevant charts. Complete axes, labels, legends, annotations. Every figure requires visible numbering, descriptive caption, source/provenance line, meaningful alt text
4. **Data tables** — one subject per table, explicit units, tabular numerals, real `<caption>`, `<thead>`, `<th scope>`, `<tbody>` semantics
5. **Methodology note** — unit of analysis, evidence cutoff, transformations, exclusions, known limitations, build/version record
6. **Credits** — named author, institution, editorial reviewer, data/figure provenance
7. **Bibliography and audit trail** — ordered references with durable DOI/source links followed by dataset, code, archive, or ledger links

### 6.3 Page system

- Default output is US Letter (`8.5 × 11 in`)
- Live margin: `0.72 in` horizontal, `0.7 in` vertical
- Also fits A4 at 100%
- Page furniture is quiet: running label above, short title plus folio below
- Figures, tables, callouts, and credits avoid page breaks internally
- Print backgrounds are intentional and must be generated with `printBackground: true`

### 6.4 Typography and Unicode release gate

- Use repository-local `proof-unicode.ttf` (Noto Serif) for reading text and `IBM Plex Mono` for labels
- Chromium converts the variable Newsreader webfont to Type 3 PDF fonts, which are not reliable across print engines; it must not be used in generated PDFs
- `font-display: block` prevents a PDF being captured with fallback metrics
- Production is offline and deterministic: no Google Fonts, CDN CSS, remote images, analytics, or post-load substitutions
- Await `document.fonts.ready` before printing
- Every released PDF must report all fonts as embedded and Unicode mapped via `pdffonts`, with no Type 3 fonts

### 6.5 Accessibility

- Source order must match reading order
- Use one `<main>`, page `<section>` landmarks, heading hierarchy, real lists/tables, explicit `aria-labelledby` connections
- Decorative marks use empty alt text
- Charts require concise alt text that communicates chart type, compared variables, and takeaway
- Minimum body size is 10.5 pt, notes 8.5 pt, metadata 6.8–7.5 pt
- Indigo text is reserved for labels or large emphasis; body links use indigo-deep and remain underlined
- URLs may wrap, but never overflow
- Links in generated PDFs must point to public canonical URLs, not localhost

### 6.6 Article-page download card

Place the card after the article deck/byline and before the hero figure on desktop; on narrow screens keep it in the same source position.

**Visual specification:**
- Full article-column width; paper-deep background; 1 px rule border; 3 px indigo left rule; 6 px radius
- Internal layout: `minmax(0, 1fr) auto`, 20–24 px gap, 18–20 px padding
- Left stack: mono eyebrow `EVIDENCE PROOF PACK`, serif title `Download the evidence behind this article`, one two-line description, then mono metadata
- Right action: native `<a download>` styled as a compact button, minimum 44 × 44 px target, indigo fill, paper text
- Print: replace the button with the canonical PDF URL in plain mono text or hide the card

---

## 7. Publication Workflow

### 7.1 Article creation

1. **Choose format** — article, white-paper, research-guide, tutorial, proof-pack, or report
2. **Write in Markdown** with the frontmatter convention
3. **Generate hero image** using the brand style suffix and motif matrix
4. **Add components** as needed (callouts, stat rows, CTA boxes, status badges)
5. **Review** against the checklist
6. **Build** with `scripts/build-articles.mjs`
7. **QA** — check typography, links, images, print preview
8. **Publish** to `lupine-science/articles/`

### 7.2 Checklist before publishing

- [ ] Type field is one of the allowed values
- [ ] Meta block has Date, Description, Audience, Status
- [ ] Hero image/video exists in the article folder
- [ ] Every claim has a citation, figure, or link
- [ ] Callouts use the correct variant
- [ ] Print preview looks acceptable (Ctrl+P / Cmd+P)
- [ ] No gibberish text in images
- [ ] Palette compliance (paper + indigo + ink)
- [ ] Links point to public canonical URLs

### 7.3 Social sharing

**Only LinkedIn, X, and Email** — no Meta, no smaller sites.

**Share assets:**
- OG image: `shape-of-wrongness_square.jpg` (1:1)
- Twitter card: `shape-of-wrongness_wide.jpg` (16:9)
- LinkedIn: `shape-of-wrongness_wide.jpg` (16:9)

**Share text template:**
> [Article title] — [one-line description]. Read the evidence at lupine.science.

---

## 8. Asset Inventory

### 8.1 Brand stills

Location: `lupine-science/public/brand-assets/assets/images/`

| Motif | Variants | Usage |
|---|---|---|
| `shape-of-wrongness` | wide, square, quiet, dense | Hero, OG image, deck cover, proof pack divider |
| `bits-to-atoms` | wide, square, quiet, dense | Product explainer, trust-layer slides, article hero |
| `upstream-cascade` | wide, square, quiet, dense | Vision slides, moat narrative, report covers |
| `crystalline-form` | wide, square, quiet | Material class headers, article cards |
| `diffraction` | wide, square, quiet | Methodology sections, data visual dividers |

### 8.2 Procedural patterns

Location: `lupine-science/public/brand-assets/patterns/`

- `hyper-ribbon.svg` — the central "shape of wrongness" motif on paper
- `error-vectors.svg` — scattered vectors converging toward alignment
- `lattice-dots.svg` — subtle crystalline texture for backgrounds
- `dark-ribbon.svg` — hyper-ribbon on a deep ink ground for dark slides

Regenerate with `npm run build` or `node scripts/build-brand-patterns.mjs`.

### 8.3 Dark deck tokens

Location: `lupine-science/public/brand-assets/deck-dark.css`

- CSS custom properties for the dark palette (`--deck-paper`, `--deck-ink`, `--deck-indigo`)
- `.slide` class sized to 1280×720 with print-safe page breaks
- Type scale, stat rows, callouts, and corner mark placement

### 8.4 Fonts

Location: `lupine-science/public/fonts/`

- `newsreader/` — Newsreader variable font for web
- `ibm-plex-mono/` — IBM Plex Mono for UI, labels, code
- `proof-unicode.ttf` — Noto Serif for print/PDF

### 8.5 Article templates

Location: `lupine-science/articles/_templates/`

- `article.md` — standard research note
- `white-paper.md` — definitive document
- `research-guide.md` — protocol guide
- `tutorial.md` — hands-on walkthrough
- `proof-pack.md` — evidence bundle
- `report.md` — periodic summary

---

## 9. Governance

### 9.1 Brand compliance review

Before any asset goes public, check:

1. **Palette** — paper + indigo + ink, no drift
2. **Typography** — Newsreader for headlines/body, IBM Plex Mono for labels/code
3. **Imagery** — no text baked in, no people, no flowers, no neon, no dark backgrounds
4. **Voice** — proof-first, confident, legible, category-defining
5. **Claims** — every claim has a citation, figure, or link
6. **Accessibility** — alt text, semantic HTML, readable font sizes

### 9.2 File ownership

| Area | Owner | Contact |
|---|---|---|
| Brand identity | Alex Welcing | founders@lupine.science |
| Visual system | Alex Welcing | founders@lupine.science |
| Content design | Alex Welcing | founders@lupine.science |
| Video production | Alex Welcing | founders@lupine.science |
| Website | Alex Welcing | founders@lupine.science |

### 9.3 Change control

- **Minor updates** (new image variants, new article templates): commit to `lupine-science` with a clear commit message
- **Major updates** (palette changes, new motifs, new formats): discuss with Alex Welcing first
- **Retired assets**: move to `archive/` with a README explaining why

### 9.4 Handoff checklist for new team members

- [ ] Read this brand book
- [ ] Review `brand-guidelines.md` for the pitch-ready summary
- [ ] Review `content-design-system.md` for the component reference
- [ ] Review `proof-pack-design.md` for the proof pack specification
- [ ] Browse the image gallery at `public/brand-assets/index.html`
- [ ] Browse the article components at `public/articles/components.html`
- [ ] Run the brand pattern builder: `node scripts/build-brand-patterns.mjs`
- [ ] Create a test article using the templates
- [ ] Submit for brand compliance review

---

## 10. Production Files

- **Brand narrative:** `lupine/docs/brand/narrative.md`
- **Market strategy:** `lupine/docs/brand/market-strategy.json`
- **Company profile:** `lupine/fundraise/company-profile.md`
- **Deck content:** `lupine/fundraise/lupine-science-deck.md`
- **Art direction:** `lupine/fundraise/art-direction.md`
- **Generated brand stills:** `lupine-science/public/brand-assets/`
- **Brand asset manifest:** `lupine-science/data/brand-asset-pack.json`
- **Procedural brand patterns:** `lupine-science/public/brand-assets/patterns/`
- **Dark deck design tokens:** `lupine-science/public/brand-assets/deck-dark.css`
- **Dark deck sample:** `lupine-science/public/brand-assets/deck-dark-sample.html`
- **Content design system:** `lupine-science/docs/content-design-system.md`
- **Brand guidelines (pitch-ready):** `lupine-science/docs/brand-guidelines.md`
- **Proof pack design:** `lupine-science/docs/proof-pack-design.md`
- **This brand book:** `lupine-science/docs/brand-book.md`

---

*Last updated: 2026-07-18. This document is the source of truth for the Lupine Science brand. If anything conflicts with an older document, this book wins.*
