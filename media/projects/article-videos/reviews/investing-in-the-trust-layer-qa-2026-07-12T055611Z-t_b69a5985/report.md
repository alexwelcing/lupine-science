# Investing in the Trust Layer — QA smoke verification

Run: 2026-07-12 05:56:11 UTC  
Task: `t_b69a5985`  
Target: `https://lupine.science`  
Video: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T055611Z`

## Result: FAIL

- `npm run smoke`: PASS (exit 0) — 14 pages and 352 linked resources; all live smoke checks passed.
- Video HTTP status: PASS — `200`.
- Video content type: FAIL — `text/html; charset=utf-8` (expected `video/mp4`).
- Downloaded payload: FAIL — 84,245 bytes, detected as `text/html`.
- Payload signature: FAIL — begins with `<!doctype html>` rather than an MP4 `ftyp` box.
- `ffprobe`: FAIL — `Invalid data found when processing input`.
- SHA-256: `5d20b1e57be0c76976b0e7e6a47947d571d89aeb2a1f56b5d1150be89b79635f`.

## Relevant response headers

- `HTTP/2 200`
- `content-type: text/html; charset=utf-8`
- `x-content-type-options: nosniff`
- `accept-ranges: bytes`
- `cf-cache-status: MISS`

The generic live smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` currently resolves to the site's HTML fallback instead of an MP4 object. The acceptance criterion is not met; the video must be deployed or the route corrected before QA can pass.
