# A Field, Not a Neural Net — frame review

## Decision: BLOCKED / REJECT

No frame-bearing artifact exists for this article video. The approved storyboard and mastered audio are present, but there is no HyperFrames composition, rendered MP4, or snapshot directory under `a-field-not-a-neural-net/`, and no matching render under `renders/`. Therefore no frame can be truthfully marked or scored for text below 36 px, generic illustration, palette violations, or focal hierarchy. The frame-review release gate is not eligible to pass.

## Review record

- Article/video: `a-field-not-a-neural-net`
- Article review ticket: `t_8af88598`
- Storyboard: `a-field-not-a-neural-net/storyboard.md` (director-approved)
- Draft source: **not supplied**
- Draft render: **not supplied**
- Frame evidence: **not supplied**
- Reviewer/date: `reviewer` / 2026-07-10
- Representative frames reviewed: 0
- P0 count: 1
- P1 count: 0 (not assessable until frames exist)
- Decision: `REJECT`

## P0-01 — No reviewable frames or render

**Criterion:** Required inputs and evidence; frame-review gate; technical release gate.

**Evidence:** The article directory contains the approved script/storyboard, narration files, and final audio mix only. Repository search found no HTML composition containing this slug/title and no matching MP4. Without a 1920×1080 composition snapshot set or rendered video, text size, illustration specificity, color compliance, and focal hierarchy cannot be inspected.

**Required fix:** Build the director-approved 106-second HyperFrames composition, run strict lint/validate/inspect, and supply a versioned 1920×1080 30 fps H.264 review render. Extract representative frames every 5 seconds and at every scene/cue boundary, including transition frames. Include a computed-style typography inventory proving body/captions are at least 48 px and labels/axes/data callouts are at least 36 px.

**Acceptance evidence for re-review:**

1. HyperFrames source path and strict check output.
2. Versioned 1080p review MP4 path.
3. Snapshot directory covering a 5-second grid, all seven world starts, cue boundaries, and transition overlap states.
4. Contact sheets and full-resolution flagged-frame copies.
5. Computed text-size and color-token inventory.

## Deferred visual checks

These checks are mandatory but cannot be scored from a storyboard:

- all visible labels/axes/data callouts ≥36 px and body/captions ≥48 px;
- no generic neural-network, stock-crystal, generic climate-icon, or decorative science imagery;
- only paper, ink, indigo, and at most one approved semantic accent per frame;
- one clear focal claim per frame, with scientific evidence chrome subordinate;
- no critical content in title-safe or caption-reserve zones;
- no transition rule bisecting text or evidence;
- canonical mark visible in the first and final two seconds.

## Re-review instruction

Do not close the frame-review gate based on storyboard intent. Re-run the complete representative-frame review against actual 1920×1080 pixels after P0-01 is fixed, file timestamped P0/P1 findings for every failure, and require every sampled frame to score at least 7/10.

## Re-review — 2026-07-10 16:12 EDT

**Decision: ESCALATE TO DIRECTOR / GATE REMAINS REJECTED**

P0-01 is still open. A fresh repository search found no file matching this slug in `compositions/`, `renders/`, or `snapshots/`; the article directory still contains only planning, narration, mix, and transcript artifacts. Consequently there are no flagged pixels to compare with the original finding and no frame can earn the required 7/10 score.

| Flag | Current evidence | Score | Result |
|---|---|---:|---|
| P0-01 — no reviewable frames or render | No matching composition, MP4, or snapshot set | 0/10 | FAIL — unresolved |

**Gate result:** 0 of 1 flagged issues meet the ≥7/10 threshold. Do not advance to final render. Director action is required to restore or sequence the missing build and visual-fix work before another re-review is dispatched.

## Animator evidence package — 2026-07-10

P0-01 has been implemented and is ready for independent frame re-review.

- HyperFrames source: `a-field-not-a-neural-net/index.html`
- Review render: `a-field-not-a-neural-net/renders/a-field-not-a-neural-net-review-v1.mp4`
- Render properties: H.264 + AAC, 1920×1080, 30 fps, 106.027 seconds, 13,538,370 bytes
- Strict checks: `a-field-not-a-neural-net/evidence/{lint,validate,inspect}.json` — all pass with zero lint or inspect warnings/errors
- Frame evidence: `a-field-not-a-neural-net/snapshots/` — 66 requested frames covering the 5-second grid, narration cue starts, world boundaries, and transition overlap states
- Contact sheets: `a-field-not-a-neural-net/contact-sheets/contact-sheet-01.jpg` through `contact-sheet-06.jpg`
- Computed typography/color evidence: `a-field-not-a-neural-net/evidence/computed-style-inventory.json`
- Render probe/checksum: `a-field-not-a-neural-net/evidence/render-ffprobe.json` and `render-sha256.txt`

