# Lupine Science Video Review Playbook

Status: publication gate  
Applies to: every 1920×1080 Lupine Science article video  
Owners: Sol (`animator`) builds and remediates; Fable (`reviewer` and `director`) reviews and signs off.

## Purpose

This is the teachable standard for publication-quality video review. It turns taste into measurable gates without reducing the work to a checklist. A render does not pass because its source compiles, because an animator reports that it looks good, or because most frames are acceptable. It passes only when the durable review package exists, every sampled frame clears the floor, and the reviewer and director record their decisions.

The repository is the source of truth. A kanban comment that names a file that is absent from the reviewed branch is failed evidence.

## Roles and separation of duties

- **Sol / `animator`:** owns HyperFrames implementation, rendering, captions, self-QA, and the complete evidence package. Sol may propose scores but cannot approve Sol's own frame gate.
- **Fable / `reviewer`:** independently inspects the rendered MP4 and evidence, scores every sampled frame, and records PASS or REJECT with timestamped findings.
- **Fable / `director`:** reviews the final candidate silently and with audio, verifies narrative and brand coherence, and gives final APPROVE or REJECT. Director sign-off never replaces frame review.

Required order: animator self-QA → reviewer frame gate → director silent watch → director audio watch → publication approval.

## Non-negotiable visual standards

### Typography

All sizes are computed, visible sizes at 1920×1080—not merely CSS declarations.

- **36 px minimum:** informational labels, axes, legends, data callouts, source/provenance lines, footers, episode markers, and concise annotations.
- **48 px minimum:** body copy, explanatory sentences, claims, CTA copy, and headlines where 48 px is contextually appropriate.
- Headlines should normally be larger than body copy and establish the scene's first read.
- Reflow, shorten, split, or remove copy before shrinking it. No exception is granted because a card is dense.
- Text must remain inside the 5% title-safe boundary with comfortable internal padding.
- No clipping, truncation, rule-through-text, text-on-text overlap, low-contrast ghosting, or text hidden by a wipe, card, diagram, or caption rail.
- Newsreader and IBM Plex Mono are the default Lupine families. Any departure requires director approval.

A single visible text node below the applicable floor is a rejection.

### Focal hierarchy

Each scene and each transition sample must have **one dominant focal element**. A reviewer should be able to answer “what should I look at first?” in under one second.

1. Choose one primary focal element: claim, number, mechanism, specimen, chart change, or CTA.
2. Give supporting material lower contrast, smaller scale, later timing, or greater spatial distance.
3. Do not make two headers, two diagrams, or outgoing and incoming scene systems simultaneously readable.
4. Clear outgoing readable content before incoming readable content becomes dominant.
5. Protect caption, source, and lower-third rails from diagrams, wipes, dividers, and scene-to-scene overlap.
6. Scientific diagrams must explain a mechanism or evidence relationship; repeated generic cards are not a focal strategy.

If two substantive text systems collide or compete, the frame fails even when both are technically legible.

### Cut-point and transition integrity

The renderer may sample any frame. Entrance animation is not permission to publish a weak cut point.

Zero tolerance:

- blank warm-paper, black, or transparent frames;
- identity-only or mark-only frames where substantive content should be present;
- a headline or focal element caught at low opacity at a cue, cut, or review timestamp;
- half-empty transition states, clipped outgoing systems, or partially assembled incoming systems;
- text, data labels, or formulas crossed by wipes, rules, cards, masks, or other graphics;
- a scene whose only visible content is residual chrome after its meaning has disappeared.

The canonical Lupine mark or episode marker must be intentionally visible at the opening, including t=0 and t=0.1, without making those frames identity-only. The final end card must hold as specified by the approved timing plan; when a two-second untouched hold is required, it means 60 byte-stable frames at 30 fps with all motion stopped.

A zero-tolerance defect is an immediate rejection and caps that frame at 6/10.

## Required review package

The package must be committed to the reviewed branch under the article-video project. A reviewer verifies existence and reads the files; a handoff comment alone is not evidence.

### 1. Versioned review master

- 1920×1080, 30 fps, H.264 video; synchronized production audio where applicable.
- Filename includes a version, for example `renders/<slug>-v3-review-1080p.mp4`.
- Record duration, frame count, codecs, file size, and SHA-256.
- Decode the full stream before handoff.

### 2. Zero-finding HyperFrames evidence

Capture command output from the exact reviewed source and retain it in `evidence/`:

- `npx hyperframes lint`
- `npx hyperframes validate`
- `npx hyperframes inspect --strict`
- Prefer the project-level `npm run check` when it executes all three.

Publication requires **0 errors and 0 warnings/findings**. Stale logs, logs generated before the final source edit, and summaries that contradict raw output fail the gate.

