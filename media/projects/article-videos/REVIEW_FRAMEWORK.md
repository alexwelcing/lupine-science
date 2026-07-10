# Video Review Framework — Lupine Science Article Videos

## Philosophy

These videos are not slide decks with voiceover. They are **short films** that turn rigorous research into motion. Every frame must earn its place. If a frame would not pass a Vanity Fair art director or a top-tier tech-publisher motion lead, it does not ship.

## Quality gates

Each video passes through four gates before release:

1. **Script gate** — Director approves the narration and beat sheet.
2. **Storyboard gate** — Director approves the visual sequence and timing.
3. **Frame-review gate** — Reviewer extracts representative frames and scores every criterion below. No frame may be below 7/10.
4. **Director sign-off gate** — Director watches the final 1080p render and approves or rejects with notes.

## Frame-review checklist

### Typography (must pass all)
- [ ] Body text on screen is ≥ 48 px at 1080p.
- [ ] Labels, axes, and data callouts are ≥ 36 px at 1080p.
- [ ] No text is truncated, overlapping, or touching the safe-margin edge.
- [ ] Font stack is Lupine Newsreader + IBM Plex Mono only.
- [ ] Text color passes WCAG AA against its background.

### Imagery (must pass all)
- [ ] Every image is 1920×1080 or higher source, scaled with crisp interpolation.
- [ ] No pixelation, compression artifacts, or blurred vector edges.
- [ ] Charts and diagrams use the Lupine palette (indigo #3d4db3, amber #e8a838, sage #5a8a6e, slate #6b7c8e, rose #c75b5b).
- [ ] Scene illustrations are on-brand: warm paper, indigo accents, scientific-not-decorative, no generic stock look.
- [ ] Each image has a clear focal point and readable hierarchy.

### Motion (must pass all)
- [ ] Every clip has an intentional entrance animation, not a hard cut.
- [ ] Transitions between scenes are consistent and not jarring.
- [ ] Data visuals animate in a way that reveals the insight (bars grow, lines draw, points populate).
- [ ] No motion is arbitrary; every movement supports the narration.
- [ ] Timing matches the beat sheet; no clip lingers after the narrator has moved on.

### Composition (must pass all)
- [ ] Title safe margin respected: no critical content in the outer 5% of the frame.
- [ ] Lower-thirds and captions appear in the same zone across all videos.
- [ ] Logo / episode marker present in the first and last 2 seconds.
- [ ] Background texture matches Lupine warm paper with subtle grain.

### Audio (must pass all)
- [ ] Narration is intelligible at normal playback volume.
- [ ] No clipping, breath pops, or sibilance spikes.
- [ ] Background music, if used, sits at least 12 dB below narration.
- [ ] Pace feels fast but not rushed; breaths between clauses are audible.

### Narrative (must pass all)
- [ ] The 90–120 second arc is: Hook → Problem → Mechanism → Evidence → Scale → CTA.
- [ ] Each visual directly illustrates the current narration line.
- [ ] No jargon appears on screen without an immediate plain-language translation.
- [ ] Call to action is clear and links to the article or proof pack.

### Technical (must pass all)
- [ ] Rendered at 1920×1080, 30 fps, H.264.
- [ ] Final web encode is ≤ 3 MB per minute.
- [ ] HyperFrames lint/validate/inspect passes with 0 errors.
- [ ] Captions file (WebVTT) is time-synced and spell-checked.

## Review process

1. Animator renders a draft and uploads to the shared `renders/` directory.
2. Reviewer runs the frame-extraction script (`scripts/extract-review-frames.sh`) to get one frame every 5 seconds plus every cue point.
3. Reviewer scores each frame against the checklist and attaches flagged frames to the kanban ticket.
4. Animator fixes all P0/P1 issues and re-renders.
5. Reviewer re-checks flagged frames only.
6. Director watches the final render at 100% size with audio; approves or rejects.

## Rejection reasons (non-exhaustive)

- Any frame with unreadable text.
- Any scene that looks like a static slide rather than a designed motion frame.
- Any generic or off-brand illustration.
- Any mismatch between narration and visuals.
- Any clip without an entrance animation.
- Any render that fails HyperFrames validation.
