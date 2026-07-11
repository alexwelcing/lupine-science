---
version: "1.0"
name: "Lupine Science — Article Video Frame System"
description: >-
  Video-first translation of the Lupine Science web design system for 1920×1080,
  30 fps narrated research films. Warm editorial paper, indigo as the primary
  signal, Newsreader assertions, IBM Plex Mono evidence chrome, proof-first
  composition, and a consistent indigo-line handoff between scenes.
unit: "the frame — 1920×1080 primary at 30 fps"
principle: "proof first · one claim per beat · atoms are sacred · composition is free"

frame:
  width: 1920
  height: 1080
  fps: 30
  aspectRatio: "16:9"
  titleSafe:
    left: 96
    right: 96
    top: 54
    bottom: 54
    description: "Outer 5% of each axis; no critical text, marks, axes, or data points outside."
  actionSafe:
    left: 48
    right: 48
    top: 27
    bottom: 27
    description: "Decorative texture may enter this zone; critical content may not."
  lowerThirdZone:
    x: 96
    y: 738
    width: 1728
    height: 234
    baseline: 918
    description: "Fixed 68.3–90% frame-height band for names, source callouts, and captions."
  captionZone:
    x: 192
    y: 828
    width: 1536
    height: 126
    description: "Centered two-line maximum; reserve this sub-zone whenever captions are enabled."

colors:
  paper: "#faf9f6"
  indigo: "#3d4db3"
  ink: "#1a1a1a"
  amber: "#e8a838"
  sage: "#5a8a6e"
  slate: "#6b7c8e"
  rose: "#c75b5b"
palettePolicy:
  locked: true
  authority: "director"
  unlistedColors: "prohibited without explicit director approval"
  alphaVariants: "permitted only from the seven colors above"
  colorMixing: "prohibited; opacity must not create or imply a new hue"
  perFrameLimit: "paper + ink + indigo + at most one semantic accent"

typography:
  displayHero:
    fontFamily: "Newsreader"
    px: 150
    weight: 400
    lineHeight: 0.94
    tracking: "-0.03em"
    maxLines: 3
  headline:
    fontFamily: "Newsreader"
    px: 112
    weight: 400
    lineHeight: 0.98
    tracking: "-0.025em"
    maxLines: 3
  subheadline:
    fontFamily: "Newsreader"
    px: 72
    weight: 400
    lineHeight: 1.08
    tracking: "-0.015em"
    maxLines: 3
  body:
    fontFamily: "Newsreader"
    px: 48
    weight: 400
    lineHeight: 1.3
    maxLines: 4
  bodyLarge:
    fontFamily: "Newsreader"
    px: 58
    weight: 400
    lineHeight: 1.22
    maxLines: 4
  label:
    fontFamily: "IBM Plex Mono"
    px: 36
    weight: 600
    lineHeight: 1.2
    tracking: "0.12em"
    uppercase: true
  dataLabel:
    fontFamily: "IBM Plex Mono"
    px: 36
    weight: 400
    lineHeight: 1.2
    tracking: "0.02em"
  stat:
    fontFamily: "IBM Plex Mono"
    px: 180
    weight: 600
    lineHeight: 0.9
    tracking: "-0.04em"
    tabularNumbers: true
  lowerThirdName:
    fontFamily: "Newsreader"
    px: 58
    weight: 500
    lineHeight: 1.0
  lowerThirdRole:
    fontFamily: "IBM Plex Mono"
    px: 38
    weight: 400
    lineHeight: 1.15
    tracking: "0.08em"
    uppercase: true
  captions:
    fontFamily: "Newsreader"
    px: 48
    weight: 500
    lineHeight: 1.15
    maxLines: 2

spacing:
  safeX: "96px"
  safeY: "54px"
  contentPadX: "120px"
  contentPadY: "84px"
  columnGap: "72px"
  sectionGap: "64px"
  textGap: "28px"
  rule: "2px"
  ruleEmphasis: "4px"
  radiusSmall: "6px"
  radiusPanel: "10px"
  grainOpacity: "0.02–0.04"

