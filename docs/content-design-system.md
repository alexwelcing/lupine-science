# Lupine Science — Content Design System

> The brand book for every long-form surface: articles, white papers, research guides, tutorials, proof packs, and reports. Inherits from `docs/brand-guidelines.md`.

---

## 1. Purpose

Lupine publishes many kinds of knowledge. They must all feel like one institution wrote them: calm, rigorous, evidence-first, beautiful enough to share. This system provides the shared structure, components, and templates so any contributor can produce a new piece without reinventing the page.

---

## 2. Design tokens

| Token | Value | Notes |
|---|---|---|
| `--paper` | `#faf9f6` | Page background. Warm, editorial. |
| `--paper-deep` | `#f2efe7` | Code blocks, figures, meta boxes. |
| `--ink` | `#16171d` | Primary text. |
| `--ink-soft` | `#4c4e58` | Body secondary, captions. |
| `--ink-faint` | `#6e707a` | Labels, metadata. |
| `--indigo` | `#3d4db3` | Accent, links, active states. |
| `--indigo-deep` | `#2e3a87` | Hover, emphasis. |
| `--indigo-wash` | `rgba(61,77,179,0.08)` | Soft backgrounds. |
| `--indigo-line` | `rgba(61,77,179,0.24)` | Borders, underlines. |
| `--ochre` | `#8a5e1f` | Caution / distinction. |
| `--ochre-wash` | `rgba(168,119,43,0.10)` | Caution backgrounds. |
| `--verified` | `#3a8f5b` | Success / verified badges. |
| `--serif` | `Newsreader, Georgia, serif` | Headlines and body. |
| `--mono` | `IBM Plex Mono, monospace` | Labels, code, data. |

**CSS file:** all article-format pages load `/articles/styles.css`.

---

## 3. Content formats

### Article
- **Purpose:** Research note, essay, or announcement.
- **Structure:** title → editorial header (optional type kicker, scope deck, date/status byline) → hero media → body → optional footnotes.
- **Tone:** rigorous but readable; one big idea.
- **Hero:** image or video, 16:9 or 3:2.

### White paper
- **Purpose:** Definitive document for investors, reviewers, or collaborators.
- **Structure:** title → abstract → metadata → table of contents → sections → conclusion → references.
- **Tone:** formal, proof-forward, exhaustive.
- **Hero:** optional figure or none; lead with abstract.
- **Special:** page numbers in print; numbered sections; equation support.

### Research guide
- **Purpose:** Help a lab or model builder run a Lupine protocol.
- **Structure:** title → prerequisites → objective → steps → expected outputs → troubleshooting → further reading.
- **Tone:** direct, instructional, precise.
- **Hero:** diagram or screenshot.
- **Special:** numbered steps; callouts for warnings and tips; code blocks.

### Tutorial
- **Purpose:** Hands-on walkthrough for a tool, dataset, or API.
- **Structure:** title → goal → prerequisites → numbered steps → expected result → next steps.
- **Tone:** friendly but minimal; every step is actionable.
- **Hero:** screenshot or short video.
- **Special:** step counters; terminal/code blocks; `tip` and `warning` callouts.

### Proof pack
- **Purpose:** Compact evidence bundle attached to a claim.
- **Structure:** claim statement → status badge → evidence summary → methods → data → conclusion → audit links.
- **Tone:** sparse, courtroom-like; every sentence is verifiable.
- **Hero:** none; lead with the claim.
- **Special:** `claim`, `evidence`, and `refuted` callouts; linked artifacts; status badges.

### Report
- **Purpose:** Periodic or project summary (e.g., A6 bridge results).
- **Structure:** title → summary → key findings → figures/tables → methodology → next steps.
- **Tone:** measured, data-rich, self-critical.
- **Hero:** key figure or table.
- **Special:** stat blocks; data tables; figure captions.

---

## 4. Frontmatter (Markdown convention)

The first blockquote in any `.md` file is treated as metadata by `scripts/build-articles.mjs`. Use this shape:

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

**Type values:** `article`, `white-paper`, `research-guide`, `tutorial`, `proof-pack`, `report`.

The build script adds `format-<type>` to the `<body>` class for format-specific styling.

---

## 5. Shared components

Use these Markdown + HTML patterns. Classes are styled in `/articles/styles.css`.

### Editorial article header

Generated automatically from the first metadata blockquote. The reader-facing hierarchy is:

