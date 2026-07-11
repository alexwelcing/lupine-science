# From Predicted Crystal to Commercial Cell — frame review

## Decision: REJECT / ESCALATE — three render-decoded flagged frames remain below 7/10

Re-review on 2026-07-10 now uses frames decoded from the newly supplied 1920×1080, 30 fps H.264/AAC MP4 (`renders/from-predicted-crystal-to-commercial-cell-final-1080p.mp4`, 102.336s). The 99.2s and 100.0s CTA states pass (**8/10** each), but 49.0s, 64.0s, and 80.0s remain below threshold. The production also still uses the rejected 102.288-second narration master and superseded wording, so P0-01 remains **0/10**. The MP4 now resolves part of P0-02, but no WebVTT or approved source-aligned storyboard exists; P0-02 therefore remains open at **5/10**. Static checks previously passed (`lint`: 0 errors/1 warning; `validate`: 0 errors; `inspect --strict`: 0 issues).

Render-decoded evidence leaves three frames below threshold: 49.0s (**4/10**, the boxed `≈5,000×` callout covers the chart baseline, curve endpoints, and `CONDUCTIVITY SHIFT` axis label), 64.0s (**6/10**, the candidate-card border crosses into `ERROR ± BOUNDED`), and 80.0s (**6/10**, the ammonia route line runs through `AMMONIA CATALYST` and the route cluster remains crowded). The CTA is fully present and readable at both 99.2s and 100.0s (**8/10**). This gate is escalated to the director; it cannot be closed as “every flagged frame ≥7/10.”

### Re-review evidence

- Composition: `from-predicted-crystal-to-commercial-cell/index.html`
- Snapshot package: `from-predicted-crystal-to-commercial-cell/snapshots/`
- Contact sheet: `from-predicted-crystal-to-commercial-cell/snapshots/contact-sheet.jpg`
- Fresh post-change package: `from-predicted-crystal-to-commercial-cell/snapshots/re-review-2026-07-10/`
- Fresh post-change contact sheet: `from-predicted-crystal-to-commercial-cell/snapshots/re-review-2026-07-10/contact-sheet.jpg`
- Latest stable-source package: `from-predicted-crystal-to-commercial-cell/snapshots/re-review-2026-07-10-final-2/`
- Latest stable-source contact sheet: `from-predicted-crystal-to-commercial-cell/snapshots/re-review-2026-07-10-final-2/contact-sheet.jpg`
- Render-decoded package: `from-predicted-crystal-to-commercial-cell/snapshots/re-review-2026-07-10-render/`
- Render-decoded contact sheet: `from-predicted-crystal-to-commercial-cell/snapshots/re-review-2026-07-10-render/contact-sheet.jpg`
- Representative scores: 6.0s 8/10; 20.0s 8/10; 34.0s 7/10; render 49.0s 4/10; render 64.0s 6/10; render 80.0s 6/10; 94.0s 7/10; render 99.2s 8/10; render 100.0s 8/10.
- Typography evidence: `.route-label` is 24px, `.safe` is 27px, `.mono` is 30px, and `.node` is 22px; these violate the stated ≥36px label/axis floor.
- Required next action: correct the approved narration source/master and reconform timing; fix the three remaining sub-7 visual states; supply a synchronized VTT; rerun complete render extraction and score every flagged timestamp.

## Review record

- Article/video: `from-predicted-crystal-to-commercial-cell`
- Frame-review ticket: `t_cca5da02`
- Checklist reference: `t_277bc938`
- Storyboard: `from-predicted-crystal-to-commercial-cell/storyboard.md`
- Storyboard director review: `from-predicted-crystal-to-commercial-cell/director-storyboard-review.md`
- Draft render: `renders/from-predicted-crystal-to-commercial-cell-final-1080p.mp4` — 1920×1080, 30 fps, H.264/AAC, 102.336s
- Frame evidence: **22 composition snapshots plus five frames decoded from the supplied MP4**
- HyperFrames check output: **rerun locally: lint 0 errors/1 warning; validate 0 errors; inspect 0 issues**
- Captions: **not supplied**
- Reviewer/date: `reviewer` / 2026-07-10
- Representative frames reviewed: 9 visually distinct states from 22 snapshots
- Lowest visual-frame score: 4/10 at 49.0s; lowest gate score: 0/10 (rejected production source)
- P0/P1 counts: 2 / 0
- Decision: `REJECT`
- Director sign-off: **storyboard rejected; no final-render sign-off recorded**

## P0-01 — Script/storyboard production source is rejected

- **Severity:** P0
- **Timestamp/frame:** N/A — production is blocked before composition
- **Criterion:** Script gate; storyboard gate; timing/caption source integrity
- **Score:** 0/10
- **Evidence:** `director-storyboard-review.md` records `REJECT — REVISE AND RESUBMIT`. The 102.288-second narration master retains superseded wording in Beats 1, 2, and 7, so all 28 cue ranges are conformed to unapproved words. `storyboard.md` marks the script gate as a P0 blocker and the animator handoff as blocked.
- **Required fix:** Apply the three director-approved narration replacements, regenerate the master and verbatim transcript, recompute sentence boundaries, frame-conform all cues at 30 fps, preserve a two-second untouched end-card hold, and obtain director approval of both script and revised storyboard.
- **Acceptance evidence:** Approved narration review, corrected master/transcript, revised cue table with integer-frame policy, and explicit director storyboard approval.

