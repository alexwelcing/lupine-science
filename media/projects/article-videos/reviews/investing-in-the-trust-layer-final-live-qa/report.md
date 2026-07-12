# Investing in the Trust Layer — live QA

Checked: 2026-07-11T20:33:35Z

## Result: BLOCKED

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document, not MP4
- `ffprobe`: failed with `moov atom not found` / invalid data
- SHA-256 of response: `881ac573d5bde2d73bac6ff56bb1feecc226d31548ea82a47d07a839c1e6f099`

The route currently returns the site HTML fallback with status 200 rather than the published video asset. The video-link acceptance criterion is not met.

## Evidence

- `headers.txt`
- `curl-summary.txt`
- `response.mp4` (the HTML fallback response, retained as evidence)
- `ffprobe.txt`
- `sha256.txt`
