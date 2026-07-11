# Director final-render review

## Verdict

**REJECT FOR WEB** — visual layout regression in scene 05/07 must be corrected and re-rendered.

Reviewed artifact: `../../renders/the-02-percent-synthesis-problem/final/the-02-percent-synthesis-problem-1080p.mp4`

## Required correction

- **00:65–00:80** — The headline “Lupine adds a correction layer—not a bigger generator.” collides with the top metadata row (“MEASURE → CORRECT → VERIFY” / “LOCAL ENVIRONMENT / PROPER…”). The overlapping text is visibly illegible across the entire scene. Move the headline down, reserve a fixed header band, or reduce the headline block so the two typographic layers never intersect.

## Watch notes

- **00:00–00:05** — Opening fade/field-note reveal is clean.
- **00:05–00:65** — Slides remain readable at 1080p; charts and numeric callouts render consistently.
- **00:65–00:80** — Blocking text collision described above.
- **00:80–00:100** — Climate-math slide is readable and stable.
- **00:100–00:105** — Closing thesis and Lupine Science article CTA render cleanly; the final silent hold is appropriate.

## Technical checks

- 1920×1080, 30 fps, H.264 video.
- AAC stereo, 48 kHz.
- Duration: 105.024 s.
- Full decode completed without media errors.
- Audio peaks at approximately −4.43 dBFS with no NaN/Inf/denormal samples; no unintended >1 s silence before the intentional closing hold at 00:94.862–00:105.024.
- Full-screen VLC playback completed through end of playlist with audio enabled.

Re-render after correcting scene 05/07, then return to the director gate.
