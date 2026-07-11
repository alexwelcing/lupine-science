# Five Materials That Could Unlock 5–12 GtCO₂/Year — frame review

## Decision: REJECT — no reviewable composition or render

The script and storyboard gates are approved, but the article directory contains no HyperFrames composition, rendered MP4, snapshot set, WebVTT file, or HyperFrames check output. Repository-wide searches found no HTML composition or MP4 matching this slug. Consequently the required extraction every five seconds and at cue points cannot run, no frame can be truthfully scored, and no flagged-frame image can be attached. This is a P0 release blocker.

## Review record

- Article/video: `five-materials-for-5-to-12-gtco2-year`
- Composition-check ticket: `t_11f4b72c`
- Visual defect review ticket: `t_5345f64b`
- Filed remediation ticket: `t_b001d1d3` (P0, animator)
- Approved script: `five-materials-for-5-to-12-gtco2-year/narration-script.md`
- Approved storyboard: `five-materials-for-5-to-12-gtco2-year/storyboard.md`
- Draft render: **not supplied**
- Frame evidence: **not supplied; extraction impossible without a render**
- HyperFrames check output: **not supplied**
- Reviewer/date: `reviewer` / 2026-07-10
- Representative frames reviewed: 0
- Lowest score: 0/10 (required frame evidence)
- P0/P1 counts: 1 / 0
- Decision: `REJECT`
- Director sign-off: **not recorded for a final render**

## P0-01 — No reviewable composition, render, or frames

- **Severity:** P0
- **Timestamp/frame:** N/A — no render exists
- **Criterion:** Inputs/evidence; frame-review gate; technical release gate
- **Score:** 0/10
- **Evidence:** The article directory has 13 planning/audio/transcript files only. It has no `.html`, `.mp4`, snapshot directory, caption file, or lint/validate/inspect evidence. The project-wide HTML and MP4 inventories contain no artifact for this slug.
- **Required fix:** Build the director-approved 92.376-second HyperFrames composition; provide a versioned 1920×1080, 30 fps, H.264 review render; run lint/validate/inspect with zero errors; produce a spell-checked, time-synced WebVTT; then run `scripts/extract-review-frames.sh` on the render for the five-second grid and every storyboard cue/transition point.
- **Acceptance evidence:** composition source, review MP4, check output, WebVTT, complete PNG snapshot set, contact sheets, computed typography/color inventory, and full-resolution copies of every frame scoring below 7/10.
- **Filed ticket:** `t_b001d1d3` — P0: Build Five Materials composition and complete visual-review package.

## 44-gate checklist

### Inputs and evidence

- [x] Article/video slug and review-ticket ID recorded.
- [ ] Draft render path or URL recorded — no draft render supplied.
- [ ] Frames extracted every 5 seconds and at every cue point — impossible without render.
- [ ] Extracted/flagged frames attached — no frame-bearing artifact exists.
- [ ] Every representative frame scored; no frame or criterion is below 7/10 — zero frames available.

### Release gates

- [x] Script gate: director approved narration and beat sheet (`director-script-review.md`).
- [x] Storyboard gate: director approved visual sequence and timing (`director-storyboard-review.md`).
- [ ] Frame-review gate: evidence unavailable; P0-01 open.
- [ ] Director sign-off gate: no final 1080p render exists to watch.

### Typography — not assessable

- [ ] Body text ≥48 px at 1080p.
- [ ] Labels, axes, and data callouts ≥36 px at 1080p.
- [ ] No truncated/overlapping text or text touching safe-margin edge.
- [ ] Fonts limited to Lupine Newsreader + IBM Plex Mono.
- [ ] Text contrast passes WCAG AA.

### Imagery — not assessable

- [ ] Raster sources ≥1920×1080 and crisp when scaled.
- [ ] No pixelation, compression artifacts, or blurred vector edges.
- [ ] Charts/diagrams use the approved Lupine palette.
- [ ] Illustrations use warm paper, indigo accents, scientific-not-decorative styling, and no generic stock look.
- [ ] Every image has a clear focal point and readable hierarchy.

### Motion — not assessable

- [ ] Every clip has an intentional entrance animation, not a hard cut.
- [ ] Scene transitions are consistent and not jarring.
- [ ] Data motion reveals the insight.
- [ ] Every movement supports narration; no arbitrary motion.
- [ ] Timing matches the beat sheet; clips do not linger.

### Composition — not assessable

- [ ] No critical content in outer 5% title-safe margin.
- [ ] Lower-thirds/captions use the established zone consistently.
- [ ] Logo or episode marker appears in first and last 2 seconds.
- [ ] Background uses Lupine warm paper with subtle grain.

### Audio — source exists, final audiovisual result not assessable

- [ ] Narration intelligible at normal volume in the rendered film.
- [ ] No clipping, breath pops, or sibilance spikes in the rendered film.
- [ ] Background music, if present, ≥12 dB below narration in the rendered film.
- [ ] Pace fast but not rushed; breaths between clauses audible in the rendered film.

### Narrative — planned, not verifiable against frames

- [x] Planned 92.376-second arc follows Hook → Problem → Mechanism → Evidence → Scale → CTA.
- [ ] Every visual directly illustrates current narration — no visuals supplied.
- [ ] On-screen jargon has immediate plain-language translation — no frames supplied.
- [ ] CTA clearly links to article or proof pack — no rendered outro supplied.

### Technical

- [ ] Render: 1920×1080, 30 fps, H.264 — no render supplied.
- [ ] Web encode ≤3 MB/minute — no encode supplied.
- [ ] HyperFrames lint/validate/inspect: 0 errors — no composition/check output supplied.
- [ ] WebVTT captions time-synced and spell-checked — no WebVTT supplied.

### Issue handling

- [x] Reject unreadable/static/off-brand/mismatched/unanimated/invalid work — release rejected because required evidence is absent.
- [x] Log each failure with timestamp/frame, criterion, severity, score, and required fix — P0-01 logged; timestamp is N/A because no render exists.
- [ ] Animator fixed all P0/P1 issues and supplied a new render.
- [ ] Reviewer re-checked flagged frames; each is ≥7/10 or escalated to director.

## Frame score table

| Frame | Time | Score | Result |
|---|---:|---:|---|
| N/A | N/A | 0/10 | FAIL — no frame-bearing artifact exists |

## Handoff

Do not advance this article video to visual-fix, final-render, or director-sign-off stages. Build and supply the review package listed under P0-01, then rerun the complete representative-frame review. Storyboard intent is not pixel evidence, and the frame-review gate cannot pass until every extracted frame scores at least 7/10 and no P0/P1 remains open.
