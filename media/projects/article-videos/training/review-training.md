# Lupine Science article-video review training

Status: calibrated 2026-07-10  
Sources: `../ARTICLE_VIDEO_REVIEW_CHECKLIST.md`, `../REVIEW_FRAMEWORK.md`, `../frame.md`  
Training reel: `reel/contact-sheet.png` and `reel/training-reel.mp4`

Production shadow-review example: `article-1-review/index.html` and `article-1-review/README.md`. This 49-frame Article 1 review demonstrates that polished-looking frames still reject when typography, source resolution, motion construction, identity, narration alignment, encoding, or caption gates fail; use `article-1-review/frame-scores.csv` as the scored answer key.

## 1. Publication rule

These are short research films, not narrated slide decks. Review at 1920×1080 and 100% scale. A frame/clip passes only when every applicable binary test below is YES, every scored criterion is at least 7/10, no P0/P1 remains open, and director sign-off is recorded. Never average away a hard failure.

Decisions:

- `PASS`: every observable applicable test is YES and all required external evidence is present.
- `REJECT`: at least one observable must-pass test is NO.
- `HOLD`: no visible failure is established, but required temporal/audio/technical evidence is missing. HOLD is blocked, not a soft pass.
- `P0`: legibility, factual/correctness, corruption, validation, or release-format blocker.
- `P1`: publication-quality, brand, hierarchy, motion, narrative, or timing blocker.

A still can prove layout, visible type, palette, hierarchy, obvious artifacts, and safety. It cannot prove entrance motion, transitions, narration alignment, audio, encoding, captions, timing, or HyperFrames checks. Ask for the missing evidence; do not infer it.

## 2. Binary test catalogue

### Inputs, evidence, and gates

| ID | Yes/no test | Evidence |
|---|---|---|
| E01 | Are the article/video slug and review-ticket ID written in the review record? | Ticket metadata. |
| E02 | Is an accessible draft-render path or URL recorded? | Open the path/URL. |
| E03 | Were frames extracted every 5 seconds and at every cue point with `scripts/extract-review-frames.sh`? | Extraction log plus timestamped files; both sampling sets must exist. |
| E04 | Are all representative and flagged frames attached or linked on the article review ticket? | Ticket attachments/links match extraction output. |
| E05 | Was every representative frame scored, with no frame and no criterion below 7/10? | Score sheet has no blanks and minimum ≥7. A binary NO still rejects even if an average is ≥7. |
| G01 | Did the director approve narration and beat sheet before animation review? | Dated script-gate approval. |
| G02 | Did the director approve visual sequence and timing before draft render? | Dated storyboard-gate approval. |
| G03 | Did the reviewer finish every applicable test with all scores ≥7/10? | Completed checklist and reviewer decision. |
| G04 | Did the director watch the final 1080p render and record explicit approval? | Sign-off note identifies final render version. |

### Typography

| ID | Yes/no test | How to apply |
|---|---|---|
| T01 | Is every body/caption text style at least 48 px in a 1920×1080 composition? | Inspect computed styles/source tokens; never estimate only from a thumbnail. |
| T02 | Is every label, axis, legend, and data callout at least 36 px? | Inspect each computed style, including tiny provenance/data labels that look decorative. |
| T03 | At first frame, cue points, middle, final-minus-hold, and final frame, is all text fully visible, non-overlapping, and clear of title-safe edges? | Inspect pixels and text boxes at proof times. Any crop, collision, or edge touch is NO. |
| T04 | Are Newsreader and IBM Plex Mono the only font families, loaded from local project assets? | Inspect `@font-face`, computed families, and fallback rendering. A third/system/network font is NO. |
| T05 | Does every text/background pair pass WCAG AA in its actual rendered state? | Use computed colors/contrast report, including text over washes/images. |

### Imagery and visual craft

| ID | Yes/no test | How to apply |
|---|---|---|
| I01 | Is each raster source at least 1920×1080 and never scaled beyond a crisp effective resolution? | Inspect source dimensions and render scale. Vector-only scenes are N/A. |
| I02 | At 100% 1080p, are raster edges, vectors, masks, and gradients free of pixelation, compression blocks, halos, and blur? | Inspect representative/fullscreen pixels, not only source metadata. |
| I03 | Do charts/diagrams use only paper `#faf9f6`, ink `#1a1a1a`, indigo `#3d4db3`, amber `#e8a838`, sage `#5a8a6e`, slate `#6b7c8e`, and rose `#c75b5b`, with paper + ink + indigo + at most one semantic accent per frame? | Audit literals/computed colors and visible output. Unapproved colors require explicit director approval. |
| I04 | Is the illustration warm-paper/indigo, claim-specific, scientific rather than decorative, and free of generic stock/AI-network/atom/neon/flower imagery? | Ask what mechanism/evidence it explains. “Science-looking” without claim-specific meaning is NO. |
| I05 | Is there one dominant focal claim plus a second place for the eye to travel, with readable hierarchy? | Squint test and 2-second scan: identify first and second focal points unambiguously. |