## P0-02 — Review MP4 supplied; captions and approved frame package remain missing

- **Severity:** P0
- **Timestamp/frame:** Render package exists; complete cue/transition coverage is missing
- **Criterion:** Inputs/evidence; frame-review gate; technical release gate
- **Score:** 5/10
- **Evidence:** A 1920×1080, 30 fps H.264/AAC MP4 and a five-frame render-decoded re-review set now exist. However, there is still no `.vtt`, approved source-aligned storyboard, complete render-extracted frame manifest, or complete cue/transition evidence. Three sampled states are below 7/10.
- **Required fix:** After P0-01 clears, rebuild the approved HyperFrames composition; provide zero-error lint/validate/inspect output and a spell-checked, synchronized WebVTT; then extract the five-second grid and every narration cue/transition frame from the new render.
- **Acceptance evidence:** Composition source, review MP4, WebVTT, check output, complete frame manifest, contact sheets, computed typography/color inventory, and full-resolution copies of every frame scoring below 7/10.

## 44-gate checklist

### Inputs and evidence

- [x] Article/video slug and review-ticket ID recorded.
- [x] Draft render path recorded and probed.
- [ ] Frames extracted every 5 seconds and at every cue point — snapshots are composition captures, not render extraction, and do not cover every cue.
- [x] Snapshot evidence attached locally — 22 PNGs plus contact sheet.
- [ ] Every representative frame scored; no frame or criterion is below 7/10 — render-decoded 49.0s, 64.0s, and 80.0s remain below threshold.

### Release gates

- [ ] Script gate: director approved narration and beat sheet — P0-01; current master retains rejected wording.
- [ ] Storyboard gate: director approved visual sequence and timing — director decision is `REJECT — REVISE AND RESUBMIT`.
- [ ] Frame-review gate: MP4 evidence is available, but three flagged frames fail and P0-02 remains open.
- [ ] Director sign-off gate: a final-named 1080p render exists, but the visual/source gates remain rejected and no director sign-off is recorded.

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
- [ ] Data motion reveals the insight.
- [ ] Every movement supports narration; no arbitrary motion.
- [ ] Timing matches the beat sheet; clips do not linger after narration moves on.

### Composition — not assessable

- [ ] No critical content in outer 5% title-safe margin.
- [ ] Lower-thirds/captions use the established zone consistently.
- [ ] Logo or episode marker appears in first and last 2 seconds.
- [ ] Background uses Lupine warm paper with subtle grain.

### Audio — source exists, final audiovisual result not assessable

- [ ] Narration intelligible at normal volume in the rendered film.
- [ ] No clipping, breath pops, or sibilance spikes in the rendered film.
- [ ] Background music, if present, sits ≥12 dB below narration.
- [ ] Pace fast but not rushed; breaths between clauses audible.

### Narrative — planned but blocked and not verifiable against frames

- [ ] 90–120 second arc follows Hook → Problem → Mechanism → Evidence → Scale → CTA — planned, but its narration source is rejected.
- [ ] Every visual directly illustrates current narration — no visuals supplied.
- [ ] On-screen jargon has immediate plain-language translation — no frames supplied.
- [ ] CTA clearly links to article or proof pack — no rendered outro supplied.

### Technical

- [x] Render: 1920×1080, 30 fps, H.264/AAC — verified by `ffprobe`.
- [ ] Web encode ≤3 MB/minute — no encode supplied.
- [x] HyperFrames lint/validate/inspect: 0 errors — one lint warning remains for duplicate media discovery risk.
- [ ] WebVTT captions time-synced and spell-checked — no WebVTT supplied.

### Issue handling

- [x] Reject unreadable/static/off-brand/mismatched/unanimated/invalid work — release rejected because upstream approval and visual evidence are absent.
- [x] Log each failure with timestamp/frame, criterion, severity, score, and required fix — P0-01 and P0-02 logged; timestamp is N/A because no render exists.
- [ ] Animator fixed all P0/P1 issues and supplied a new render.
- [ ] Reviewer re-checked flagged frames; each is ≥7/10 or escalated to director.

## Frame score table

| Frame | Time | Score | Result |
|---|---:|---:|---|
| MP4-decoded frame | 49.0s | 4/10 | FAIL — boxed `≈5,000×` covers the chart baseline, curve endpoints, and axis label |
| MP4-decoded frame | 64.0s | 6/10 | FAIL — candidate-card border crosses into `ERROR ± BOUNDED` |
| MP4-decoded frame | 80.0s | 6/10 | FAIL — ammonia route line crosses its label; route cluster remains crowded |
| MP4-decoded frame | 99.2s | 8/10 | PASS — CTA is fully visible, centered, and readable |
| MP4-decoded frame | 100.0s | 8/10 | PASS — settled CTA remains clear and centered |

## Flagged-frame attachments

The latest evidence is decoded from the review MP4 at `from-predicted-crystal-to-commercial-cell/snapshots/re-review-2026-07-10-render/`, with its overview at `contact-sheet.jpg`. P0-02 remains open because captions, approved source alignment, and complete cue/transition extraction are still missing.

## Handoff

Do not begin animation against the current 102.288-second master and do not advance this video to visual-fix, final-render, or director-sign-off stages. Clear P0-01 first, then produce the complete review package required by P0-02 and rerun this 44-gate review. Storyboard intent is not pixel evidence; every extracted frame must score at least 7/10 before the frame-review gate can pass.
