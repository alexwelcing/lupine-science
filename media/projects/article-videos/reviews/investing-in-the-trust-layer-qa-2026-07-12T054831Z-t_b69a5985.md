# Investing in the Trust Layer — live QA smoke verification

Run: 2026-07-12 05:48:31 UTC
Task: `t_b69a5985`
Target: `https://lupine.science`
Video: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T054831Z`

## Result: FAIL

- `npm run smoke`: PASS (exit 0) — 14 pages and 352 linked resources; all live smoke checks passed.
- Video HTTP status: PASS — `200`.
- Video content type: FAIL — `text/html; charset=utf-8` (expected `video/mp4`).
- Downloaded payload: FAIL — 84,245 bytes, detected by `file` as `text/html`.
- Payload signature: FAIL — begins with `<!doctype html>` rather than an MP4 `ftyp` box.
- `ffprobe`: FAIL — `Invalid data found when processing input`.

## Relevant response headers

- `HTTP/2 200`
- `content-type: text/html; charset=utf-8`
- `x-content-type-options: nosniff`
- `accept-ranges: bytes`
- `cf-cache-status: MISS`

The generic live smoke suite passes, but the required video-link acceptance criterion does not. The `/videos/investing-in-the-trust-layer.mp4` route currently serves the site's HTML fallback instead of an MP4 object and must be fixed/deployed before this QA task can pass.
