# The 0.2% Synthesis Problem — composition frame review

## Decision: REJECT

The 105-second HyperFrames composition passes strict automated inspection but does not pass the visual release gate. Of 27 current representative frames extracted from the final MP4 (5-second grid, every scene cue start, and the end-of-timeline sample), 24 score below 7/10. The lowest score is 1/10 at the blank 0.0-second opening. The rendered evidence was freshly regenerated on 2026-07-10 after the final MP4 appeared.

## Review record

- Article/video: `the-02-percent-synthesis-problem`
- Article review ticket: `t_49e359ca`
- Draft source: `the-02-percent-synthesis-problem/index.html`
- Final render: `the-02-percent-synthesis-problem/renders/the-02-percent-synthesis-problem-final-1080p.mp4` (H.264/AAC, 1920×1080, 30 fps, 105.024 s)
- Rendered frame evidence: `reviews/evidence/the-02-percent-synthesis-problem-full-review/rendered/` (27 PNGs)
- Attached flagged frames: `reviews/evidence/the-02-percent-synthesis-problem-full-review/flagged/` (24 PNGs)
- Contact sheets: `reviews/evidence/the-02-percent-synthesis-problem-full-review/contact-sheet-1.jpg` through `contact-sheet-3.jpg`
- Score manifest: `reviews/evidence/the-02-percent-synthesis-problem-full-review/frame-scores.csv`
- HyperFrames check output: PASS, exit 0; semantic-accent audit passes, lint reports 0 errors/0 warnings, validate reports 0 console errors and 62 text elements passing WCAG AA, and strict inspect reports 0 layout issues across 11 samples
- Reviewer/date: `reviewer` / 2026-07-10
- Lowest score: 1/10
- Representative frames passing ≥7/10: 3/27
- P0/P1 counts: P0=2, P1=3
- Decision: `REJECT`
- Approval record: storyboard approved by director on 2026-07-10; narration remains conditionally approved because both required line edits are absent from the recording script; final release sign-off is not eligible while P0/P1 issues remain

## Sampling

Command:

`ffmpeg -ss <timestamp> -i renders/the-02-percent-synthesis-problem-final-1080p.mp4 -frames:v 1 reviews/evidence/the-02-percent-synthesis-problem-full-review/rendered/frame-<n>-at-<timestamp>s.png`

Scene cue starts were read from the composition: 0, 10, 25, 49, 62, 80, 97, and 103 seconds. The 103.3-second end-of-timeline proof state was also sampled. This produced 27 unique rendered frames. Pixel comparison against the deterministic source snapshots shows only expected H.264 differences (normalized RMSE 0.0085–0.0217), so the existing visual scores remain applicable. No WebVTT was supplied.

## Flagged issues

### P0-01 — Mandatory type floors fail throughout

Source-defined typography remains below policy: `.chrome`, `.eyebrow`, `.ratio-label`, `.path-label`, and `.return` are 30 px; `.source` is 26 px; gate numbers/body are 28 px; pipeline stages are 28 px; mechanism source text is 24 px; the outro URL is 30 px. Labels/callouts require ≥36 px, and explanatory gate copy is body text requiring ≥48 px. The contact sheets visibly confirm thumbnail-scale evidence and provenance labels.

Required fix: reflow rather than shrink. Raise labels/callouts to ≥36 px and explanatory/body text to ≥48 px, then provide a computed-style inventory proving no sub-floor text.

### P0-02 — Readability collisions at transitions and correction scene

At 10, 25, 49, 62, 80, and 97 seconds, the transition rule bisects important content. At 65–80 seconds the correction headline crowds the top chrome, and the strike treatment crosses explanatory copy. These boundary frames score 4/10 despite strict inspect passing.

Required fix: reserve independent chrome, headline, transition, and annotation zones; sample exact cut boundaries as well as settled proof states.

### P1-01 — Blank/weak entrance proof states

The 0.0-second frame is blank (1/10), so the required opening marker is not present at the actual start. The 50-second barrier entrance is nearly empty and scores 5/10.

Required fix: ensure the first rendered frame carries the episode marker and every cue-start frame has an intentional, readable proof state.

### P1-02 — Generic evidence imagery

The 85–97 second climate sequence uses generic bars, an unlabeled oval with a `DRC` badge instead of a geographic supply map, and an unlabeled amber wedge. The correction scene's circle-and-dots motif also remains generic. These do not communicate measured environment error, cobalt concentration, or emissions delay with claim-specific evidence.

Required fix: use directly labeled geographic form, axes/units, measured contours, and causal before/after states.

### P1-03 — Static-slide hierarchy and competing semantic accents

The four-filter grid and three-column correction/climate layouts read as presentation slides with equal-weight boxes. Several frames simultaneously use rose, amber, and/or sage accents rather than one semantic accent in addition to indigo.

Required fix: establish one dominant proof per frame, reveal evidence causally, and sequence semantic accents instead of showing competing states simultaneously.

## Complete 44-gate checklist