1. `.article-kicker` — optional `Type`, rendered as a compact indigo publication label.
2. `h1` — the article title from the Markdown body.
3. `.article-deck` — `Scope`, promoted to a plain-language standfirst.
4. `.article-byline` — semantic list containing the human-formatted `Date` and normalized `Status`.
5. `.article-hero` — image or video, when available.

`Description` remains available to search, social previews, structured data, and index cards. `Audience` is editorial planning metadata only and must never appear in the reader-facing article. The legacy `.article-meta` form-like block is not emitted.

The component is responsive without changing information hierarchy: the deck reduces from `1.28–1.5rem` to `1.15rem` below 600px, and the byline wraps naturally. The publication details use a semantic list and `<time datetime="…">`; the decorative separator is hidden from assistive technology.

### Hero figure
Use the first `<figure>` after the title, or let the build script insert `hero.jpg` / `hero.mp4`.

```markdown
<figure class="article-hero" aria-labelledby="hero-caption">
  <img src="hero.jpg" alt="…">
  <figcaption id="hero-caption">…</figcaption>
</figure>
```

### Callouts

```markdown
<div class="callout info">
  <strong>Note.</strong> Body text.
</div>
```

Variants: `.info`, `.warning`, `.proof`, `.todo`, `.claim`, `.refuted`.

### Status badges

```markdown
<span class="status published">Published</span>
<span class="status draft">Draft</span>
<span class="status verified">Verified</span>
<span class="status refuted">Refuted</span>
```

### Lead paragraph

```markdown
<p class="lead">The opening paragraph at larger size.</p>
```

### Pull quote

```markdown
<blockquote class="pullquote">
  <p>"A sentence that carries the whole argument."</p>
  <cite>— Source</cite>
</blockquote>
```

### Stat row

```markdown
<div class="stat-row">
  <div class="stat"><span class="num">14/15</span><span class="caption">Elements transfer</span></div>
  <div class="stat"><span class="num">&gt;0.8</span><span class="caption">Cross-MLIP cosine</span></div>
</div>
```

### CTA box

```markdown
<div class="cta">
  <p><strong>Next:</strong> read the evidence in LUPI.</p>
  <a href="https://lupi.live">Open LUPI →</a>
</div>
```

### Definition list

```markdown
<dl class="definition">
  <dt>Error manifold</dt>
  <dd>The low-dimensional surface on which prediction errors cluster.</dd>
</dl>
```

### Two-column layout (for proof packs or comparisons)

```markdown
<div class="two-col">
  <div>…</div>
  <div>…</div>
</div>
```

### Tables
Markdown tables render with the base table styles: small labels, indigo headers, hairline rules.

---

## 6. Typography scale

| Element | Size | Weight | Notes |
|---|---|---|---|
| H1 | `clamp(34px,5vw,52px)` | 500 | Title only. |
| H2 | `clamp(24px,3vw,32px)` | 500 | Border-bottom rule. |
| H3 | `20px` | 600 | No rule. |
| Body | `18px` | 400 | Line-height 1.7. |
| Lead | `20px` | 400 | Slightly larger opening. |
| Mono labels | `12–13px` | 400–600 | Uppercase, tracked. |

Use `<em>` for the emotional beat, in italic indigo when inside headings.

---

## 7. Visual rules

- **One idea per section.** A heading + a few paragraphs + one figure or callout.
- **Generous whitespace.** Margins are part of the identity.
- **No dark mode by default.** The paper surface is the brand.
- **Images:** duotone-friendly (paper + indigo). Add a subtle border and caption.
- **Code:** `IBM Plex Mono`, paper-deep background, rule border.
- **Print:** header becomes static, links expose URLs, heroes avoid page breaks.

---

## 8. File map

- `articles/_templates/article.md`
- `articles/_templates/white-paper.md`
- `articles/_templates/research-guide.md`
- `articles/_templates/tutorial.md`
- `articles/_templates/proof-pack.md`
- `articles/_templates/report.md`
- `public/articles/styles.css` — shared styles.
- `scripts/build-articles.py` — builder that reads type metadata.

---

## 9. Checklist before publishing

- [ ] Type field is one of the allowed values.
- [ ] Meta block has Date, Description, Audience, Status.
- [ ] Hero image/video exists in the article folder.
- [ ] Every claim has a citation, figure, or link.
- [ ] Callouts use the correct variant.
- [ ] Print preview looks acceptable (Ctrl+P / Cmd+P).
