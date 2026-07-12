# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T06:25:48Z
Task: `t_b69a5985`
URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result

**BLOCKED / FAIL:** the live route returns HTTP 200, but it does not serve an MP4.

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- Full GET: HTTP 200.
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`).
- Download size: 84,245 bytes.
- Local MIME detection: `text/html`.
- `ffprobe`: failed with `Invalid data found when processing input`.
- SHA-256: `9d7032112b04408b68346ea9d04c0c5c6721ee34f2b18f5335c099891286b21e`.

The HTTP status requirement passes, but the required content type and media payload do not. The route appears to return the site's HTML fallback rather than the requested video.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-response.bin`
- `curl-result.txt`
- `file-mime.txt`
- `ffprobe.txt`
- `sha256.txt`
