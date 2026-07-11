# From Predicted Crystal to Commercial Cell — visual flag review

Decision: **REJECT**

Review ticket: `t_46c7e9bc`  
Composition: `from-predicted-crystal-to-commercial-cell/index.html`  
Evidence: `from-predicted-crystal-to-commercial-cell/snapshots/`  
Review date: 2026-07-10  
P0 / P1 issue groups: **1 / 3**

## Evidence and method

- Ran `npm run check`: lint, validate, and strict inspect completed with zero errors; lint emitted one warning for duplicate discovery of the repeated logo asset.
- Captured the live composition at 6, 20, 34, 49, 64, 80, 94, 99.2, and 100 seconds with HyperFrames snapshot.
- Reviewed the generated contact sheet and the composition’s declared CSS values against the Lupine 1080p floor: body text ≥48 px and labels, axes, data callouts, chrome, and sources ≥36 px.
- No review MP4 exists. Snapshot evidence is sufficient to reject the visual defects below, but not to clear final render, encode, audio, or caption gates.

## P0-01 — production source remains director-rejected

- **Severity:** P0
- **Timestamp/frame:** all frames; source/timing blocker
- **Criterion:** approved narration and storyboard gate
- **Evidence:** `director-storyboard-review.md` remains `REJECT — REVISE AND RESUBMIT`. The composition is timed to the 102.288-second narration master whose Beats 1, 2, and 7 retain superseded wording. The composition has therefore been built against a production source the director explicitly blocked.
- **Required fix:** apply the three approved narration replacements, regenerate the master/transcript, reconform scene and cue timing at 30 fps, preserve a two-second untouched end-card hold, and obtain director storyboard approval before final rendering.
- **Acceptance evidence:** approved narration text and master, revised transcript/cue table, explicit storyboard approval, and a new versioned review render.

## P1-01 — persistent typography below the 36 px label floor

- **Severity:** P1
- **Timestamps/frames:** 6, 20, 34, 49, 64, 80, and 94 seconds; additional instances at 99.2/100 seconds are transition-state dependent
- **Criterion:** labels, axes, data callouts, chrome, and sources must be ≥36 px at 1080p
- **Objective evidence:**
  - `.kicker`, `.meta`, `.label`, `.small`, `.stage`, and `.source`: 30 px globally.
  - `.safe`: 27 px.
  - `.mono`: 30 px.
  - `.node`: 22 px.
  - World 3 `.stage`: 22 px.
  - World 4 `.delta`: 34 px.
  - World 5 `.badge`: 28 px.
  - World 6 `.hub`: 25 px; `.route-label`: 24 px.
- **Visible result:** the six handoff labels at 34 seconds, candidate-card copy at 64 seconds, five route names at 80 seconds, and footer/source rails throughout read as fine print in the 1080p contact sheet. The 94-second `LAB`/`MFG` node labels are also below floor.
- **Required fix:** raise all informational labels to at least 36 px. If content no longer fits, remove secondary chrome, shorten copy, or sequence labels temporally; do not solve density by shrinking type.
- **Acceptance evidence:** computed-style inventory showing no informational text below 36 px and full-resolution snapshots proving no clipping or collisions.

## P1-02 — off-brand palette tokens

- **Severity:** P1
- **Timestamps/frames:** all worlds; most visible in rose/amber/sage/slate accents at 20, 49, 64, and 80 seconds
- **Criterion:** charts and diagrams use the approved Lupine palette
- **Objective evidence:** the composition declares `--rose:#a83f55`, `--sage:#39785c`, `--amber:#c66a24`, and `--slate:#5c667c`, while the review standard requires rose `#c75b5b`, sage `#5a8a6e`, amber `#e8a838`, and slate `#6b7c8e`. Indigo `#3d4db3` is correct.
- **Required fix:** replace the four noncanonical tokens with the approved values and rerun contrast validation. Do not retain near-match substitutes as undocumented local variants.
- **Acceptance evidence:** token diff plus new snapshots and a zero-failure contrast report.

## P1-03 — dense secondary systems weaken focal hierarchy and collide in the lower rail

- **Severity:** P1
- **Timestamps/frames:** 34, 64, 80, and 94 seconds
- **Criterion:** every image has a clear focal point and readable hierarchy; no overlapping text
- **Evidence:**
  - At 34 seconds, six numbered nodes, six tiny stage labels, the moving baton, headline, body, chrome, and two footer strings compete at once.
  - At 64 seconds, concentric field rings, force vectors, candidate card, certificate badge, headline/body, and two footer strings produce two competing focal systems.
  - At 80 seconds, five 24 px route labels and crossing route lines make the panel’s intended “five routes” insight difficult to scan.
  - At 94 seconds, the centered safe-line text and right-aligned source occupy the same lower rail and visibly overlap (`COMMERCIAL CELL` / `TARGET ARCHITECTURE · NOT DELIVERED OUTCOME`). Similar footer crowding is visible at 64 and 80 seconds.
- **Required fix:** phase dense systems so one causal insight leads each frame; simplify secondary chrome; reserve separate nonoverlapping regions for the safe line and source. Recheck 34, 64, 80, and 94 seconds at full 1920×1080.
- **Acceptance evidence:** exact-time snapshots with a single dominant focal point, readable route/stage labels, and no footer collision.

## Illustration assessment

No generic stock illustration was found. The crystal, cell, process rail, barrier curves, error field, route fan-out, and end-card mark are native vector/CSS constructions and follow the intended scientific-diagram direction. This criterion passes subject to the palette and hierarchy corrections above.

## Final disposition

Reject the visual gate. P0-01 blocks final production, while P1-01 through P1-03 require visual remediation. A re-review must inspect the exact flagged timestamps in a corrected versioned MP4 and confirm every informational label is at least 36 px, only canonical palette tokens are used, footer text does not collide, and each frame has one readable focal hierarchy.
