# Methane and Refrigerants: Cutting the Non-CO₂ Climate Forcers — frame review

## Decision: REJECT — no reviewable composition or render package

This review cannot perform the requested five-second and cue-point extraction because the article directory contains only `narration-script.md`, whose front matter is explicitly `status: draft`. There is no approved narration record, storyboard/beat-sheet approval, HyperFrames composition, review MP4, WebVTT, cue manifest, extracted frame package, or director sign-off for this slug. No representative frame can be truthfully scored or attached.

Release is blocked by two P0 issue groups: the production source has not cleared the script/storyboard gates, and the complete audiovisual review package is absent. A frame-review pass requires a new review after those inputs exist; storyboard prose and visual cues are not pixel evidence.

## Review record

- Article/video: `methane-and-refrigerants-cutting-the-non-co2-climate-forcers`
- Frame-review ticket: `t_756decf2`
- Checklist reference: `t_277bc938`
- Draft render: **not supplied**
- Frame evidence: **none; extraction impossible without a render**
- HyperFrames check output: **not supplied; no composition exists for this slug**
- Captions: **not supplied**
- Reviewer/date: `reviewer` / 2026-07-10
- Representative render frames reviewed: 0
- Lowest score: 0/10 (missing required review package)
- P0/P1 counts: 2 / 0
- Decision: `REJECT`
- Director sign-off: **not recorded**

## P0-01 — Script and storyboard gates are not approved

- **Severity:** P0
- **Timestamp/frame:** N/A — blocked before render production
- **Criterion:** Script gate; storyboard gate
- **Score:** 0/10
- **Evidence:** The only article-specific file is `narration-script.md`; its front matter says `status: draft`. No director narration approval, storyboard, timing table, cue manifest, or director storyboard approval exists in the article directory. The beat sheet defines seven beats (0:00–1:46, planned 106 s) with narration and visual cues, but none of it has been conformed to an approved narration master or approved as a production storyboard.
- **Required fix:** Obtain director approval of the narration and beat sheet, create the frame-conformed storyboard/cue table, and record explicit director storyboard approval before animation proceeds.
- **Acceptance evidence:** Approved narration review, approved storyboard review, cue timestamps aligned to the approved narration master, and production-ready source files.

## P0-02 — Composition, render, captions, and frame evidence are absent

- **Severity:** P0
- **Timestamp/frame:** N/A — no MP4 exists to decode
- **Criterion:** Inputs/evidence; frame-review gate; technical release gate
- **Score:** 0/10
- **Evidence:** Repository inventory found no article-specific HyperFrames composition, MP4, WebVTT, frame extraction, contact sheet, or lint/validate/inspect output anywhere under the project for this slug. Therefore neither five-second sampling nor cue-point sampling can run, and no flagged frames can be attached. The shared `compositions/` directory holds only generic reusable templates (title-card, lower-third, data-chart, etc.); nothing is wired to this article.
- **Required fix:** Build the approved composition; run HyperFrames lint/validate/inspect with zero errors; render a 1920×1080, 30 fps H.264 review MP4; supply a synchronized, spell-checked WebVTT; run `scripts/extract-review-frames.sh` at every five-second interval and every approved cue point; attach all sub-7 frames.
- **Acceptance evidence:** Composition source, check logs, review MP4, WebVTT, cue manifest, complete frame manifest/contact sheets, and full-resolution copies of every failing frame.

## 44-gate checklist

### Inputs and evidence

- [x] Article/video slug and review-ticket ID recorded.
- [ ] Draft render path or URL recorded — no render supplied.
- [ ] Frames extracted every 5 seconds and at every cue point — impossible without a render and cue manifest.
- [ ] Extracted/flagged frames attached to the article review ticket — no frames exist.
- [ ] Every representative frame scored; no frame or criterion is below 7/10 — zero render frames are available.

### Release gates

- [ ] Script gate: director approved narration and beat sheet — only a draft narration script exists.
- [ ] Storyboard gate: director approved visual sequence and timing — no storyboard or approval exists.
- [ ] Frame-review gate: reviewer completed this checklist; every score is ≥7/10 — P0-01 and P0-02 score 0/10.
- [ ] Director sign-off gate: director watched final 1080p render and recorded approval/rejection notes — no final render or sign-off exists.

