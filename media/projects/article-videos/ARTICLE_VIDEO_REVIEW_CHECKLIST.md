# [CHECKLIST] Lupine Science article-video review

Reusable checklist for every article-video frame-review ticket. Each article review is linked to the permanent checklist card; the review is the parent and the checklist is the child so the template never blocks review execution.

Source of truth: `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/REVIEW_FRAMEWORK.md`

## Required inputs and evidence

- [ ] Article/video slug and review-ticket ID recorded.
- [ ] Draft render path or URL recorded.
- [ ] Representative frames extracted every 5 seconds and at every cue point with `scripts/extract-review-frames.sh`.
- [ ] Extracted/flagged frames attached to the article review ticket.
- [ ] Every representative frame scored; no frame or criterion is below 7/10.

## Release gates

- [ ] Script gate — director approved narration and beat sheet.
- [ ] Storyboard gate — director approved visual sequence and timing.
- [ ] Frame-review gate — reviewer completed this checklist and every score is at least 7/10.
- [ ] Director sign-off gate — director watched the final 1080p render and recorded approval or rejection notes.

## Typography — all must pass

- [ ] Body text is at least 48 px at 1080p.
- [ ] Labels, axes, and data callouts are at least 36 px at 1080p.
- [ ] No text is truncated, overlapping, or touching the safe-margin edge.
- [ ] Font stack uses only Lupine Newsreader and IBM Plex Mono.
- [ ] Text color passes WCAG AA against its background.

## Imagery — all must pass

- [ ] Every raster source is 1920×1080 or higher and remains crisp when scaled.
- [ ] No pixelation, compression artifacts, or blurred vector edges.
- [ ] Charts and diagrams use the Lupine palette: indigo `#3d4db3`, amber `#e8a838`, sage `#5a8a6e`, slate `#6b7c8e`, rose `#c75b5b`.
- [ ] Illustrations are on-brand: warm paper, indigo accents, scientific rather than decorative, and not generic stock.
- [ ] Every image has a clear focal point and readable hierarchy.

## Motion — all must pass

- [ ] Every clip has an intentional entrance animation rather than a hard cut.
- [ ] Scene transitions are consistent and not jarring.
- [ ] Data visuals reveal the insight through motion: bars grow, lines draw, or points populate.
- [ ] Every movement supports the narration; no arbitrary motion.
- [ ] Timing matches the beat sheet; clips do not linger after narration moves on.

## Composition — all must pass

- [ ] No critical content appears in the outer 5% title-safe margin.
- [ ] Lower-thirds and captions use the established zone consistently.
- [ ] Logo or episode marker appears within the first and last 2 seconds.
- [ ] Background uses Lupine warm paper with subtle grain.

## Audio — all must pass

- [ ] Narration is intelligible at normal playback volume.
- [ ] No clipping, breath pops, or sibilance spikes.
- [ ] Background music, when present, is at least 12 dB below narration.
- [ ] Pace is fast but not rushed; breaths between clauses remain audible.

## Narrative — all must pass

- [ ] The 90–120 second arc follows Hook → Problem → Mechanism → Evidence → Scale → CTA.
- [ ] Every visual directly illustrates the current narration line.
- [ ] On-screen jargon receives an immediate plain-language translation.
- [ ] CTA is clear and links to the article or proof pack.

## Technical — all must pass

- [ ] Final render is 1920×1080, 30 fps, H.264.
- [ ] Final web encode is no more than 3 MB per minute.
- [ ] HyperFrames lint, validate, and inspect complete with zero errors.
- [ ] The final encode passes the [article-video accessibility requirements](docs/accessibility-requirements.md).
- [ ] Valid English WebVTT captions are attached as a native text track, complete, time-synced, readable, and spell-checked.
- [ ] A semantic-text transcript matches the final cut and describes essential visual-only information.
- [ ] The poster has context-appropriate alt text (or a documented empty alt when truly redundant), and the video link/player has an independent accessible name.

## Issue handling and re-review

- [ ] Any unreadable text, static-slide scene, generic/off-brand illustration, narration/visual mismatch, missing entrance animation, or HyperFrames validation failure is rejected.
- [ ] Every failure is logged on the article review ticket with timestamp/frame, criterion, severity (`P0` or `P1`), score, and required fix.
- [ ] Animator fixed every P0/P1 issue and supplied a new render.
- [ ] Reviewer re-checked all flagged frames and confirmed each is at least 7/10, or escalated remaining failures to the director.

## Review record

- Article/video:
- Article review ticket:
- Draft render:
- Frame evidence:
- HyperFrames check output:
- Caption file/track:
- Transcript URL:
- Poster alt text:
- Reviewer:
- Review date:
- Lowest score:
- P0 count:
- P1 count:
- Decision: `PASS` / `REJECT`
- Director sign-off ticket or note:

Completion rule: mark the article review complete only when every applicable box is checked, all representative frames score at least 7/10, no P0/P1 issue remains open, and director sign-off is recorded.
