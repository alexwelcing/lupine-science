# Investing in the Trust Layer — live QA smoke test

Tested: 2026-07-11T23:08:54Z

## Smoke suite

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Exit code: 0

Result:

- PASS: 14 pages and 352 linked resources
- All live smoke checks passed across 1 target.

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T230854Z`

Observed:

- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Download size: 84,245 bytes
- `file`: HTML document, Unicode text, UTF-8 text
- `ffprobe`: Invalid data found when processing input

Expected:

- HTTP status: 200
- Content-Type: `video/mp4`
- Valid MP4 media bytes

## Verdict

FAIL. The live smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not satisfied.
