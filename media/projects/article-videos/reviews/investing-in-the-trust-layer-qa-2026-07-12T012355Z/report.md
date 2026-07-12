# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12 01:23:55 UTC

## Result: BLOCKED / FAIL

- `npm run smoke`: PASS — 14 pages and 352 linked resources checked.
- Requested video URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T012355Z`
- HTTP status: `200`
- HTTP `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded payload MIME type: `text/html`
- Download size: 84,245 bytes
- Redirects: 0
- `ffprobe`: FAIL — invalid media data.

The endpoint resolves to the site HTML fallback rather than an MP4 asset. The task acceptance criterion is therefore not met despite the broad smoke test passing.

## Evidence

- `smoke.txt` — complete smoke-test output
- `headers.txt` — HTTP response headers
- `curl.txt` — curl status/MIME/size summary
- `response.bin` — downloaded response body
- `file-mime.txt` — payload MIME identification
- `ffprobe.txt` — media validation failure
