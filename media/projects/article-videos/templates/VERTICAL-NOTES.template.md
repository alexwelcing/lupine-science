# <Article title> — vertical adaptation notes

## Source lock

- Article slug: `<slug>`
- Landscape project: `<relative path>`
- Landscape approval/date: `<approval reference>`
- Narration/audio: `<relative path>`
- Duration: `<seconds>`
- FPS: `30`
- Vertical root ID: `<slug>-vertical`
- Destinations: `<Instagram Reels / YouTube Shorts / TikTok / other>`
- Caption mode: `<burned-in / platform-native / none>`
- Vertical reviewer: `<name>`

## Safety contract

- Canvas: 1080×1920
- Technical title-safe: x 54–1026, y 96–1824
- Social content-safe: x 90–900, y 180–1536
- Burned-in caption zone: x 90–900, y 1280–1536
- Platform UI proof captured for: `<destination/device>`

## Scene adaptation table

| Scene | Time | Indispensable claim | Indispensable evidence | Mode | Focal point / crop | Caption or lower-third risk | Status |
|---|---|---|---|---|---|---|---|
| s01 | 00:00–00:00 |  |  | reflow / focus / split / windowed / rebuild chart | n/a or `(0.50, 0.50)` |  | TODO |

## Intentional editorial changes

List any approved copy shortening, beat splitting, cue shift, removed secondary evidence, or platform-specific CTA. “None” is a valid answer.

- None.

## High-risk snapshot plan

| Time (s) | Reason | Expected critical content | Result |
|---:|---|---|---|
|  | end of entrance / peak data / transition / longest copy / crop change / outro |  | TODO |

## Per-scene audit

Duplicate this block for every scene.

### s01 — <scene name>

- [ ] Complete claim is inside x 90–900, y 180–1536.
- [ ] Numbers, units, axes, labels, and source are visible.
- [ ] Meaning does not depend on the old landscape left/right relationship.
- [ ] Right and bottom platform overlays cover no critical content.
- [ ] Captions collide with neither lower thirds nor conclusions.
- [ ] Text remains legible in a phone-size contact sheet.
- [ ] Cropped media retains the narrated subject for the full shot, if applicable.
- [ ] Logo/identity geometry and clear space are intact, if applicable.
- Notes: `<observations and fixes>`

## QA record

- [ ] `npx hyperframes lint --json` — 0 errors
- [ ] `npx hyperframes validate --json` — 0 errors
- [ ] `npx hyperframes inspect --json` — 0 errors
- [ ] Mounted scene midpoints captured
- [ ] High-risk frames captured
- [ ] Full-size snapshot review passed
- [ ] Phone-size contact-sheet review passed
- [ ] Studio review approved before render
- [ ] Master exists and `ffprobe` reports 1080×1920, 30 fps, expected duration
- [ ] Encoded master watched with target-platform UI

Reviewer/date: `<name — YYYY-MM-DD>`
Decision: `<approved / changes requested>`