### Inputs and evidence
- [x] Article/video slug and review-ticket ID recorded.
- [x] Draft source and final render paths recorded.
- [x] Frames extracted from the final MP4 every 5 seconds and at every cue point.
- [x] Extracted/flagged frames attached to the article review evidence directory.
- [ ] Every representative frame scored with no frame or criterion below 7/10 — 24/27 fail.

### Release gates
- [ ] Script gate: director review is `APPROVED WITH REQUIRED LINE EDITS`, but both required replacements are still absent from `scripts/the-02-percent-synthesis-problem-narration.md`.
- [x] Storyboard gate: director approval is recorded in `the-02-percent-synthesis-problem/storyboard.md` (2026-07-10).
- [ ] Frame-review gate: scores do not meet ≥7/10.
- [ ] Director sign-off gate: approval absent and open P0/P1 defects remain.

### Typography
- [ ] Body text ≥48 px — gate explanatory copy is 28 px.
- [ ] Labels, axes, and data callouts ≥36 px — repeated 24–30 px text.
- [ ] No truncated/overlapping text or safe-edge contact — correction headline/chrome and strike/copy collisions remain.
- [x] Fonts limited to Lupine Newsreader + IBM Plex Mono.
- [x] Text contrast passes WCAG AA — current validate reports 62 text elements passing.

### Imagery
- [x] Reviewed render and extracted evidence are 1920×1080; vectors dominate.
- [x] No visible pixelation, compression artifacts, or blurred vector edges in source snapshots.
- [x] Charts/diagrams use the locked Lupine palette.
- [ ] Illustrations scientific and non-generic — correction/climate evidence is generic.
- [ ] Every image has a clear focal point/readable hierarchy — equal-weight grids and empty entrance states fail.

### Motion
- [ ] Every clip has an intentional entrance — blank/empty entrance states fail.
- [ ] Scene transitions consistent and non-jarring — rules bisect content at seven boundaries.
- [x] Data motion reveals bars, lines, and points in sampled states.
- [ ] Every movement supports narration — render exists, but no synchronized captions/transcript proof was supplied.
- [ ] Timing matches beat sheet — approved beat sheet/render not supplied.

### Composition
- [x] No critical content in outer 5% title-safe margin in sampled settled frames.
- [ ] Lower-third/caption zone consistent — no WebVTT caption track supplied.
- [ ] Logo/episode marker in first and last 2 seconds — blank at 0.0 seconds; outro passes.
- [x] Warm-paper background with subtle grain present.

### Audio
- [ ] Narration intelligible at normal volume — audio is present, but no human listening sign-off is recorded.
- [x] No digital clipping in the render's objective loudness scan (true peak −4.4 dBTP).
- [ ] Background music ≥12 dB below narration — the mixed render cannot prove stem-relative level.
- [ ] Pace fast but not rushed — no synchronized transcript/caption proof or director sign-off supplied.

### Narrative
- [x] 90–120 second Hook → Problem → Mechanism → Evidence → Scale → CTA arc (105 seconds).
- [ ] Every visual directly illustrates narration — no synchronized caption evidence; generic climate/correction visuals fail on their face.
- [ ] On-screen jargon has immediate plain-language translation — terms such as convex hull, Arrhenius sensitivity, and proper gradients are not immediately translated.
- [x] CTA clearly links to the article.

### Technical
- [x] Render is 1920×1080, 30 fps, H.264 with AAC audio; duration 105.024 seconds.
- [x] Web encode ≤3 MB/minute — the supplied 1280×720 H.264/AAC web encode is 2,816,537 bytes over 1.7504 minutes, approximately 1.61 MB/minute (`renders/the-02-percent-synthesis-problem/final/the-02-percent-synthesis-problem-720p-web.mp4`). The reviewed 1920×1080 render remains 14,463,950 bytes (~8.26 MB/minute), but it is not the web-delivery encode.
- [x] HyperFrames lint/validate/inspect: `npm run check` exits 0 with no lint warnings, console errors, contrast failures, accent violations, or strict layout issues.
- [ ] WebVTT captions time-synced/spell-checked — no VTT supplied.

### Issue handling
- [x] Rejected unreadable text, static-slide scenes, generic imagery, transition/readability failures, and missing release evidence.
- [x] Failures logged with timestamp/frame, criterion, severity, score, and required fix in this report and CSV.
- [ ] Animator fixed all P0/P1 issues — a render is supplied, but 24/27 rendered frames remain below threshold.
- [ ] Reviewer re-checked flagged frames at ≥7/10 or escalated — current set is the rejection evidence awaiting fixes/director action.

## Release decision

REJECT. The final H.264 render, ≤3 MB/minute 720p web encode, storyboard approval, and automated HyperFrames inspection pass their respective gates, but the visual and remaining release gates do not. Before re-review, supply: (1) corrected typography and transition/collision proof states, (2) claim-specific correction/climate evidence, (3) synchronized spell-checked WebVTT, (4) a narration script containing the director's two required line edits, and (5) final director sign-off after all P0/P1 defects close. Re-check the 24 attached rendered flagged frames first, then regenerate the full 5-second-plus-cue sample for regression review.
