# Investing in the Trust Layer — visual flag review

Decision: **REJECT**

Review ticket: `t_c2dba5f4`  
Composition: `investing-in-the-trust-layer/index.html`  
Evidence: `investing-in-the-trust-layer/snapshots/`, `transition-qa/`, `transition-boundaries/`, and `titles-qa/snapshots/`  
Review date: 2026-07-10  
P0 / P1 issue groups: **1 / 2**

## Filed remediation tickets

- `t_2fe8273c` — P0: Reconform timing and clear the director storyboard gate.
- `t_804eae03` — P1: Raise informational typography to the 36 px minimum.
- `t_b65d3044` — P1: Remove transition collisions and restore focal hierarchy.

## Evidence and method

- Reviewed the source CSS and existing 1920×1080 settled, title-state, and transition-boundary snapshots.
- Re-ran `npm run check` in the composition directory. Lint, validate, and strict inspect completed with zero errors; strict inspect reported zero issues. Lint retained one duplicate-media warning for the seven repeated logo-image nodes.
- Applied the Lupine 1080p floor: body copy ≥48 px; labels, axes, data callouts, chrome, and sources ≥36 px.
- Compared palette tokens against the canonical paper, ink, indigo, amber, sage, slate, and rose values.
- No review MP4 or synchronized WebVTT exists. Snapshot/source evidence is sufficient to reject the visual defects below, but not to clear final render, audiovisual sync, encode, or caption gates.

## P0-01 — production timing remains director-rejected

- **Severity:** P0
- **Timestamp/frame:** all frames; upstream production gate
- **Criterion:** approved storyboard/timing source before final visual production
- **Evidence:** `director-storyboard-review.md` remains `REJECT — RECONFORM TIMING AND RESUBMIT`. Its reviewed timeline ends at 113.000s while the approved audio master is 115.368s, narration activity continues to approximately 114.767s, and only about 0.601s of terminal silence remains rather than the required untouched two-second end-card hold. The composition declares 117.000s, but no revised director approval confirms that its phrase cues and scene boundaries are accepted.
- **Required fix:** reconform all seven beats and phrase cues to waveform/word-timestamp evidence on integer 30 fps frames, preserve the full approved audio and at least two untouched end-card seconds, update all timing audits, and obtain explicit director approval.
- **Acceptance evidence:** approved revised storyboard and cue table, versioned 1920×1080 30 fps review render, synchronized WebVTT, and a demonstrated ≥2.000s untouched end-card hold.
- **Filed ticket:** `t_2fe8273c`.

## P1-01 — informational text remains below 36 px

- **Severity:** P1
- **Timestamps/frames:** 15.2, 18.8, 21.9, 33.2, 48.3, 49.4, 53.8, 64.6, 77.0, 86.2, and 98.0 seconds
- **Criterion:** labels, axes, data callouts, chrome, and sources must be ≥36 px at 1080p
- **Objective source evidence:**
  - `.stage`: 24 px.
  - `.bay h3`: 30 px; `.bay p`: 25 px.
  - `.loss`: 30 px.
  - `.verified`: 34 px.
  - `.wheel-label`: 27 px.
  - `.gate`: 26 px.
- **Visible result:** the funnel loss labels are fine print and collide with the `736` result; pipeline stages are too small; the three-pillar bay headings and multi-line evidence copy are cramped; the `VERIFIED` stamp misses the floor; and wheel/gate labels are difficult to scan.
- **Required fix:** raise every informational label, axis, and data callout to at least 36 px. Reflow, shorten, or temporally sequence content when it no longer fits; do not preserve density by shrinking type.
- **Acceptance evidence:** computed-style inventory with no informational text below 36 px and exact-time 1920×1080 snapshots proving no clipping or collision.
- **Filed ticket:** `t_804eae03`.

## P1-02 — readable scene systems collide and focal hierarchy breaks

- **Severity:** P1
- **Timestamps/frames:** 13.9, 32.1, 44.7, 69.3, 84.9, and 104.2 seconds; settled density is also visible at 15.2–21.9, 48.3–64.6, and 86.2–98.0 seconds
- **Criterion:** one clear focal point per frame; no overlapping readable text or diagrams
- **Evidence:**
  - **13.9s:** outgoing abundance and incoming bottleneck claims, headers, diagrams, and footer rails are simultaneously readable. The funnel overlays the previous machine while both stories compete.
  - **32.1s:** the pipeline overlays the still-readable funnel scene. Header, claim, deck, caption, source, and two diagrams collide across the frame.
  - **44.7s:** the three-bay instrument overlays the pipeline while both top rails, claims, decks, captions, and sources remain readable; this is the most severe transition collision.
  - **69.3s and 84.9s:** adjacent scene handoffs retain dense outgoing evidence while the incoming system appears, weakening the intended evidence peak.
  - **104.2s:** wheel labels and dashed gates crowd the rotating circle and `FCC PROVEN` core, leaving several competing focal points immediately before the thesis transition.
  - In settled funnel frames, `FALSE POSITIVE / LAB WEEKS LOST` visually intersects the large `736`; in the three-bay scene, seven lines of 25–30 px text compete with three statistics and three mini-charts.
- **Required fix:** make readable outgoing content clear before incoming content becomes readable; use the wipe as a true occlusion/handoff rather than a transparent composite. Phase dense evidence systems around one narration-led focal point and reserve separate, nonoverlapping caption/source rails.
- **Acceptance evidence:** exact pre/mid/post-boundary snapshots for every wipe with no readable collisions, plus settled frames at the timestamps above showing one dominant focal hierarchy.
- **Filed ticket:** `t_b65d3044`.

## Palette and illustration assessment

- **Palette: PASS.** Source tokens match the canonical palette: paper `#faf9f6`, ink `#1a1a1a`, indigo `#3d4db3`, amber `#e8a838`, sage `#5a8a6e`, slate `#6b7c8e`, and rose `#c75b5b`. Fresh validation reports zero contrast failures.
- **Illustration direction: PASS.** No generic stock illustration, neural-network cliché, or decorative AI imagery was found. The funnel, pipeline, error-field curve, theorem bars, proof checker, flywheel, and portfolio route are native scientific/data constructions. Their direction is on-brand, subject to the density and focal-hierarchy fixes above.

## Final disposition

Reject the visual gate. P0-01 blocks approved production; P1-01 and P1-02 fail legibility and focal-hierarchy requirements even though the current automated strict inspect is clean. Re-review the exact timestamps against a corrected, versioned MP4 and synchronized VTT. Every informational label must be at least 36 px, every transition must avoid simultaneous readable scenes, every settled frame must have one clear focal point, and all filed P0/P1 tickets must be closed before release.