### 3. Thirty-seven-frame review set

Provide at least **37 full-resolution frames decoded from the candidate MP4**. Thirty-seven is the baseline, not a cap.

Build the set from:

- t=0 and t=0.1;
- the five-second cadence across the full duration;
- every narration cue boundary;
- before/during/after each scene transition;
- all known defect timestamps and one bracketing frame on each side;
- the final hold start, midpoint, and final frame.

Deduplicate identical timestamps, then retain the 37 highest-risk samples. If the five-second cadence plus mandatory cue/transition/defect samples exceeds 37, include all of them. Never omit an exact rejected timestamp in favor of nearby frames.

Store a machine-readable manifest with timestamp, frame number, source-master SHA-256, reason sampled, and filename.

### 4. Contact sheets and flagged frames

- Create legible contact sheets with timestamp labels; do not downscale so far that typography cannot be judged.
- Keep full-resolution originals for every contact-sheet tile.
- Copy every frame scoring below 7/10 into `review-frames/below-7/`.
- A `README` saying “none below 7” is valid only when the reviewer scorecard independently confirms it.

### 5. WebVTT and spelling evidence

- Commit synchronized `.vtt` captions for the exact review master.
- Verify monotonic cue ordering, non-overlap, valid timestamps, and final-cue timing.
- Run a spell-check over caption text and record the command, dictionary exceptions, and result.
- Check scientific notation, subscripts rendered as text, units, proper nouns, and article terminology manually.
- Captions must not cover the focal element, source rail, or lower-third content.

### 6. Frame scorecard

The reviewer records one row per sampled frame with timestamp, scene/cue, ten binary criteria, total, verdict, and note. Use these criteria:

1. Typography meets 36/48 px floors.
2. All text/data is legible, unclipped, and unobscured.
3. One dominant focal element is immediately clear.
4. Composition and safe margins are balanced.
5. Contrast and Lupine palette pass.
6. Scientific illustration is specific and supports the claim.
7. Motion/entrance state is complete enough for the sampled moment.
8. Transition state has no outgoing/incoming collision.
9. Visual meaning matches the current narration/caption cue.
10. Frame is technically clean: no blank state, artifact, duplicate identity, or render defect.

Scoring:

- **9–10:** publication quality;
- **8:** strong, only non-blocking polish remains;
- **7:** acceptable floor, clear and intentional;
- **0–6:** reject and remediate.

Every criterion is worth one point. Any zero-tolerance defect forces REJECT even if the arithmetic total would otherwise reach 7. **Every sampled frame must score at least 7/10.** Average score never rescues a failed frame.

## Review clinic: how to diagnose a failed frame

Use this five-minute loop in animator/reviewer clinics:

1. **Name the first read.** If two answers are equally plausible, hierarchy has failed.
2. **Mute motion mentally.** Judge the sampled frame as a published still; it must stand on its own.
3. **Trace collision paths.** Check headline, diagram, source rail, captions, dividers, and wipes—not just bounding boxes in the settled scene.
4. **Read at full frame.** Confirm computed type sizes and actual legibility at 100% 1080p.
5. **Prescribe one measurable change.** Example: “Outgoing claim reaches opacity 0 by F1830; incoming header may not exceed opacity 0.15 before F1831.”
6. **Name proof of closure.** Require the exact failed timestamp, bracketing frames, updated score, and fresh zero-finding check output.

Bad feedback: “Make the transition cleaner.”  
Good feedback: “At 61.612s both scene headers are readable. Fade the outgoing header to 0 before the incoming header exceeds 0.15; submit 61.4/61.612/61.8s decoded frames, each with one dominant focal system and ≥7/10.”

## Gate procedure

### Animator handoff

Sol submits:

- source and versioned MP4 committed on the reviewed branch;
- raw lint/validate/strict-inspect output with zero findings;
- MP4 metadata, SHA-256, and full-decode result;
- synchronized spell-checked WebVTT;
- 37+ frame manifest, full-resolution frames, and contact sheets;
- animator self-scorecard and all below-7 frames.

Before accepting the handoff, verify every named path exists on the reviewed branch. Missing artifacts return directly to Sol; they do not enter visual review.

### Reviewer gate

Fable independently:

1. verifies master hash and evidence freshness;
2. inspects all 37+ full-resolution frames;
3. scores every frame using the ten criteria;
4. checks all exact prior-failure timestamps;
5. records PASS only when every frame is ≥7/10 and no zero-tolerance defect exists.

A re-review checks fixed timestamps and then scans the complete set for regressions. It is not limited to the animator's selected “good” frames.

### Director gate

After reviewer PASS, Fable as director performs two uninterrupted watches at 100% size:

