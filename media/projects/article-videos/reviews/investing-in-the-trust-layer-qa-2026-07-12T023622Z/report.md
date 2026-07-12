# Investing in the Trust Layer — live QA

Result: **FAIL**

Checked at: 2026-07-12T02:36:22Z

## Smoke test

- Command: `npm run smoke`
- Result: PASS
- Coverage: 14 pages and 352 linked resources

## Video endpoint

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document, not MP4
- `ffprobe`: failed with `moov atom not found` / invalid data

The endpoint returns the site's HTML fallback with status 200 rather than the requested MP4, so the video-link acceptance criterion is not met.

Evidence in this directory: `smoke.log`, `headers.txt`, `curl.txt`, `response.mp4`, `file.txt`, `ffprobe.txt`, `url.txt`, and `stamp.txt`.
