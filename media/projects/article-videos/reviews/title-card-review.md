# Title-card component review

## Decision: REJECT

The default title card is visually strong and notably more distinctive than a compliance-only template: the indigo “evidence trace,” asymmetric editorial grid, Newsreader/IBM Plex Mono hierarchy, and restrained paper field establish a credible Lupine Science signature. However, it is not yet publication-ready as a reusable component. Two release-blocking failures remain: the component breaks catastrophically within its own advertised variable limits, and the six-second clip is pixel-identical from 1.8s through 5.8s, triggering the checklist’s static-slide rejection rule.

## Review record

- Article/video: reusable Lupine Science title-card component
- Review ticket: `t_b94097c5`
- Source task: `t_2aa3c07c`
- Component: `compositions/title-card.html`
- Motion contract: `compositions/title-card.motion.json`
- Default frame evidence: `snapshots/contact-sheet.jpg`, frames at 0.2s, 0.9s, 1.8s, 4.5s, and 5.8s
- Stress-test evidence: scratch snapshot with an 89-character title and 139-character deck, both within declared limits
- Reviewer: reviewer profile
- Review date: 2026-07-10
- Lowest score: 2/10 (in-range variable stress test)
- P0 count: 1
- P1 count: 2
- Decision: `REJECT`

## What succeeds

### Brand and frame craft — PASS, 8.5/10

- Palette is locked correctly to paper `#faf9f6`, ink `#1a1a1a`, and indigo `#3d4db3`, with permitted alpha variants only. No unapproved hue appears.
- Local Newsreader and IBM Plex Mono files are declared; visible type roles follow the frame system.
- Default title, deck, labels, and metadata clear the published size floors. Independent validation reports 30 text elements passing WCAG AA.
- Critical default content is inside title-safe. The deck begins at the fixed lower-third band and remains clear of the caption reserve for the supplied copy.
- The canonical mark is preserved and visible by 0.9s, satisfying the first-two-seconds identity requirement.
- The final default frame has strong asymmetry, a clear dominant title, a second focal region in the trace/metadata, and useful foreground registration detail. It reads as editorial science rather than generic SaaS motion design.

### Signature concept — PASS, 9/10

The best decision is the “evidence trace.” It is not a decorative left stripe: it draws a coordinate system, brackets the title, resolves into the lower rule, and creates a plausible handoff axis for the next scene. That directly advances the series beyond mere brand compliance.

### Automated default checks — PASS

Independent run of `npm run check`:

- HyperFrames lint: 0 errors, 0 warnings
- HyperFrames validate: no console errors; 30 text elements pass WCAG AA
- HyperFrames inspect: 0 layout issues across 52 samples

These checks validate the supplied default instance only; they do not establish reusable-input safety or sustained motion quality.

## Release blockers

### P0 — Advertised variable limits produce catastrophic overlap

**Criterion:** Typography; composition; reusable-component integrity  
**Evidence:** `title-card.html:4-8`, `title-card.html:138-179`; stress snapshot at 1.8s  
**Score:** 2/10

The component advertises `title` up to 92 characters and `deck` up to 140 characters, but uses fixed-size 126px title type in a 1130×420 box and 58px deck type in a 1130×180 box with no fitting or constrained line policy. An 89-character title plus 139-character deck—both within those limits—causes:

- title collision with the top episode label;
- title overflow through the evidence rule into the lower-third band;
- severe title/deck overlap;
- deck expansion deep into the caption reserve;
- unreadable hierarchy and multiple safe-zone conflicts.

HyperFrames stress inspection reports persistent overlap warnings at both 1.8s and 5.8s, including `#title-card-heading` against `#title-card-deck`. The rendered frame is visibly unusable.

**Required fix:** Make the declared input contract honest and safe. Prefer semantic length tiers rather than shrinking below brand floors:

1. Define tested title tiers (for example, one/two/three-line variants) that step from displayHero to headline/subheadline tokens while keeping Newsreader ≥72px.
2. Cap or rewrite deck content so it remains at most two lines in the lower-third band; do not allow 140 characters unless the layout demonstrably supports it.
3. Add deterministic fit logic or explicit validation that rejects unsupported copy before rendering.
4. Add long-title, long-deck, and combined worst-case fixtures to `index.html` or a dedicated QA gallery, and run `inspect --strict` on them.
5. Add motion/layout assertions for the episode label and the title/deck non-overlap contract; current sidecar checks only appearance order and in-frame status.

### P1 — Four-second frozen hold violates the static-slide rejection rule

**Criterion:** Motion; issue handling  
**Evidence:** default frames at 1.8s, 4.5s, and 5.8s  
**Score:** 6/10

The PNGs at 1.8s, 4.5s, and 5.8s have the exact same SHA-256 (`f3567b…e905580`) and ImageMagick reports zero differing pixels. All authored tweens finish by approximately 1.64s (`title-card.html:317-383`), leaving more than four seconds with no visual evolution.

This is not a subtle-motion judgment; it is a verified pixel freeze. `ARTICLE_VIDEO_REVIEW_CHECKLIST.md:76` explicitly requires rejection of a static-slide scene. The motion sidecar omits a `keepsMoving` assertion, so the automated suite cannot detect this failure.

**Required fix:** Sustain one restrained, seek-safe ambient behavior during the hold and add `keepsMoving` to the motion sidecar. Good candidates are a near-imperceptible evidence-trace current, a slow localized indigo wash drift, or a low-amplitude grid parallax. Keep the title itself still for reading. The final 0.4s should be designed to accept the shared indigo-line transition rather than introducing a separate exit.

### P1 — “OPENING TRACE / 1920 × 1080 / 30 FPS” is production metadata, not evidence

**Criterion:** Proof-first visual doctrine; every visual supports the current message  
**Evidence:** `title-card.html:181-204`, `title-card.html:294-298`  
**Score:** 6.5/10

The lower-left block is well styled but semantically generic. Resolution and frame rate describe the render, not the article, claim, method, or provenance. On a proof-first scientific title card this reads like attractive debug chrome and will repeat unchanged across episodes.

**Required fix:** Bind this zone to meaningful article metadata: article section, publication date, evidence/source count, method family, proof-pack ID, DOI/slug, or another approved provenance field. If those values are unavailable, use a concise series/edition marker rather than technical render settings.

## Applicable checklist scores

| Criterion | Score | Result |
|---|---:|---|
| Palette and brand fidelity | 9/10 | PASS |
| Default typography and contrast | 9/10 | PASS |
| Default hierarchy and composition | 8.5/10 | PASS |
| Identity use | 8/10 | PASS |
| Visual distinctiveness | 8.5/10 | PASS |
| Entrance choreography | 8/10 | PASS |
| Sustained motion / no static slide | 6/10 | FAIL (P1) |
| Reusable copy robustness | 2/10 | FAIL (P0) |
| Proof-first semantic detail | 6.5/10 | FAIL (P1) |
| HyperFrames default technical gates | 10/10 | PASS |

Audio, full-film narrative arc, final H.264 encode, WebVTT, cue-point extraction, and director sign-off are not applicable to this isolated component review.

## Brilliant improvement to try

Turn the evidence trace into an **article-specific provenance fingerprint**. During the entrance, let three tiny mono ticks resolve along the line from real approved metadata—such as source count, publication date, and proof-pack/DOI slug—then let the same trace continue physically into the first scene as its chart axis or diagram contour. The geometry remains a consistent series signature, while its tick pattern and labels become unique to each article. This would make the title card feel authored from evidence rather than merely branded, and it would solve the generic debug-metadata problem at the same time.

## Re-review acceptance criteria

- Worst-case supported title and deck fixtures render with no overlap, clipping, or caption-zone collision.
- Declared `maxLength` values match the tested visual capacity; unsupported copy fails clearly instead of rendering badly.
- 1.8s and 5.8s frames are not pixel-identical, while the title remains comfortably readable.
- Motion sidecar includes a liveness assertion and passes.
- Generic render metadata is replaced with approved episode/article provenance.
- `npm run check` remains clean, plus strict inspection passes for all QA fixtures.
