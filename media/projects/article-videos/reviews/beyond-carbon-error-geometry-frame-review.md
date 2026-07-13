# Beyond Carbon: The Error Geometry of Environmental Materials — frame review

## Decision: REJECT / BLOCKED

The 112-second 1080p composition was rendered and reviewed across all 69 interval/cue frames. All 69 score below 7/10 because the production CSS visibly uses 25–34 px labels/provenance while the framework requires ≥36 px; additional blank/weak transitions score as low as 2/10. Release is independently blocked by director-rejected narration and storyboard sources.

## Review record

- Article/video: `beyond-carbon-error-geometry`
- Article review ticket: `t_ff58b007`
- Draft render: `beyond-carbon-error-geometry/renders/beyond-carbon-error-geometry-final-1080p.mp4`
- Frame evidence: `beyond-carbon-error-geometry/review-frames/t_ff58b007-v1/` (69 frames, manifest, 4 contact sheets)
- Flagged evidence: `beyond-carbon-error-geometry/review-frames/flagged-t_ff58b007-v1/` (8 representative failures)
- HyperFrames check: `beyond-carbon-error-geometry/evidence/reviewer-check-t_ff58b007.txt` — lint/validate/strict inspect pass, 0 errors/warnings
- Reviewer/date: `reviewer` / 2026-07-12
- Lowest score: 2/10
- Frames below 7: 69/69
- Open issue groups: 3 P0 / 1 P1
- Filed frame-remediation tickets: `t_1c21b85a` (P0 typography), `t_fee03953` (P0 opening identity), `t_60972e4f` (P1 transition focal hierarchy)
- Decision: `REJECT`
- Director sign-off: **not recorded; upstream script and storyboard reviews request revisions**

## Open blockers

### P0-01 — Script and storyboard are not director approved

Director records `director-review-t_c9bcb824.md` and `director-review-storyboard-t_dec6a5eb.md` explicitly request revisions. The audio/captions still voice stale `77` theorem inventory while the visual composition shows `190 THEOREMS · 0 SORRY`; the blind-test and three-anchor claims are not audibly bounded. Required fix: revise and approve narration, regenerate audio/transcript/VTT, reconform Beats 5–7, and obtain storyboard approval.

### P0-02 — Mandatory typography floor fails

`index.html` declares visible `.domain` 28 px, `.env` 27 px, `.rail b` 30 px, `.candidate` 25 px, `.queue` 28 px, `.hub/.spoke` 31 px, `.stage` 25 px, `.proof` 27 px, `.source` 28 px, `.small` 30 px, and `.outro p` 34 px. These are labels, axes, data callouts, provenance, or CTA copy below the 36 px floor. Required fix: raise every label/axis/callout/provenance item to ≥36 px and body/CTA copy to ≥48 px, then reflow and rerender.

### P0-03 — Opening identity gate fails

Frames at 0.000s and 0.100s are blank paper; the canonical mark is not visible until later. Required fix: show logo/episode marker within the first 2 seconds without leaving cue-sampled blank frames.

### P1-01 — Transition frames lose designed content

Frames at 61.612s, 74.991s, 93.935s, and 106.920s are clipped/half-empty or mark-only transition states with weak hierarchy. Required fix: preserve outgoing/incoming evidence through wipes so every transition sample remains a designed ≥7/10 frame.

## Technical and audio evidence

- Render: H.264, 1920×1080, 30 fps, 112.021 s, 14,604,137 bytes — 7.82 MB/min, above the 3 MB/min web gate.
- Audio master: 109.824 s, −15.8 LUFS integrated, −4.2 dBFS true peak; BGM ducking report gives 37.77 dB margin.
- Captions: 46 cues and monotonic timing QA pass against the stale 297-word script, but source copy is not director-approved and therefore cannot pass final spell/content sync.
- HyperFrames: fresh `npm run check` passes lint, validate, and strict inspect with zero errors/warnings.

## 44-gate checklist

