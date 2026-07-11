# Critical Minerals, PFAS, and the Remediation Imperative — frame review

## Decision: REJECT — script approval withheld and no reviewable composition/render

The requested five-second and cue-point frame extraction cannot be performed. The article directory contains narration/audio/transcript assets, but no approved storyboard or cue manifest, HyperFrames composition, review MP4, extracted frame set, check output, final WebVTT package, poster/accessibility record, or director final sign-off.

The director’s script review explicitly says **REVISIONS REQUESTED** and withholds approval for a P0 factual-precision issue and P1 timing mismatch. Although a 112.392-second final audio mix exists, audio alone is not composition evidence and cannot support visual scoring. Release is blocked by two P0 issue groups; no render-derived frame can be truthfully scored or attached.

## Review record

- Article/video: `critical-minerals-pfas-and-the-remediation-imperative`
- Frame-review ticket: `t_6ce91350`
- Checklist reference: `t_277bc938`
- Draft render: **not supplied**
- Frame evidence: **none; extraction impossible without a render**
- HyperFrames check output: **not supplied; no composition exists for this slug**
- Caption file/track: raw narration VTT exists, but no final video WebVTT/native track is supplied
- Transcript: article-local transcript assets exist, but no final-cut semantic transcript approval is recorded
- Poster alt text: **not supplied**
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
- **Evidence:** `director-script-review.md` records `Decision: REVISIONS REQUESTED`; approval is withheld for the unqualified four-nanogram PFAS claim and beat timing mismatch. `narration-script.md` still contains “capture molecules at just four nanograms per liter” and the original 0:00–1:45 beat windows. No storyboard or director storyboard approval exists in the article directory.
- **Required fix:** Incorporate the requested PFOA/PFOS qualification, rebalance beat timing to the approved narration master, obtain explicit director script approval, then create and obtain approval for a frame-conformed storyboard/cue manifest.
- **Acceptance evidence:** Updated script, explicit director script approval, approved storyboard review, and cue timestamps aligned to the approved narration master.

## P0-02 — Composition, render, final captions, and frame evidence are absent

- **Severity:** P0
- **Timestamp/frame:** N/A — no MP4 exists to decode
- **Criterion:** Inputs/evidence; frame-review gate; technical release gate
- **Score:** 0/10
- **Evidence:** Repository inventory found no article-specific HyperFrames HTML/composition, MP4/WebM/MOV, review-frame directory, contact sheet, cue manifest, or lint/validate/inspect output. A raw narration VTT and a 112.392-second audio mix are present, but neither is a final video caption package or visual evidence.
- **Required fix:** Build the approved composition; run HyperFrames lint/validate/inspect with zero errors; render a 1920×1080, 30 fps H.264 review MP4; supply final synchronized captions, semantic transcript, poster/accessibility record, and cue manifest; run `scripts/extract-review-frames.sh` at every five-second interval and every cue point; attach every frame scoring below 7/10.
- **Acceptance evidence:** Composition source, zero-error check logs, review MP4, final WebVTT/native track, semantic transcript, poster alt record, cue manifest, complete frame manifest/contact sheets, and full-resolution copies of every failing frame.

## 44-gate checklist

### Inputs and evidence

- [x] Article/video slug and review-ticket ID recorded.
- [ ] Draft render path or URL recorded — no render supplied.
- [ ] Frames extracted every 5 seconds and at every cue point — impossible without a render and approved cue manifest.
- [ ] Extracted/flagged frames attached to the article review ticket — no render-derived frames exist.
- [ ] Every representative frame scored; no frame or criterion is below 7/10 — zero render frames are available.

### Release gates

- [ ] Script gate: director approved narration and beat sheet — revisions requested; approval explicitly withheld.
- [ ] Storyboard gate: director approved visual sequence and timing — no storyboard or approval supplied.
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

### Audio — final-film assessment unavailable

- [ ] Narration intelligible at normal playback volume — audio asset exists, but no final audiovisual playback was supplied.
- [ ] No clipping, breath pops, or sibilance spikes — probe reports -4.18 dBTP, but subjective final-film review remains unavailable.
- [ ] Background music, if present, sits ≥12 dB below narration — no stem/ducking evidence or final video supplied.
- [ ] Pace fast but not rushed; breaths between clauses audible — director rejected beat timing and no final film exists.

### Narrative

- [ ] 90–120 second arc follows Hook → Problem → Mechanism → Evidence → Scale → CTA — duration is in range, but the director withheld script approval.
- [ ] Every visual directly illustrates current narration — no rendered visuals exist.
- [ ] On-screen jargon has immediate plain-language translation — no frames exist.
- [ ] CTA clearly links to article or proof pack — planned in script only; no rendered CTA exists.

### Technical

