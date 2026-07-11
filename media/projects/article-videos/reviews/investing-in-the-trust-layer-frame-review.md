# Investing in the Trust Layer — frame review

## Decision: REJECT — no review render; storyboard and validation gates remain open

The HyperFrames composition exists and its current static checks were rerun, but no MP4 review render or WebVTT caption file exists anywhere in the article-video project. Therefore `scripts/extract-review-frames.sh` cannot produce the required five-second and cue-point evidence, no render-decoded representative frame can be truthfully scored, and no flagged render frame can be attached. The director also rejected the storyboard’s timing conformance, and the current `npm run check` exits 1 because strict inspect reports a clipped chart. Release is blocked by two P0 issue groups and one P1 issue group.

## Review record

- Article/video: `investing-in-the-trust-layer`
- Frame-review ticket: `t_2fbaaf60`
- Checklist reference: `t_277bc938`
- Composition: `investing-in-the-trust-layer/index.html`
- Script review: `investing-in-the-trust-layer/director-script-review.md` — approved
- Storyboard review: `investing-in-the-trust-layer/director-storyboard-review.md` — `REJECT — RECONFORM TIMING AND RESUBMIT`
- Draft render: **not supplied; repository-wide MP4 inventory has no matching render**
- Frame evidence: **not supplied; extraction requires an MP4**
- Existing title-component QA: 12 snapshots under `investing-in-the-trust-layer/titles-qa/snapshots/`; these are not a five-second/cue extraction from a review render and are not accepted as frame-review evidence
- HyperFrames check output (fresh rerun): lint 0 errors / 1 warning; validate 0 errors / 0 warnings; strict inspect 0 errors / 1 warning; aggregate `npm run check` exit 1
- Audio master: `audio/final-mix.wav`, 115.368s, 48 kHz stereo PCM; composition duration 117.000s
- Captions: **no WebVTT supplied**
- Reviewer/date: `reviewer` / 2026-07-10
- Representative render frames reviewed: 0
- Lowest score: 0/10 (required render/frame evidence and rejected storyboard gate)
- P0/P1 counts: 2 / 1
- Decision: `REJECT`
- Director sign-off: **storyboard rejected; no final-render approval recorded**

## P0-01 — Storyboard timing is director-rejected

- **Severity:** P0
- **Timestamp/frame:** N/A — upstream production gate
- **Criterion:** Storyboard release gate; timing/caption source integrity
- **Score:** 0/10
- **Evidence:** `director-storyboard-review.md` records `REJECT — RECONFORM TIMING AND RESUBMIT`. The reviewed storyboard ended at 113.000s while the approved audio master is 115.368s, narration activity continues to approximately 114.767s, and only about 0.601s of terminal silence remains instead of the required untouched two-second end-card hold. Although the current composition declares 117.000s, no revised director approval records that its sentence cues, storyboard tables, and final hold were reconformed and accepted.
- **Required fix:** Reconform all seven storyboard beats and phrase cues to the measured master on integer 30 fps frames; update all timing audits and handoff status; preserve at least two seconds of untouched end-card hold after narration; obtain explicit director storyboard approval.
- **Acceptance evidence:** revised storyboard, waveform/word-timestamp-derived cue table, integer-frame policy, timing audit, and director `APPROVED` decision.

## P0-02 — No MP4, complete frame package, or captions

- **Severity:** P0
- **Timestamp/frame:** N/A — no render exists
- **Criterion:** Inputs/evidence; frame-review gate; technical release gate
- **Score:** 0/10
- **Evidence:** The article directory contains composition, audio, transcript, planning, and title-component QA files but no `.mp4` or `.vtt`. The project-wide MP4 inventory contains no artifact matching this slug. `scripts/extract-review-frames.sh` only accepts an MP4, so the required five-second/cue extraction cannot run. Existing `titles-qa` PNGs do not decode the final audiovisual render and cover only 12 selected title states.
- **Required fix:** After P0-01 clears, render a versioned 1920×1080, 30 fps H.264 review MP4; provide a synchronized, spell-checked WebVTT; run `scripts/extract-review-frames.sh` at five-second intervals and every narration/storyboard cue; attach the manifest, contact sheets, and full-resolution copies of every sub-7 frame.
- **Acceptance evidence:** review MP4, WebVTT, complete extraction manifest, five-second and cue-point frames, contact sheets, per-frame scores, and flagged-frame attachments.