The composition uses the supplied canonical mark and published article figures. No scatter coordinates or theorem identifiers were synthesized. Contact-sheet QA found and corrected runtime-correction and proof-ledger overlaps before the final strict pass and render.


## Independent frame review — 2026-07-10 16:34 EDT

**Decision: REJECT — 9/66 representative frames score below 7/10; 2 P0 and 3 P1 issue groups remain open.**

Review input: `a-field-not-a-neural-net/renders/a-field-not-a-neural-net-review-v1.mp4` (SHA/probe evidence in `a-field-not-a-neural-net/evidence/`). Evidence set: 66 PNGs in `a-field-not-a-neural-net/snapshots/`, covering a 5-second grid and cue/transition points. Full-resolution copies of the nine failing frames are in `a-field-not-a-neural-net/review-frames/flagged-v1/`.

### Open blockers

| ID | Severity | Evidence | Score | Required fix |
|---|---|---|---:|---|
| P0-02 | P0 | Frames 04, 12, 21, 32: labels/axes baked into 1280×720 source charts are unreadable at 1080p and are not covered by the DOM typography inventory. | 6/10 | Rebuild charts as native HTML/SVG with every label/axis/callout ≥36 px, or supply 1920×1080+ artwork with readable labels. |
| P0-03 | P0 | No `.vtt` or `.srt` exists anywhere under the article project. | 0/10 | Produce, time-sync, and spell-check WebVTT captions against the 106.027 s final narration. |
| P1-01 | P1 | Frames 07 (13.00s), 25 (43.80s), 38 (60.80s), 47 (76.80s), 55 (93.80s) are near-blank transition states containing only a vertical rule/background. | 3/10 | Overlap outgoing/incoming designed content through transitions; no sampled frame may fall below 7/10. |
| P1-02 | P1 | All ten raster source figures are 1280×720; framework requires ≥1920×1080. | 4/10 | Replace or reconstruct at ≥1920×1080 and re-render. |
| P1-03 | P1 | Review encode is 13,538,370 bytes / 106.027 s = 7.66 MB/min, above the 3 MB/min web gate. | 4/10 | Supply a web encode ≤3 MB/min after visual fixes. |

Additional verification: the stream is H.264, 1920×1080, 30 fps with AAC; integrated audio is −16.0 LUFS and true peak −4.3 dBFS (no digital clipping observed). Lint and inspect report zero errors, but validate records 19 GSAP missing-target warnings, so the animator evidence claim of “all pass with zero warnings/errors” is inaccurate. Director sign-off has not been recorded.

### 44-gate checklist result

- Inputs/evidence: 4/5 pass; every frame is scored below, but the ≥7/10 condition fails.
- Release gates: script and storyboard approvals pass; frame-review and director sign-off fail.
- Typography: DOM sizes/fonts/contrast pass; baked chart labels and the no-truncation/readability gate fail.
- Imagery: palette/style/hierarchy broadly pass; ≥1920×1080 source and crisp/readable chart gates fail.
- Motion: animation exists, but transition continuity fails at five sampled cue boundaries; narration synchronization was not independently certifiable from stills.
- Composition: safe margins, warm-paper treatment, and end mark pass; transition frames fail focal-content quality. No burn-in caption zone exists to assess.
- Audio: loudness/peak measurements pass; narration quality/pacing and music-vs-voice separation require a director listening pass.
- Narrative: 106-second arc and CTA frame pass visually; narration/visual-line matching requires a director listening pass.
- Technical: format passes; web size and WebVTT fail; lint/inspect have zero errors, validate has zero errors but 19 warnings.
- Issue handling: failures are logged and attached; animator fix/re-render and reviewer re-check remain open.

### Representative-frame scores

