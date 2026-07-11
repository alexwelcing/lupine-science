# Critical Minerals, PFAS, and the Remediation Imperative — visual flags

## Decision: REJECT

Review date: 2026-07-10  
Composition: `critical-minerals-pfas-and-the-remediation-imperative/index.html`  
Evidence: article-local `snapshots/` at 1920×1080  
P0 / P1 visual issue groups: **0 / 2**

## Filed remediation tickets

- `t_286e0524` — P1: raise informational typography to the 36 px minimum.
- `t_90429389` — P1: remove transition collisions and restore a single focal hierarchy.

## Method and verification

- Inspected the full-resolution article snapshots and contact sheets, including settled states and scene boundaries.
- Audited the composition CSS against the explicit ≥36 px requirement for labels, axes, data callouts, and sources.
- Ran `npm run check` in the article directory. HyperFrames lint, validate, and strict inspect passed with zero errors; lint reports one unrelated duplicate-media-discovery warning. Automated checks do not enforce this project's 36 px editorial floor or reject readable cross-scene composites.
- The canonical Lupine palette and fonts are present in source. HyperFrames validation reports zero contrast failures.

## P1-01 — informational text is below 36 px

- **Severity:** P1
- **Affected worlds / representative timestamps:** World 02 at 23s; World 03 at 41s; World 04 at 58s; World 06 at 93s
- **Criterion:** labels, axes, data callouts, chrome, and sources must be ≥36 px at 1080p
- **Source evidence:**
  - `.small-stat` — 28 px (`kJ / MOL`, World 03)
  - `.loop-node` — 32 px (World 02)
  - `.filter` — 32 px and `.waste` — 28 px (World 03)
  - `.site-row .chip` — 30 px (World 04)
  - `.engine` — 34 px and `.campaign` — 33 px (World 06)
- **Visual evidence:** the World 04 site labels are visibly the weakest readable tier in the 49.3–60.8s evidence; the World 03 unit and contaminated-media labels and World 06 branch labels are similarly undersized in the full composition.
- **Required fix:** raise every informational text style to at least 36 px and reflow its container so no label clips, wraps ambiguously, or competes with the primary claim.
- **Acceptance evidence:** computed-size inventory showing no informational style below 36 px plus full-resolution settled frames at 23s, 41s, 58s, and 93s.
- **Filed ticket:** `t_286e0524`.

## P1-02 — scene handoffs show two readable scenes and clipped content

- **Severity:** P1
- **Affected timestamps:** 14.3s, 31.1s, 47.4s, 65.2s, 81.7s, and 98.8s
- **Criterion:** one clear focal point per frame; no overlapping or clipped readable claims, diagrams, labels, or footer rails
- **Source evidence:** the shared transition retains the outgoing scene at `opacity: .78` and shifts it only 96 px while the incoming 1920 px scene translates over it. A 56 px translucent wash and 4 px trace do not fully occlude the outgoing content.
- **Visual evidence:** boundary frames show outgoing and incoming headlines, body copy, diagrams, top rails, and footer rails simultaneously. At 14.3s and 31.1s, the old right-hand scientific instrument remains readable while the incoming chart/bond system enters; at 47.4s, 65.2s, 81.7s, and 98.8s, large claims and diagrams are visibly cut at the moving boundary. The result is a split focal hierarchy rather than a clean handoff.
- **Required fix:** use the wipe as an opaque occlusion or phase opacity/readability so the outgoing scene clears before incoming content becomes readable. Preserve the indigo trace as continuity, but never expose two readable scene systems at once.
- **Acceptance evidence:** full-resolution pre/mid/post snapshots at all six boundaries showing no simultaneous readable scenes, no clipped text/diagrams, and one dominant focal point.
- **Filed ticket:** `t_90429389`.

## Passing visual criteria

- **Palette:** PASS. Source uses paper `#faf9f6`, ink `#1a1a1a`, indigo `#3d4db3`, amber `#e8a838`, sage `#5a8a6e`, slate `#6b7c8e`, and rose `#c75b5b`; no off-palette color violation was found.
- **Typography families:** PASS. Newsreader and IBM Plex Mono/Plex are the only composition faces.
- **Illustration direction:** PASS. The battery/glass, mineral-demand bars, carbon–fluorine bond, error landscape, local coordination field, and campaign branch are native scientific/data constructions rather than generic stock or decorative AI imagery.
- **Settled focal hierarchy:** PASS subject to typography repair. The latest 49.3–67.5s snapshots show a clear claim/evidence split and stable hierarchy once scenes settle.
- **Contrast:** PASS. `npm run validate` reports zero contrast failures.

## Final disposition

Reject the visual-flag gate until both P1 tickets are fixed and re-reviewed. The composition is on-brand and technically valid, but source-proven sub-36 px informational text and six cross-scene readable collisions violate the editorial legibility and single-focal-point requirements. This visual result does not supersede the separate director script/storyboard approval gates recorded in the frame-review report.