components:
  frameGround:
    backgroundColor: "{colors.paper}"
    texture: "laid-paper grain plus a localized indigo radial wash at 15–25% opacity"
    description: "Every scene uses a full-bleed child ground; never put the fill only on the composition root."
  evidenceRule:
    color: "{colors.indigo}"
    thickness: "{spacing.rule}"
    description: "Hairline divider, chart axis, or registration mark; draw-on is the default reveal."
  label:
    typography: "{typography.label}"
    color: "{colors.indigo}"
    description: "Uppercase section, method, source, or status chrome; never the main headline."
  statBlock:
    typography: "{typography.stat} + {typography.dataLabel}"
    color: "{colors.indigo} on {colors.paper}"
    description: "One sourced number as the focal point; supporting label beneath or to the right."
  lowerThird:
    placement: "{frame.lowerThirdZone}"
    typography: "{typography.lowerThirdName} + {typography.lowerThirdRole}"
    structure: "2px indigo rule, name, then role/source; paper field at 92–100% opacity"
    maxWidth: "1152px"
    description: "Left-aligned by default. Never collide with captionZone."
  captions:
    placement: "{frame.captionZone}"
    typography: "{typography.captions}"
    color: "{colors.ink}"
    structure: "maximum two centered lines on a paper field; highlight no more than one phrase in indigo"
  cornerMark:
    asset: "public/lupine-science-mark.svg"
    size: "72px high opener; 56px high optional episode marker"
    clearSpace: "36px minimum on every side"
    placement: "inside titleSafe, normally top-left or top-right"
  outroMark:
    asset: "public/lupine-science-mark.svg"
    size: "180px high"
    placement: "centered above Lupine Science wordmark in the final two seconds"

motion:
  energy: "calm-to-medium editorial"
  primaryTransition:
    name: "indigo-line wipe"
    durationFrames: 12
    durationSeconds: 0.4
    easing: "power2.inOut"
    usage: "60–70% of scene changes; horizontal by default, vertical only for section changes"
  relatedBeatTransition:
    name: "subtle push + crossfade"
    durationFrames: 12
    durationSeconds: 0.4
    easing: "power2.inOut"
  sectionTransition:
    name: "field-line reveal"
    durationFrames: 15
    durationSeconds: 0.5
    easing: "power3.inOut"
    usage: "occasional accent at major narrative turns; no more than twice per 90–120 second film"
  outroTransition:
    name: "paper fade"
    durationFrames: 21
    durationSeconds: 0.7
    easing: "sine.inOut"
  entranceDuration: "0.35–0.60s"
  entranceRule: "Every scene enters in 2–4 staggered phases; data reveals causally, never decoratively."
  exitRule: "No element exit animation before a scene transition; the transition performs the handoff."

assets:
  mark: "/home/alex/Dev/lupine/lupine-science/public/lupine-science-mark.svg"
  icon: "/home/alex/Dev/lupine/lupine-science/public/lupine-science-icon.png"
  newsreaderNormal: "/home/alex/Dev/lupine/lupine-science/public/fonts/newsreader-var.woff2"
  newsreaderItalic: "/home/alex/Dev/lupine/lupine-science/public/fonts/newsreader-italic-var.woff2"
  plexMono400: "/home/alex/Dev/lupine/lupine-science/public/fonts/plex-mono-400.woff2"
  plexMono600: "/home/alex/Dev/lupine/lupine-science/public/fonts/plex-mono-600.woff2"
---

# Lupine Science — Article Video Frame System

## Overview

Lupine Science films should feel like a scientific monograph has become an instrument: warm paper, rigorous typography, visible evidence, and motion that explains rather than decorates. The visual register is calm, premium, editorial, and technically precise. Every beat makes one claim and gives the eye a second place to travel—an evidence rule, source label, chart trace, registration tick, or provenance readout.

The website is the source of the paper/indigo/serif/mono identity. Video raises the scale, border weight, accent presence, and frame density so the system survives compression and small-screen playback. A frame is not a webpage: do not reproduce article cards or centered stacks at web scale.

## The Frame

The primary frame is **1920×1080 at 30 fps**. Critical content stays inside the 5% title-safe rectangle: **x 96–1824, y 54–1026**. Use **120px horizontal / 84px vertical** as the normal content inset so titles and charts have breathing room beyond the hard safety floor.

Every scene has three layers:

1. **Background:** paper ground, laid grain, and one restrained field texture (hyper-ribbon, error vectors, lattice, contour, or localized indigo wash).
2. **Midground:** the claim—headline, chart, equation, comparison, or figure.
3. **Foreground:** mono metadata, evidence rules, source IDs, registration ticks, axis labels, or a compact episode marker.

Aim for 8–10 visible elements while preserving one dominant idea. Density comes from evidence chrome and scientific structure, not repeated UI cards.

## Color

The seven frontmatter colors are the complete video palette. **No other hex color may appear without director approval.** Alpha variants of these colors are permitted for texture, washes, and rules; do not create a new hue by mixing them.

- **Paper** is the default full-frame ground.
- **Indigo** is the primary signal and the only routine light/accent: claim emphasis, key data, active traces, transitions.
- **Ink** carries primary copy.
- **Slate** carries secondary explanatory copy and neutral data series.
- **Amber, sage, and rose** are semantic chart/status accents only: distinction/caution, supported/positive, and risk/refuted. They never compete with indigo for the scene's focal point.
- Use at most **paper + ink + indigo + one semantic accent** in a single frame.

The series palette intentionally uses the video ink token rather than the website's slightly cooler near-black; do not mix both inks in one production.

## Typography

**Newsreader is the human voice. IBM Plex Mono is the evidence voice.** Use only these two families.

- Headlines are assertions: Newsreader 400, tight, sentence case, usually left-aligned. Italic indigo emphasis is allowed for one emotional or conceptual phrase.
- Body copy is Newsreader 48px minimum at 1080p. Keep it to four lines; rewrite rather than shrink.
- Labels, axes, and data callouts are IBM Plex Mono **36px minimum**. Uppercase labels track at 0.12em; numeric data uses tabular figures.
- Captions are Newsreader 48px minimum, two lines maximum.
- Use the local WOFF2 files listed in `assets`; copy them into each composition and declare explicit `@font-face` rules. Do not rely on a network font fetch or a system-only installation.
- If a title does not fit at its assigned size, shorten it or step down one token. Never reduce load-bearing text below the published floor.

## Lower Thirds and Captions

The lower-third band is fixed at **x 96–1824, y 738–972**. Standard source/name lower thirds align left, top-ruled in indigo, and occupy no more than 1152px width. The name/claim line is Newsreader 58px; the role/source line is IBM Plex Mono 38px.

When captions are present, reserve **x 192–1728, y 828–954**. A lower third may use the upper part of the band only; it must not sit behind or compete with captions. Never place a chart legend, axis, or critical illustration in the reserved caption zone.

## Logo and Identity Use

Use the canonical bluebonnet SVG mark as supplied; do not redraw, recolor, crop, rotate, add effects, or separate its internal shapes. Preserve its aspect ratio and at least half its rendered height as clear space.

- **Opening:** mark or mark + wordmark is visible within the first two seconds. The corner mark is 72px high.
- **Body:** an optional 56px episode marker may appear inside title-safe, but no persistent translucent watermark.
- **Outro:** mark is 180px high, centered above the wordmark, and remains visible for the final two seconds.
- Never combine the mark with literal flower photography, neon circuitry, or a substitute atom icon.

## Transition Language

The signature handoff is a **12-frame indigo-line wipe**. The line behaves like an evidence trace crossing the paper: it draws across the frame while outgoing and incoming scenes overlap, then resolves into a rule, axis, contour, or edge in the incoming scene. Do not play an exit fade and then reveal the next scene; outgoing and incoming motion happen together.

Use the signature wipe for 60–70% of changes. Related points may use a 12-frame subtle push + crossfade. Major section changes may use a 15-frame field-line reveal, at most twice per film. The outro closes with a 21-frame paper fade. Avoid glitch, neon, elastic bounce, 3D flips, tile grids, hard cuts, and a different transition for every scene.

Every scene has an intentional entrance in 2–4 phases. A chart builds in causal order: frame/axis → labels → marks → highlighted conclusion. Motion must reveal the insight described by the narration.

## Composition Patterns

### Claim + Evidence

Left 55–65%: one Newsreader assertion. Right/lower field: one sourced stat, small diagram, or provenance block. Add an indigo rule that connects claim to evidence.

### Data Field