| Frame | Time | Score | Result |
|---:|---:|---:|---|
| 00 | 0.00s | 8/10 | PASS |
| 01 | 4.26s | 8/10 | PASS |
| 02 | 5.00s | 8/10 | PASS |
| 03 | 5.24s | 8/10 | PASS |
| 04 | 10.00s | 6/10 | FAIL — embedded raster chart labels are below the 36 px/readability gate |
| 05 | 10.50s | 8/10 | PASS |
| 06 | 12.80s | 8/10 | PASS |
| 07 | 13.00s | 3/10 | FAIL — near-blank transition frame; no meaningful focal content |
| 08 | 13.20s | 8/10 | PASS |
| 09 | 13.58s | 8/10 | PASS |
| 10 | 15.00s | 8/10 | PASS |
| 11 | 15.70s | 8/10 | PASS |
| 12 | 20.00s | 6/10 | FAIL — embedded raster chart labels are below the 36 px/readability gate |
| 13 | 20.86s | 8/10 | PASS |
| 14 | 25.00s | 8/10 | PASS |
| 15 | 27.34s | 8/10 | PASS |
| 16 | 28.75s | 8/10 | PASS |
| 17 | 29.00s | 8/10 | PASS |
| 18 | 29.25s | 8/10 | PASS |
| 19 | 30.00s | 8/10 | PASS |
| 20 | 32.58s | 8/10 | PASS |
| 21 | 35.00s | 6/10 | FAIL — embedded raster chart labels are below the 36 px/readability gate |
| 22 | 35.98s | 8/10 | PASS |
| 23 | 37.48s | 8/10 | PASS |
| 24 | 40.00s | 8/10 | PASS |
| 25 | 43.80s | 3/10 | FAIL — near-blank transition frame; no meaningful focal content |
| 26 | 43.86s | 8/10 | PASS |
| 27 | 44.00s | 8/10 | PASS |
| 28 | 44.20s | 8/10 | PASS |
| 29 | 45.00s | 8/10 | PASS |
| 30 | 45.66s | 8/10 | PASS |
| 31 | 47.46s | 8/10 | PASS |
| 32 | 50.00s | 6/10 | FAIL — embedded raster chart labels are below the 36 px/readability gate |
| 33 | 52.54s | 8/10 | PASS |
| 34 | 55.00s | 8/10 | PASS |
| 35 | 55.13s | 8/10 | PASS |
| 36 | 59.42s | 8/10 | PASS |
| 37 | 60.00s | 8/10 | PASS |
| 38 | 60.80s | 3/10 | FAIL — near-blank transition frame; no meaningful focal content |
| 39 | 61.00s | 8/10 | PASS |
| 40 | 61.20s | 8/10 | PASS |
| 41 | 65.00s | 8/10 | PASS |
| 42 | 66.08s | 8/10 | PASS |
| 43 | 70.00s | 8/10 | PASS |
| 44 | 72.36s | 8/10 | PASS |
| 45 | 75.00s | 8/10 | PASS |
| 46 | 76.36s | 8/10 | PASS |
| 47 | 76.80s | 3/10 | FAIL — near-blank transition frame; no meaningful focal content |
| 48 | 77.00s | 8/10 | PASS |
| 49 | 77.20s | 8/10 | PASS |
| 50 | 80.00s | 8/10 | PASS |
| 51 | 83.66s | 8/10 | PASS |
| 52 | 85.00s | 8/10 | PASS |
| 53 | 87.76s | 8/10 | PASS |
| 54 | 90.00s | 8/10 | PASS |
| 55 | 93.80s | 3/10 | FAIL — near-blank transition frame; no meaningful focal content |
| 56 | 94.00s | 8/10 | PASS |
| 57 | 94.20s | 8/10 | PASS |
| 58 | 95.00s | 8/10 | PASS |
| 59 | 95.28s | 8/10 | PASS |
| 60 | 100.00s | 8/10 | PASS |
| 61 | 100.22s | 8/10 | PASS |
| 62 | 103.30s | 8/10 | PASS |
| 63 | 104.00s | 8/10 | PASS |
| 64 | 105.00s | 8/10 | PASS |
| 65 | 106.00s | 8/10 | PASS |

**Lowest score:** 0/10 at the captions criterion; lowest visual-frame score: 3/10. **Gate result:** REJECT. Do not advance to final/director approval until every P0/P1 is fixed and all nine flagged frames re-check at ≥7/10.