## P1-01 — Static source fails typography floor and strict inspect

- **Severity:** P1
- **Timestamp/frame:** source-level; strict inspect first reports 45.0s and persists through 68.0s
- **Criterion:** Labels/axes/data callouts ≥36 px; no clipping; HyperFrames inspect has zero issues
- **Score:** 5/10
- **Evidence:** Fresh `npm run check` exits 1. Strict inspect reports `svg.field-chart` extending 20 px beyond its clipping `article.bay` container at 45.0s, first-seen 45.0s and last-seen 68.0s across five samples. Source CSS also sets production labels below the 36 px floor: `.stage` 24 px, `.bay p` 25 px, `.gate` 26 px, `.wheel-label` 27 px, `.bay h3` 30 px, `.loss` 30 px, `.verified` 34 px, and `.lab` 46 px (pass). Lint separately warns about seven duplicate media discoveries for the repeated logo mark.
- **Required fix:** Raise all label/axis/data-callout typography to at least 36 px at 1080p and rebalance layouts rather than shrinking; resize or reposition the field chart so it remains inside its bay; resolve or explicitly justify duplicate media discovery; rerun lint/validate/strict inspect with zero errors and zero review-relevant warnings.
- **Acceptance evidence:** clean check output, computed typography inventory, and render-decoded frames showing legible labels without clipping.

## 44-gate checklist

### Inputs and evidence

- [x] Article/video slug and review-ticket ID recorded.
- [ ] Draft render path or URL recorded — no draft render supplied.
- [ ] Frames extracted every 5 seconds and at every cue point — impossible without an MP4.
- [ ] Extracted/flagged frames attached — no render-decoded frame exists.
- [ ] Every representative frame scored; no frame or criterion is below 7/10 — zero render frames available; P0/P1 scores are below threshold.

### Release gates

- [x] Script gate: director approved narration and beat sheet (`director-script-review.md`).
- [ ] Storyboard gate: director decision is `REJECT — RECONFORM TIMING AND RESUBMIT`.
- [ ] Frame-review gate: P0-02 prevents extraction and representative-frame scoring.
- [ ] Director sign-off gate: no final 1080p render or approval is recorded.

### Typography

- [ ] Body text ≥48 px at 1080p — not verifiable in a render.
- [ ] Labels, axes, and data callouts ≥36 px — source declares multiple 24–34 px labels.
- [ ] No truncated/overlapping text or text touching safe-margin edge — strict inspect reports a clipped chart; render evidence absent.
- [x] Fonts limited to Lupine Newsreader + IBM Plex Mono — source embeds only Newsreader and Plex brand fonts.
- [x] Text contrast passes WCAG AA — fresh validate reports 0 contrast failures at sampled states.

### Imagery

- [ ] Raster sources ≥1920×1080 and crisp when scaled — final render not assessable.
- [ ] No pixelation, compression artifacts, or blurred vector edges — final render not assessable.
- [x] Charts/diagrams use the approved indigo, amber, sage, slate, and rose palette — source tokens match the canonical values.
- [x] Illustrations use warm paper, indigo accents, scientific-not-decorative styling, and no generic stock look — composition is native vector/data design with canonical paper and grain.
- [ ] Every image has a clear focal point and readable hierarchy — render evidence absent and the three-bay scene contains sub-floor labels.

### Motion