### Typography — not assessable

- [ ] Body text ≥48 px at 1080p.
- [ ] Labels, axes, and data callouts ≥36 px at 1080p.
- [ ] No truncated/overlapping text or text touching safe-margin edge.
- [ ] Fonts limited to Lupine Newsreader + IBM Plex Mono.
- [ ] Text contrast passes WCAG AA.

### Imagery — not assessable

- [ ] Raster sources ≥1920×1080 and crisp when scaled.
- [ ] No pixelation, compression artifacts, or blurred vector edges.
- [ ] Charts/diagrams use indigo `#3d4db3`, amber `#e8a838`, sage `#5a8a6e`, slate `#6b7c8e`, and rose `#c75b5b`.
- [ ] Illustrations use warm paper, indigo accents, scientific-not-decorative styling, and no generic stock look.
- [ ] Every image has a clear focal point and readable hierarchy.

### Motion — not assessable

- [ ] Every clip has an intentional entrance animation, not a hard cut.
- [ ] Scene transitions are consistent and not jarring.
- [ ] Data motion reveals the insight (bars grow, lines draw, points populate).
- [ ] Every movement supports narration; no arbitrary motion.
- [ ] Timing matches beat sheet; clips do not linger after narration moves on.

### Composition — not assessable

- [ ] No critical content in outer 5% title-safe margin.
- [ ] Lower-thirds/captions use the established zone consistently.
- [ ] Logo or episode marker appears in first and last 2 seconds.
- [ ] Background uses Lupine warm paper with subtle grain.

### Audio — not assessable

- [ ] Narration intelligible at normal volume.
- [ ] No clipping, breath pops, or sibilance spikes.
- [ ] Background music, if present, sits ≥12 dB below narration.
- [ ] Pace fast but not rushed; breaths between clauses audible.

### Narrative — planned in draft only; not verifiable against a film

- [ ] 90–120 second arc follows Hook → Problem → Mechanism → Evidence → Scale → CTA — draft timing targets 106 seconds, but no approved film exists.
- [ ] Every visual directly illustrates current narration — no rendered visuals exist.
- [ ] On-screen jargon has immediate plain-language translation — no frames exist.
- [ ] CTA clearly links to article or proof pack — no rendered CTA exists.

### Technical

- [ ] Render: 1920×1080, 30 fps, H.264 — no render supplied.
- [ ] Web encode ≤3 MB/minute — no web encode supplied.
- [ ] HyperFrames lint/validate/inspect: 0 errors — no composition or check output supplied.
- [ ] WebVTT captions time-synced and spell-checked — no WebVTT supplied.

### Issue handling

- [x] Reject unreadable text, static-slide scenes, generic/off-brand imagery, narration/visual mismatches, missing entrance animations, or failed HyperFrames validation — release rejected because required evidence is absent.
- [x] Log each failure with timestamp/frame, criterion, severity, score, and required fix — P0-01 and P0-02 are logged; timestamp is N/A because no render exists.
- [ ] Animator fixed all P0/P1 issues and supplied a new render.
- [ ] Reviewer re-checked flagged frames; each is ≥7/10 or escalated to director.

## Frame score table

No frame score rows can be produced. There is no MP4 to decode, no cue manifest, and no composition snapshots. The gate score is **0/10** for missing required evidence, not a visual score assigned to an unseen frame.

## Flagged-frame attachments

None. No render-derived frames exist. After P0-01 clears and a review package is supplied, run five-second plus cue-point extraction and copy every frame scoring below 7/10 into the article's persistent review-frame directory.

## Handoff

Do not advance this article-video to visual-fix, final-render, compression, or director-sign-off stages. First approve the narration and storyboard, then build and validate the composition and provide the complete MP4/VTT/cue package. Re-run all 44 gates and score every extracted representative frame; the frame-review gate may pass only when every applicable gate and frame is at least 7/10, no P0/P1 remains open, and director sign-off is recorded.