| # | Section | Gate | Result |
|---:|---|---|---|
| 01 | Inputs/evidence | Article/video slug and review-ticket ID recorded. | **PASS** |
| 02 | Inputs/evidence | Draft render path or URL recorded. | **PASS** |
| 03 | Inputs/evidence | Frames extracted every 5 seconds and at every cue point. | **PASS** |
| 04 | Inputs/evidence | Extracted/flagged frames attached to review artifact package. | **PASS** |
| 05 | Inputs/evidence | Every representative frame scored; no frame or criterion below 7/10. | **FAIL** |
| 06 | Release gates | Script gate: director approved narration and beat sheet. | **FAIL** |
| 07 | Release gates | Storyboard gate: director approved visual sequence and timing. | **FAIL** |
| 08 | Release gates | Frame-review gate: all scores ≥7/10. | **FAIL** |
| 09 | Release gates | Director sign-off on final 1080p render recorded. | **FAIL** |
| 10 | Typography | Body text ≥48 px at 1080p. | **PASS** |
| 11 | Typography | Labels, axes, and data callouts ≥36 px at 1080p. | **FAIL** |
| 12 | Typography | No truncated/overlapping text or text touching safe-margin edge. | **FAIL** |
| 13 | Typography | Fonts limited to Newsreader + IBM Plex Mono. | **PASS** |
| 14 | Typography | Text contrast passes WCAG AA. | **PASS** |
| 15 | Imagery | Raster sources ≥1920×1080 and crisp when scaled. | **N/A** |
| 16 | Imagery | No pixelation, compression artifacts, or blurred vector edges. | **PASS** |
| 17 | Imagery | Charts/diagrams use approved Lupine palette. | **PASS** |
| 18 | Imagery | Illustrations use warm paper, indigo accents, scientific-not-decorative styling. | **PASS** |
| 19 | Imagery | Every image has clear focal point and readable hierarchy. | **FAIL** |
| 20 | Motion | Every clip has an intentional entrance animation, not a hard cut. | **PASS** |
| 21 | Motion | Scene transitions are consistent and not jarring. | **FAIL** |
| 22 | Motion | Data motion reveals the insight. | **PASS** |
| 23 | Motion | Every movement supports narration; no arbitrary motion. | **PASS** |
| 24 | Motion | Timing matches beat sheet; clips do not linger. | **FAIL** |
| 25 | Composition | No critical content in outer 5% title-safe margin. | **PASS** |
| 26 | Composition | Lower-thirds/captions use established zone consistently. | **PASS** |
| 27 | Composition | Logo/episode marker appears in first and last 2 seconds. | **FAIL** |
| 28 | Composition | Background uses Lupine warm paper with subtle grain. | **PASS** |
| 29 | Audio | Narration intelligible at normal volume. | **PASS** |
| 30 | Audio | No clipping, breath pops, or sibilance spikes. | **PASS** |
| 31 | Audio | Background music ≥12 dB below narration. | **PASS** |
| 32 | Audio | Pace fast but not rushed; breaths audible. | **FAIL** |
| 33 | Narrative | 90–120 second Hook → Problem → Mechanism → Evidence → Scale → CTA arc. | **PASS** |
| 34 | Narrative | Every visual directly illustrates current narration. | **FAIL** |
| 35 | Narrative | On-screen jargon has immediate plain-language translation. | **PASS** |
| 36 | Narrative | CTA clearly links to article or proof pack. | **PASS** |
| 37 | Technical | Render is 1920×1080, 30 fps, H.264. | **PASS** |
| 38 | Technical | Web encode ≤3 MB/minute. | **FAIL** |
| 39 | Technical | HyperFrames lint/validate/inspect: 0 errors. | **PASS** |
| 40 | Technical | WebVTT captions time-synced and spell-checked. | **FAIL** |
| 41 | Issue handling | Reject unreadable text/static slides/off-brand imagery/mismatches/missing animation/failed validation. | **PASS** |
| 42 | Issue handling | Log each failure with timestamp, criterion, severity, score, required fix. | **PASS** |
| 43 | Issue handling | Animator fixed all P0/P1 issues and supplied new render. | **FAIL** |
| 44 | Issue handling | Reviewer re-checked flagged frames; each ≥7/10 or escalated. | **FAIL** |

## Representative-frame scores

