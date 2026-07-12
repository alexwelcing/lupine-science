# Investing in the Trust Layer — production QA

Timestamp: 2026-07-12 04:44 UTC
Task: `t_b69a5985`

## Result: BLOCKED / FAIL

- `npm run smoke`: PASS
  - 14 pages checked
  - 352 linked resources checked
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4` (cache-busted): FAIL
  - HTTP status: `200`
  - HTTP `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
  - Detected body MIME type: `text/html`
  - Downloaded body: 84,245 bytes
  - Redirects: 0

The production route falls back to an HTML page instead of serving the MP4. The task acceptance criterion is therefore not met even though the general live smoke suite passes.

## Evidence

- `smoke.log`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file-mime.txt`
- `bytes.txt`
