# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T03:34:40Z

## Result

BLOCKED / FAIL: the general live smoke suite passes, but the published video URL does not serve an MP4.

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T033440Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document
- `ffprobe`: invalid media (`moov atom not found`)

The 200 response is an HTML fallback rather than the requested MP4, so the task's content-type verification gate fails.

## Evidence

- `smoke.log`: full smoke-test output
- `headers.txt`: HTTP response headers
- `curl.txt`: curl status, content type, size, and effective URL
- `response.html`: returned HTML body (named accurately; it is not an MP4)
- `file.txt`: file-type identification
- `ffprobe.txt`: empty because ffprobe wrote its invalid-media diagnostic to stderr
- `sha256.txt`: checksum of the returned HTML body