| Time | Frame | Source | Score | Result |
|---:|---|---|---:|---|
| 00:00:00.000 | `frame-00-00-00-000.jpg` | interval | 2/10 | FAIL — blank warm-paper frame; no logo/episode marker in first 2 s |
| 00:00:00.100 | `frame-00-00-00-100.jpg` | cue | 2/10 | FAIL — blank warm-paper frame; no logo/episode marker in first 2 s |
| 00:00:03.720 | `frame-00-00-03-720.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:05.000 | `frame-00-00-05-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:06.980 | `frame-00-00-06-980.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:08.600 | `frame-00-00-08-600.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:10.000 | `frame-00-00-10-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:10.960 | `frame-00-00-10-960.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:13.560 | `frame-00-00-13-560.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:15.000 | `frame-00-00-15-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:15.400 | `frame-00-00-15-400.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:18.220 | `frame-00-00-18-220.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:20.000 | `frame-00-00-20-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:20.400 | `frame-00-00-20-400.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:23.700 | `frame-00-00-23-700.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:25.000 | `frame-00-00-25-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:26.612 | `frame-00-00-26-612.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:28.640 | `frame-00-00-28-640.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:30.000 | `frame-00-00-30-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:31.000 | `frame-00-00-31-000.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:32.820 | `frame-00-00-32-820.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:34.520 | `frame-00-00-34-520.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:35.000 | `frame-00-00-35-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:36.960 | `frame-00-00-36-960.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:39.180 | `frame-00-00-39-180.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:40.000 | `frame-00-00-40-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:41.880 | `frame-00-00-41-880.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:44.680 | `frame-00-00-44-680.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:45.000 | `frame-00-00-45-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:46.900 | `frame-00-00-46-900.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:48.320 | `frame-00-00-48-320.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:50.000 | `frame-00-00-50-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:50.760 | `frame-00-00-50-760.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:53.354 | `frame-00-00-53-354.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:55.000 | `frame-00-00-55-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:55.920 | `frame-00-00-55-920.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:57.260 | `frame-00-00-57-260.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:00:59.640 | `frame-00-00-59-640.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:00.000 | `frame-00-01-00-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:01.612 | `frame-00-01-01-612.jpg` | cue | 4/10 | FAIL — transition wipe leaves roughly half the frame blank/clipped |
| 00:01:03.760 | `frame-00-01-03-760.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:05.000 | `frame-00-01-05-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:05.048 | `frame-00-01-05-048.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:08.200 | `frame-00-01-08-200.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:10.000 | `frame-00-01-10-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:10.340 | `frame-00-01-10-340.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:13.120 | `frame-00-01-13-120.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:14.991 | `frame-00-01-14-991.jpg` | cue | 4/10 | FAIL — transition wipe leaves roughly half the frame blank/clipped |
| 00:01:15.000 | `frame-00-01-15-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:17.280 | `frame-00-01-17-280.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:20.000 | `frame-00-01-20-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:20.193 | `frame-00-01-20-193.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:22.556 | `frame-00-01-22-556.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:25.000 | `frame-00-01-25-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:25.520 | `frame-00-01-25-520.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:28.580 | `frame-00-01-28-580.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:30.000 | `frame-00-01-30-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:31.000 | `frame-00-01-31-000.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:33.935 | `frame-00-01-33-935.jpg` | cue | 5/10 | FAIL — transition state has weak hierarchy and large blank panel |
| 00:01:35.000 | `frame-00-01-35-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:35.774 | `frame-00-01-35-774.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:38.920 | `frame-00-01-38-920.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:40.000 | `frame-00-01-40-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:42.920 | `frame-00-01-42-920.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:44.120 | `frame-00-01-44-120.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:45.000 | `frame-00-01-45-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:45.572 | `frame-00-01-45-572.jpg` | cue | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |
| 00:01:46.920 | `frame-00-01-46-920.jpg` | cue | 5/10 | FAIL — outro transition is mark-only with excessive empty space |
| 00:01:50.000 | `frame-00-01-50-000.jpg` | interval | 6/10 | FAIL — visible labels/provenance are below the mandatory 36 px floor |

## Re-review acceptance

Do not advance to final sign-off until all four issue groups are fixed, a new versioned render is supplied, all 69+ representative frames score ≥7/10, the web encode meets ≤3 MB/min, and director approval is recorded for the revised narration, storyboard, and final 1080p film.
