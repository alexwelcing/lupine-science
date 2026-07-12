# Investing in the Trust Layer — live QA verification

- Task: `t_b69a5985`
- Verified: `2026-07-12T07:39:53Z`
- Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T073953Z`

## Smoke suite

Command: `npm run smoke`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

Result: FAIL

- HEAD HTTP status: `200`
- HEAD Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Range request status: `206`
- Range Content-Type: `text/html; charset=utf-8`
- First 16 bytes: `3c 21 64 6f 63 74 79 70 65 20 68 74 6d 6c 3e 0a` (`<!doctype html>\n`)
- `file`: HTML document
- `ffprobe`: Invalid data found when processing input

## Verdict

Acceptance criteria are not met. The URL returns HTTP 200, but it serves the site HTML fallback instead of an MP4 payload and does not return the required video content type.

Raw evidence is stored alongside this report in `media/projects/article-videos/reviews/investing-in-the-trust-layer-qa-2026-07-12T073953Z-t_b69a5985/`.