### Motion

| ID | Yes/no test | How to apply |
|---|---|---|
| M01 | Does every scene enter intentionally in 2–4 phases rather than appear by hard cut? | Inspect timeline/keyframes and playback from before scene start. |
| M02 | Do transitions use the approved family consistently—primarily 12-frame indigo-line wipes, related push/crossfade, limited field-line reveals, then paper-fade outro—without jarring roulette? | Count transition types and inspect outgoing/incoming overlap. Pre-transition exit animation is NO. |
| M03 | Does every data visual reveal causal understanding (axis/frame → labels → marks → conclusion; bars grow, lines draw, points populate)? | Watch the reveal muted. If order does not expose the insight, NO. |
| M04 | Can every movement be tied to narration, causality, hierarchy, continuity, or controlled ambient depth? | Name the job of each motion. Arbitrary bounce/drift/decoration is NO. |
| M05 | Do clip starts, proof holds, and handoffs match the approved beat sheet without lingering after narration advances? | Compare timeline timestamps to beat/cue times. Final semantic states must be held long enough to read. |

### Composition and identity

| ID | Yes/no test | How to apply |
|---|---|---|
| C01 | Is every critical text, logo, axis, mark, and data point inside x 96–1824 and y 54–1026? | Overlay the 5% title-safe rectangle. Decorative texture alone may enter action-safe. |
| C02 | Are lower thirds confined to x 96–1824/y 738–972 and captions to x 192–1728/y 828–954, with no collision or competing chart content? | Overlay both zones at every relevant cue. |
| C03 | Is the canonical mark/episode identity visible within the first two seconds and canonical outro mark visible for the final two seconds, with correct proportions and clear space? | Inspect opening/outro timestamps and source asset. |
| C04 | Does every scene use a full-bleed warm-paper child ground with subtle grain and controlled indigo presence rather than a blank field or root-only fill? | Inspect rendered pixels and DOM placement. Solid empty paper, dark mode, or root-only background is NO. |

### Audio

| ID | Yes/no test | How to apply |
|---|---|---|
| A01 | Is narration intelligible at normal playback volume on speakers and headphones? | Listen once without transcript; every word must be recoverable. |
| A02 | Is narration free of clipping, breath pops, and sibilance spikes? | Listen and inspect peaks/waveform at flagged times. Any distracting defect is NO. |
| A03 | When music is present, is it at least 12 dB below narration? | Measure loudness/ducking over representative windows; do not judge only by feel. |
| A04 | Is delivery fast but not rushed, with audible breaths between clauses? | Listen at 1×. If clauses smear or pauses feel mechanically removed, NO. |

### Narrative

| ID | Yes/no test | How to apply |
|---|---|---|
| N01 | Is total duration 90–120 seconds and is the ordered arc Hook → Problem → Mechanism → Evidence → Scale → CTA present? | Map every beat to exactly one arc stage and verify order/duration. |
| N02 | At every cue, does the visible subject directly illustrate the current narration line? | Read/listen line, then state what the frame proves. Merely thematic visuals are NO. |
| N03 | Is every on-screen jargon term immediately translated into plain language in the same beat? | Scan visible specialist terms against narration/copy. Delayed or absent translation is NO. |
| N04 | Is the CTA explicit and does it identify a valid article or proof-pack destination? | Read the final CTA and verify the shown destination. Vague “learn more” alone is NO. |

### Technical

| ID | Yes/no test | How to apply |
|---|---|---|
| X01 | Is the final master exactly 1920×1080, 30 fps, H.264? | Verify with `ffprobe`; all four values must match. |
| X02 | Is the final web encode no larger than 3 MB per minute? | Compute file bytes ÷ duration minutes; result must be ≤3 MB/min. |
| X03 | Do `npx hyperframes lint`, `validate`, and `inspect` each exit successfully with zero errors? | Attach complete command output for the reviewed source revision. Any validation failure is P0. |
| X04 | Does a spell-checked WebVTT exist and remain synchronized throughout playback? | Parse VTT, spell-check text, inspect first/middle/last and every flagged cue. |

### Issue handling, re-review, and completion

| ID | Yes/no test | Evidence |
|---|---|---|
| R01 | Were unreadable text, static-slide composition, generic/off-brand imagery, narration/visual mismatch, missing entrance, and validation failures rejected rather than scored through? | Decision log shows explicit reject/HOLD. |
| R02 | Does every failure record timestamp/frame, criterion ID, P0/P1, score, observed evidence, and required fix? | Each issue is reproducible and actionable. |
| R03 | Did the animator fix every P0/P1 and provide a versioned new render? | Issue-to-render mapping and changed version. |
| R04 | Did the reviewer re-check every flagged frame, confirm ≥7/10 and binary YES, or escalate unresolved failures to the director? | Re-review rows link old issue to new evidence. |
| K01 | Are all applicable tests YES, all representative scores ≥7, zero P0/P1 open, and director sign-off recorded? | Only then may the review ticket be completed. |

