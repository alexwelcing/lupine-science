# Blind calibration packet

Review target: `reel/contact-sheet.png` (frames 01–08, read left-to-right and top-to-bottom).

Use only:

- `../ARTICLE_VIDEO_REVIEW_CHECKLIST.md`
- `../REVIEW_FRAMEWORK.md`
- `../frame.md`
- the visible pixels in the supplied contact sheet

Do not read `reel/expected-decisions.json` before submitting the review.

For each frame, return:

1. `PASS`, `REJECT`, or `HOLD` (`HOLD` only when the still cannot prove a required temporal/audio/technical criterion).
2. Applicable binary criterion failures.
3. Severity (`P0` blocks legibility/correctness/release; `P1` blocks publication quality/brand/motion).
4. An exact rejection or evidence-request sentence that identifies frame, criterion, observed evidence, and required fix.

Rules:

- A visually attractive frame still fails a published numeric floor.
- A still image cannot prove motion, audio, encoding, timing, or validation; request evidence rather than inventing it.
- Judge at 100% 1920×1080 intent even though the contact sheet is scaled for overview.
- Do not average away a hard failure. One must-pass failure means `REJECT`.
