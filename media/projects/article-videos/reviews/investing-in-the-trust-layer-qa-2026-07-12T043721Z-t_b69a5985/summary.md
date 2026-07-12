# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T04:37:21Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across 1 target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting request result: HTTP 200
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: 84,245
- Detected MIME type: `text/html`
- SHA-256: `2c3640f50cabdaa0445bbf3203c359fa4726c0abce2cbd1eed73dc39fc7a070e`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

## Verdict

BLOCKED. The smoke suite passes, but the live `/videos/investing-in-the-trust-layer.mp4` route serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video contract.

Raw evidence is stored alongside this report: `smoke.log`, `smoke-exit-code.txt`, `headers.txt`, `curl.txt`, `curl-exit-code.txt`, `response.bin`, `file.txt`, `sha256.txt`, `ffprobe.txt`, `ffprobe-exit-code.txt`, `stamp.txt`, and `url.txt`.