- [ ] Render: 1920×1080, 30 fps, H.264 — no render supplied.
- [ ] Web encode ≤3 MB/minute — no web encode supplied.
- [ ] HyperFrames lint/validate/inspect: 0 errors — no composition or check output supplied.
- [ ] WebVTT captions time-synced and spell-checked — only a raw narration VTT exists; no final video caption package supplied.

### Issue handling

- [x] Reject unreadable text, static-slide scenes, generic/off-brand imagery, narration/visual mismatches, missing entrance animations, or failed HyperFrames validation — release rejected because mandatory evidence and approvals are absent.
- [x] Log each failure with timestamp/frame, criterion, severity, score, and required fix — P0-01 and P0-02 are logged; timestamp is N/A because no render exists.
- [ ] Animator fixed all P0/P1 issues and supplied a new render.
- [ ] Reviewer re-checked flagged frames; each is ≥7/10 or escalated to director.

## Frame score table

No frame score rows can be produced. There is no MP4 to decode, no approved cue manifest, and no composition snapshot package. The gate score is **0/10** for missing required evidence, not a visual score assigned to an unseen frame.

## Flagged-frame attachments

None. No render-derived frames exist. After both P0 groups clear, run five-second plus cue-point extraction and copy every frame scoring below 7/10 into the article’s persistent review-frame directory.

## Additional evidence

The existing final-mix WAV probes as 112.392 seconds, stereo PCM 24-bit/48 kHz, approximately -16.05 LUFS integrated and -4.18 dBTP. These are useful production facts but do not replace final audiovisual review, stem-level music/narration balance evidence, captions, frames, or director sign-off.

## Handoff

Do not advance this article-video to visual-fix, final-render, compression, or director-sign-off stages. First clear director script revisions and storyboard approval, then build and validate the composition and provide the complete MP4/VTT/cue/accessibility package. Re-run all 44 gates and score every extracted representative frame; the frame-review gate may pass only when every applicable gate and frame is at least 7/10, no P0/P1 remains open, and director sign-off is recorded.

## Flagged-frame re-review — 2026-07-10

**Visual-fix result: PASS for all eight supplied flagged render frames. Overall release remains ESCALATED to director.**

The animator supplied eight 1920×1080 snapshots after the original review. Full-resolution inspection found no clipped or overlapping text, no unsafe-edge content, no off-brand imagery, and no unreadable primary copy. The sparse states at 49.3s and 66.2s are intentional in-progress data reveals rather than broken layouts; both retain a complete editorial frame and readable context.

| Frame | Score | Re-review finding |
|---|---:|---|
| `snapshots/frame-00-at-49.3s.png` | 7/10 | Early screening-chart reveal is deliberately sparse; headline, explanation, labels, frame, and source remain readable and stable. |
| `snapshots/frame-01-at-59.9s.png` | 9/10 | Complete 6–23% error state; clear hierarchy, crisp graph, and no clipping. |
| `snapshots/frame-02-at-60.8s.png` | 9/10 | Complete 15–60% evidence state; callout and comparison curves remain clear. |
| `snapshots/frame-03-at-66.2s.png` | 7/10 | Early local-correction reveal is intentional; all narrative copy and controls are readable, with no collision. |
| `snapshots/frame-04-at-66.7s.png` | 8/10 | First coordination marker enters cleanly; diagram, labels, and copy remain legible. |
| `snapshots/frame-05-at-66.9s.png` | 8/10 | Additional markers preserve spacing and hierarchy; no overlap or edge issue. |
| `snapshots/frame-06-at-67.5s.png` | 9/10 | Completed corrected-neighborhood state is balanced, crisp, and fully readable. |
| `snapshots/frame-07-at-109.0s.png` | 9/10 | Outro/CTA is centered, branded, unclipped, and held within safe margins. |

Lowest supplied flagged-frame score: **7/10**. Flagged-frame visual threshold: **PASS (8/8)**.

The kinetic-title evidence at 1.8s also passes at 8/10. Its 109.0s standalone capture is intentionally transparent because that overlay has no active title/lower-third at that timestamp; it is not a film frame and is therefore not assigned a visual score. The corresponding composed film frame at 109.0s is the 9/10 outro above.

Fresh verification: `npm run check` passes HyperFrames lint, validate, and strict inspect with zero errors, zero contrast failures, and zero inspect issues. Lint reports one non-blocking duplicate-media-discovery warning for repeated brand-mark image nodes.

### Remaining director escalation

The supplied visual fixes close the flagged-frame defects, but they do not clear the release gate. `director-script-review.md` and `director-storyboard-review.md` still record **REVISIONS REQUESTED**: the mastered narration retains the overbroad four-ng/L PFAS claim; storyboard transition-count/overlap math and outro fade/hold timing remain unresolved. No final review MP4, final caption/accessibility package, or director final sign-off was supplied. Director must confirm those corrections and review the final audiovisual render before overall release can pass.
