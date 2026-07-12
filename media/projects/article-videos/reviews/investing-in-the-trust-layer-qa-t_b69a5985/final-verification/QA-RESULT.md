# Investing in the Trust Layer — live QA verification

Date: 2026-07-11
Task: `t_b69a5985`
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: FAIL

- `npm run smoke`: PASS (`14 pages and 352 linked resources`)
- Video URL HTTP status: `200`
- Video URL `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded response classification: HTML document, not MP4
- Download size: 84,245 bytes

The URL returns the site's HTML fallback with HTTP 200 rather than the requested MP4, so the video-link acceptance criterion is not met.

## Evidence

- `npm-smoke.log`
- `video-headers.txt`
- `video-curl-summary.txt`
- `video-file.txt`
- `exit-codes.txt`
- `video.mp4` (captured response body; despite the filename, this is HTML)