1. **Silent watch:** hierarchy, pacing, scene comprehension, transitions, brand, and CTA.
2. **Audio watch:** narration sync, caption sync, semantic alignment, mix, timing, terminal hold, and overall arc.

The director records APPROVE or timestamped REJECT notes. No asset is “final” without this decision.

## Rejection and re-entry

A rejected animator card remains blocked until its acceptance criteria name:

- exact source/render paths that must exist;
- exact timestamps or frame ranges to repair;
- measurable typography/hierarchy/timing requirements;
- exact commands and zero-finding expectations;
- required review artifacts and the reviewer who must approve them.

A card may return to `ready` only after those criteria are present and the required input assets are confirmed accessible. “Try again,” “improve quality,” and unverifiable artifact claims are not passing review plans.

## Publication checklist

- [ ] Candidate source, review MP4, VTT, and evidence exist on the reviewed branch.
- [ ] Review MP4 metadata/hash/full decode verified.
- [ ] HyperFrames lint/validate/strict inspect: 0 errors, 0 warnings/findings.
- [ ] 37+ decoded frames include cadence, cues, transitions, cut points, prior defects, and final hold.
- [ ] Contact sheets and full-resolution originals exist.
- [ ] WebVTT timing and spelling checks pass.
- [ ] Every frame is scored; none is below 7/10.
- [ ] No blank, identity-only, low-opacity focal, collision, clipping, or focal-hierarchy defect exists.
- [ ] Reviewer PASS is recorded.
- [ ] Director silent and audio watches are recorded.
- [ ] Director APPROVE is recorded before publication.

## Encode settings for publication renders

The committed `public/videos/<slug>.mp4` files are the canonical publication masters. Encode new renders with these settings so they pass `npm run review:videos` without technical notes.

### Video

- **Container:** MP4 (`.mp4`).
- **Codec:** H.264 / AVC (`libx264` or hardware equivalent).
- **Resolution:** 1920×1080 square pixels.
- **Frame rate:** 30 fps constant (`-r 30`).
- **Pixel format:** `yuv420p` for broad compatibility.
- **Color range:** TV (limited) range preferred; tag `bt709` color primaries/transfer/matrix.
- **Target bitrate:** 4–6 Mbps for 1080p30 talking-head / motion-graphic content.
  - Use CQ/CRF 20–23 (`-crf 21 -preset slow`) for offline encodes.
  - For two-pass or CBR delivery, target **5 Mbps** with a **6 Mbps** max rate and **12 Mbps** buffer (`-b:v 5M -maxrate 6M -bufsize 12M`).
- **GOP:** closed-GOP, keyframe interval 2 seconds (`-g 60 -keyint_min 60`).
- **Profile/level:** High@L4.0 or Main@L4.0.

### Audio

- **Codec:** AAC-LC (`libfdk_aac` or `aac`).
- **Sample rate:** 44.1 kHz.
- **Channels:** mono (1.0) for narration-first videos; stereo only when music/sfx are integral.
- **Bitrate:** 128 kbps mono, 192 kbps stereo.
- **Loudness target:** -16 LUFS integrated, ±2 LUFS tolerance.
- **Loudness range (LRA):** ≤ 8 LU.
- **True peak:** ≤ -1 dBTP.

### Captions

- **Format:** WebVTT (`.vtt`) alongside the MP4.
- **Encoding:** UTF-8, no BOM.
- **Timing:** monotonic, non-overlapping cues; final cue ends within video duration.
- **Voice:** a calm, professional, technically credible narrator; avoid high-pitched or synthetic-sounding voices.

### ffmpeg example (single pass)

```bash
ffmpeg -i source.mov \
  -c:v libx264 -crf 21 -preset slow -r 30 -s 1920x1080 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -g 60 -keyint_min 60 \
  -c:a aac -ar 44100 -ac 1 -b:a 128k \
  -af "loudnorm=I=-16:LRA=8:TP=-1" \
  public/videos/<slug>.mp4
```

### 720p fallback

For pages that need a lighter mobile variant, also produce a 1280×720 fallback at 2.5–3.5 Mbps using the same codec and loudness target. Name it `<slug>-720p.mp4` and reference it from the article `<video>` as a second `<source>` before the 1080p master.

### Poster frame

- Generate a clean 1920×1080 JPG with `scripts/build-video-posters.mjs`.
- The background must contain no visible text, labels, numbers, or symbols.
- The only allowed typography is the Sharp/SVG overlay added by the build script.
- The reviewer OCRs the poster; any high-confidence gibberish in the background is a P0 rejection.

### Quality gate

Run `npm run review:videos -- --min-score 85` locally before pushing. The CI gate runs the same command and fails on P0 defects or an average score below 85.