## 3. Training reel answer key

Positive exemplars pass still-provable visual criteria; they do not waive motion/audio/technical evidence.

| Frame | Expected | Lesson |
|---|---|---|
| 01 | PASS | Claim/evidence split, explicit synthetic-data caveat, brand, scale, and hierarchy. |
| 02 | PASS | Direct-labelled data field with a dominant series and no legend hunt. |
| 03 | PASS | Claim-specific signal/manifold mechanism instead of science decoration. |
| 04 | REJECT · P1 | Sparse centered heading + bullets is a static slide; wrong type and no evidence object. |
| 05 | REJECT · P0 | 28 px body, headline/callout overlap, unsafe critical label, broken hierarchy. |
| 06 | REJECT · P1 | Dark neon, unapproved cyan/magenta, wrong font, generic AI-node trope. |
| 07 | REJECT · P0 | Polished frame still fails because data/axis labels are 30 px, below the 36 px floor. |
| 08 | HOLD · P1 evidence gate | Still looks compliant but cannot prove entrance, causal draw, transition, narration, or timing. |

Independent blind reviews:

- Reviewer session `20260710_134527_e606be`: 01–03 PASS; 04–07 REJECT with P0/P1 matching key; 08 HOLD.
- Director session `20260710_135117_2a076b`: same decisions, severities, and required fixes.
- Agreement: 8/8 decisions and 5/5 non-pass severities matched. No disagreement remained.
- Resolution rule for future disagreements: published numeric/safety/technical gates win automatically; for qualitative craft, director states the specific criterion and visible evidence, reviewer records the precedent, animator fixes to that explicit bar. Never “split the difference” into a pass.

See `reviewer-review.md` and `director-review.md` for the independent notes.

## 4. Common failure modes and required language

Use this exact structure:

`[FRAME/TIMESTAMP] — REJECT ([P0|P1], [criterion ID]): [observable fact]. Required fix: [specific measurable change]. Re-review evidence: [frame/timeline/audio/command required].`

For missing evidence:

`[FRAME/TIMESTAMP] — HOLD ([criterion ID]): the supplied [still/render/log] cannot prove [requirement]. Supply [specific evidence]. This remains blocked until verified.`

Approved examples:

- Static slide: `00:20 — REJECT (P1, R01/I05): the centered heading and three bullets form a sparse presentation slide with no claim-specific evidence object. Required fix: rebuild around one dominant claim, one evidence visual, and Lupine evidence chrome; show entrance and reveal playback.`
- Overlap/unreadable: `00:35 — REJECT (P0, T01/T03): 28 px body copy overlaps the amber callout. Required fix: rewrite/reflow at ≥48 px with no collision; attach a 100% 1080p frame.`
- Off-brand: `00:50 — REJECT (P1, I03/I04/C04): cyan/magenta nodes on a dark ground violate the locked palette and use a generic AI-network trope. Required fix: use paper/ink/indigo and claim-specific mechanism geometry.`
- Tiny chart labels: `01:05 — REJECT (P0, T02): axis and value labels are 30 px, below the 36 px floor. Required fix: raise all labels to ≥36 px and reflow without overlap.`
- Missing motion proof: `01:20 — HOLD (M01–M05): this still cannot prove entrance, causal reveal, transition continuity, narration alignment, or timing. Supply timeline/keyframe diagnostics and the 1080p scene playback.`
- Validation: `FINAL — REJECT (P0, X03): HyperFrames validate reports an error. Required fix: clear all lint/validate/inspect errors and attach successful output from the reviewed revision.`

Never write “feels off,” “make it pop,” “could be better,” or “looks AI.” Name the criterion, evidence, severity, measurable fix, and re-review proof.

## 5. Feedback loop and authority

1. Director sets the bar: approve script/beat sheet and storyboard; publish any director-only palette exception; define unresolved qualitative precedent.
2. Reviewer enforces it: extract evidence, apply every binary test, reject/HOLD hard failures, and log reproducible notes. Reviewer cannot lower a director-set or published numeric bar.
3. Animator clears it: fix every P0/P1, preserve issue IDs, and provide a versioned render plus requested proof.
4. Reviewer verifies it: re-check flagged frames first, then sample the full render for regressions; escalate only unresolved ambiguity.
5. Director signs off: watch the final 1080p render at 100% with audio and record explicit approval/rejection tied to the final version.
6. Calibration feeds back: add any new resolved disagreement to this guide as a criterion-specific precedent; do not loosen existing gates silently.

A frame never moves directly from animator to release. Director → reviewer → animator → reviewer → director is the minimum closed loop.