Chart occupies 60–75% of frame area. Use 2–4px axes and 36px minimum labels. Indigo is the primary series; slate is comparison; amber/sage/rose appear only when semantics require them. Label the conclusion directly instead of relying on a legend when possible.

### Mechanism / Error Geometry

Use real vectors, contours, lattices, trajectories, or manifold/ribbon geometry. Scattered evidence resolves toward a visible indigo structure. Do not use generic AI-network nodes, stock 3D crystals, or decorative science glyphs unrelated to the claim.

### Quote / Definition

One Newsreader statement dominates 60–80% of frame width, with a mono attribution or definition key. Keep at least 40% visual silence and one structural rule or registration detail.

### CTA / Outro

Paper ground, centered canonical mark, concise Newsreader CTA, mono URL or proof-pack label. No new evidence or visual motif appears here.

## Depth and Surface

Use paper texture, localized radial washes, linework, and overlap for depth. Borders are 2px by default and 4px only for a focal chart trace or transition stroke. Panels may use 6–10px corners. Shadows should be absent or so restrained that removing them does not change hierarchy.

Do not use full-screen linear gradients, glassmorphism, neon glows, glossy cards, or pure black/white. Light-canvas cinema comes from structure, indigo presence, grain, and controlled vignette—not switching to dark mode.

## Voice and Visual Doctrine

The brand is proof-first, confident but not arrogant, frontier-technical but legible, and category-defining. Prefer measured numbers, inspectable evidence, error geometry, field evidence, and claim lifecycle. Avoid hype adjectives and unsupported certainty.

No-go visuals: people, literal lupine flowers or flower photography, generic atom logos, dark neon backgrounds, glowing-circuit AI tropes, text baked into generated imagery, and stock-looking 3D renders.

## Aspect-Ratio Adaptation

This file is normative for 16:9. For 9:16, recompose rather than crop: keep the same seven colors and type roles, hold a 5% short-edge safety floor, stack claim above evidence, and reserve the lower 22% for captions/lower thirds. For 1:1, use a 2-zone or asymmetric diagonal composition; do not squeeze a 16:9 split frame into a square.

## Do

- Start every frame from paper, ink, indigo, and one clear claim.
- Use Newsreader for assertions and IBM Plex Mono for evidence/provenance.
- Keep body/captions ≥48px and labels/axes ≥36px at 1080p.
- Respect the 5% title-safe rectangle and fixed lower-third/caption zones.
- Make data motion reveal the argument in causal order.
- Preserve the canonical SVG mark and show identity in the first and last two seconds.
- Use one dominant accent and one transition family across the film.
- Trace every number, date, and claim to the approved script or source.

## Don't

- Do not introduce colors outside the seven-token palette.
- Do not use a third typeface, network-loaded fonts, tiny metadata, or web-scale cards.
- Do not center every scene or make repeated equal-weight grids.
- Do not place critical content in the outer 5% or caption reserve.
- Do not animate elements out before a transition.
- Do not use arbitrary motion, hard cuts, transition roulette, or generic AI/science imagery.
- Do not fabricate numbers, institutions, partners, citations, or proof status.

## Pre-Render Self-Audit

- **Palette:** only the seven declared colors; no unapproved hex values.
- **Type:** Newsreader + IBM Plex Mono only; 48px body/caption and 36px labels/axes floors pass.
- **Safety:** all critical content is inside x 96–1824 / y 54–1026; caption and lower-third reserves are clear.
- **Frame craft:** background, message, and evidence chrome are present; one focal claim dominates.
- **Motion:** every scene enters; transitions overlap outgoing/incoming scenes; no pre-transition exit animation.
- **Identity:** canonical mark appears in the first and last two seconds with clear space intact.
- **Evidence:** every visible number and scientific assertion traces to the script/source.
- **Technical:** HyperFrames lint, validate, and inspect report zero errors; review representative 1080p frames at 100% size.

## Source of Truth

This translation is derived from:

- `/home/alex/Dev/lupine/lupine-science/docs/brand-guidelines.md`
- `/home/alex/Dev/lupine/lupine-science/docs/content-design-system.md`
- `/home/alex/Dev/lupine/lupine-science/public/index.html`
- `/home/alex/Dev/lupine/lupine-science/public/articles/styles.css`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/BRIEF.md`
- `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/REVIEW_FRAMEWORK.md`
