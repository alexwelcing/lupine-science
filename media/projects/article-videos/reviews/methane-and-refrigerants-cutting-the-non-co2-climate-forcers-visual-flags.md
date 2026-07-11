# Methane and Refrigerants: Cutting the Non-CO₂ Climate Forcers — visual flag review

Decision: **REJECT**

Review ticket: `t_241dd993`
Parent frame-review ticket: `t_756decf2` (REJECT — no reviewable composition or render package)
Composition: **none exists for this slug**
Evidence: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers/narration-script.md` (draft beat sheet only)
Review date: 2026-07-10
P0 / P1 issue groups: **1 / 3**

## Filed remediation tickets

- `t_241dd993` (this task, on completion) — records the visual-gate rejection below.
- Proactive P1 design-risk flags for the animator, derived from the systemic defects observed in every sibling composition that has been built.

## Evidence and method

- Inventoried the article directory: it contains only `narration-script.md` with `status: draft`. No HyperFrames composition (`index.html`), no MP4, no WebVTT, no cue manifest, no snapshots, and no director storyboard/script approval exist for this slug.
- Cross-checked the four sibling article videos that DO have compositions (`five-materials-for-5-to-12-gtco2-year`, `from-predicted-crystal-to-commercial-cell`, `investing-in-the-trust-layer`, `the-02-percent-synthesis-problem`). Every one was rejected at the visual gate for the same three recurring defect classes: sub-36 px informational typography, focal-hierarchy/transition collisions, and (in two of four) noncanonical palette tokens.
- Ran the draft beat sheet through the Lupine 1080p floor and the established visual-flag checklist to identify the frames at highest risk of each defect class, so the animator can build the composition correctly the first time.
- Because there is no rendered frame to decode, no text can be measured as "unreadable" today. This report flags the structural risk and the specific beat points to audit; it does not assign a visual score to a non-existent frame.

## P0-01 — no composition, render, or approved production source exists

- **Severity:** P0
- **Timestamp/frame:** all frames; upstream production gate
- **Criterion:** approved storyboard/timing source before visual production; inputs/evidence for frame extraction
- **Evidence:** `narration-script.md` is `status: draft`. No director narration approval (`director-script-review.md` is absent), no storyboard, no `index.html`, no MP4, no WebVTT, and no extracted frames. The animator composition tasks (`t_37b854bd`, `t_49a6f566`, `t_e2515338`, `t_38ed1be7`) are running or ready but have produced no article-specific artifact yet. Director script approval (`t_c74a6d2e`) and storyboard approval (`t_97b25407`) remain blocked. There is nothing to visually inspect.
- **Required fix:** clear the director script and storyboard gates, then build and validate the HyperFrames composition, render a 1920×1080 30 fps H.264 MP4, produce a synchronized WebVTT, and extract representative frames before the visual-flag gate can run.
- **Acceptance evidence:** approved script and storyboard, composition source with zero-error lint/validate/inspect, review MP4, WebVTT, cue manifest, and full-resolution frame extractions at every five-second interval and cue point.

## P1-01 — high-risk informational typography across multiple dense beats

- **Severity:** P1 (proactive)
- **Beats at risk:** Beats 1, 2, 3, 5, 6
- **Criterion:** labels, axes, data callouts, chrome, and sources must be ≥36 px at 1080p; body text ≥48 px
- **Evidence:** The narration script's visual cues call for dense informational labeling:
  - Beat 1: `METHANE · 0.3 °C`, `HFCs · UP TO 0.5 °C`, `2030`, `2100` — four callouts plus headline wall in a 15-second scene.
  - Beat 2: a three-point gauge `EFFICIENCY · SAFETY · LOW GWP` and `MATERIAL MISSING` across a split screen.
  - Beat 3: `15–60%` barrier callout plus four edge-environment labels.
  - Beat 5: five stacked filters `PRESSURE, EFFICIENCY, FLAMMABILITY, TOXICITY, LIFETIME`.
  - Beat 6: `MEASURE → CORRECT AT RUNTIME → VERIFY`, three anchor points, and `n = 36 · r = 0.906 · 0 FITTED PARAMETERS`.
  Every sibling composition built so far ships these label/axis/source classes at 22–34 px — below the 36 px floor — because the content density tempts a smaller size. This article is denser than its siblings.
- **Required fix:** when building the composition, set every `.label`, `.kicker`, `.meta`, `.small`, `.stage`, `.source`, `.mono`, axis tick, data callout, and filter chip to ≥36 px at 1080p from the outset. If content does not fit, sequence labels temporally with the narration or shorten copy; do not solve density by shrinking type. Body copy ≥48 px.
- **Acceptance evidence:** computed-style inventory (like `computed-style-inventory.json` in the-02-percent-synthesis-problem) showing no informational text below 36 px, plus full-resolution snapshots proving no clipping or collision.

## P1-02 — focal-hierarchy and transition-collision risk at dense handoffs

- **Severity:** P1 (proactive)
- **Beats at risk:** Beats 2, 4, 5, 6, 7
- **Criterion:** one clear focal point per frame; no overlapping readable text or diagrams; transitions as occlusion/handoff, not transparent composites
- **Evidence:** The beat sheet prescribes split screens (Beat 2), forking reaction pathways with competing branch labels (Beat 4), million-candidate grids with stacked filters (Beat 5), multi-step pipeline plus scatter plot (Beat 6), and a three-body orbit end card (Beat 7). Every sibling composition with comparable density failed this criterion: outgoing evidence remained readable while incoming content appeared, and caption/source rails overlapped. The methane→methanol→CO₂ fork (Beat 4) and the hydrogen-plus-carbon branch are especially prone to label-on-line collisions (the exact defect that rejected 49.0s and 80.0s in from-predicted-crystal-to-commercial-cell).
- **Required fix:** phase dense systems so one causal insight leads each frame; use the transition wipe as a true occlusion rather than a transparent overlay; reserve separate non-overlapping regions for the safe line, caption, and source. Treat Beat 4's reaction pathway and Beat 6's pipeline+scatter as the two highest-collision-risk scenes.
- **Acceptance evidence:** exact-time pre/mid/post-boundary snapshots for every wipe with no readable collisions, and settled frames showing one dominant focal hierarchy.

## P1-03 — palette discipline for the split-screen and chemistry visuals

- **Severity:** P1 (proactive)
- **Beats at risk:** all beats; most visible in the split screen (Beat 2), reaction pathway (Beat 4), and filter stack (Beat 5)
- **Criterion:** charts and diagrams use the canonical Lupine palette only
- **Evidence:** Two of four sibling compositions shipped noncanonical palette tokens (e.g. `--rose:#a83f55` instead of `#c75b5b`, `--amber:#c66a24` instead of `#e8a838`). The chemistry visuals in this article (methane plume, methanol product, CO₂ over-oxidation, hydrogen branch, radical transition state) will each want a distinct semantic color, which is exactly where near-match substitutes creep in.
- **Required fix:** declare only the canonical tokens — paper `#faf9f6`, ink `#1a1a1a`, indigo `#3d4db3`, amber `#e8a838`, sage `#5a8a6e`, slate `#6b7c8e`, rose `#c75b5b`. Map the two climate levers and the reaction-pathway branches to these tokens before layout; do not invent local variants. Run contrast validation against the result.
- **Acceptance evidence:** token diff plus snapshots and a zero-failure contrast report.

## Illustration assessment

No illustration exists yet. The beat sheet calls for native scientific constructions (levers, catalyst gauges, energy barriers, reaction pathways, molecular grids, correction pipeline, orbit end card). These are on-brand in direction. This criterion cannot pass or fail until frames exist; it is flagged for the animator to keep the illustrations scientific-not-decorative and avoid generic stock.

## Final disposition

Reject the visual gate. P0-01 blocks all visual production because no composition or render exists. P1-01 through P1-03 are proactive design-risk flags grounded in the systemic defects that rejected every sibling composition; they give the animator concrete, checklist-able requirements to build the methane-and-refrigerants composition correctly the first time. A re-review must inspect exact flagged timestamps in a corrected versioned MP4 and confirm every informational label is at least 36 px, only canonical palette tokens are used, no transition or focal collisions remain, and each frame has one readable focal hierarchy.