- [x] Every clip has an intentional entrance animation, not a hard cut — source timelines define entrances for every scene.
- [x] Scene transitions are consistent and not jarring — source uses a repeated indigo wipe grammar.
- [x] Data motion reveals the insight — source animates counts, funnel, pipeline, curve, theorem bars, proof decrement, and route.
- [x] Every movement supports narration; no arbitrary motion — motion is tied to the seven planned evidence beats.
- [ ] Timing matches the beat sheet; clips do not linger — storyboard timing remains director-rejected and no audiovisual render verifies sync.

### Composition

- [ ] No critical content in outer 5% title-safe margin — render evidence absent.
- [ ] Lower-thirds/captions use the established zone consistently — no WebVTT or final render exists.
- [x] Logo or episode marker appears in first and last 2 seconds — source includes a 0–4s logo sting and 111–117s outro.
- [x] Background uses Lupine warm paper with subtle grain — source uses `#faf9f6` and an SVG turbulence grain.

### Audio

- [ ] Narration intelligible at normal playback volume in the rendered film — no audiovisual render exists.
- [ ] No clipping, breath pops, or sibilance spikes in the rendered film — no audiovisual render exists.
- [ ] Background music, if present, sits ≥12 dB below narration — mix stems/loudness evidence not supplied for this review.
- [ ] Pace fast but not rushed; breaths between clauses audible — storyboard timing rejected and no audiovisual render exists.

### Narrative

- [x] 90–120 second arc follows Hook → Problem → Mechanism → Evidence → Scale → CTA — the approved script is 300 words and the composition is 117s.
- [ ] Every visual directly illustrates current narration — no render exists to verify audiovisual sync.
- [ ] On-screen jargon has immediate plain-language translation — render evidence absent; multiple labels are below the typography floor.
- [x] CTA clearly links to article or proof pack — source outro names the article and `LUPINE.SCIENCE / TRUST LAYER`; destination still requires final URL verification.

### Technical

- [ ] Render: 1920×1080, 30 fps, H.264 — no MP4 supplied.
- [ ] Web encode ≤3 MB/minute — no web encode supplied.
- [ ] HyperFrames lint/validate/inspect: 0 errors/issues — aggregate check exits 1; strict inspect has one clipping warning and lint has one duplicate-media warning.
- [ ] WebVTT captions time-synced and spell-checked — no `.vtt` exists.

### Issue handling

- [x] Reject unreadable/static/off-brand/mismatched/unanimated/invalid work — release rejected on upstream, evidence, typography, and inspect failures.
- [x] Log each failure with timestamp/frame, criterion, severity, score, and required fix — P0-01, P0-02, and P1-01 logged; N/A is used where no render exists.
- [ ] Animator fixed all P0/P1 issues and supplied a new render.
- [ ] Reviewer re-checked flagged frames; each is ≥7/10 or escalated to director.

## Frame score table

| Frame | Time | Score | Result |
|---|---:|---:|---|
| N/A — no render-decoded frame | N/A | 0/10 | FAIL — required five-second/cue evidence cannot be produced |
| Source strict-inspect state | 45.0–68.0s | 5/10 | FAIL — field chart extends 20 px beyond clipping bay; production labels are below 36 px |

## Flagged-frame attachments

No render frame can be attached because no MP4 exists. The 12 existing `titles-qa/snapshots/` PNGs are component/title QA, not frames decoded from a draft render at the required five-second and cue-point timestamps. Once P0-02 is remedied, copy every extracted frame below 7/10 into a versioned `review-frames/flagged-vN/` directory and attach those full-resolution files to this ticket.

## Handoff

Do not advance this article video to visual-fix closure, final render, or director sign-off. First obtain director approval of the reconformed storyboard, then clear the typography/inspect issue and supply the complete MP4/VTT/frame package. Rerun all 44 gates against render-decoded evidence; every representative frame must score at least 7/10 and no P0/P1 may remain open.
