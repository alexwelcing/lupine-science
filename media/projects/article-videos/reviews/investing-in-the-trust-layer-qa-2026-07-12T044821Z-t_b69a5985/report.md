# Investing in the Trust Layer — QA smoke and live video verification

Checked: 2026-07-12T04:48:21Z
Task: `t_b69a5985`

## Repository smoke test: PASS

Command: `npm run smoke`

- Exit code: 0
- Pages checked: 14
- Linked resources checked: 352
- Result: all live smoke checks passed

## Direct video URL contract: FAIL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T044821Z`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

- HTTP status: 200
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- `file` MIME detection: `text/html`
- Cloudflare cache status: `MISS`
- SHA-256: `9520f4305a9a54a355b5a0e67748da09df2d0a7ce1e982c6f26ec817f2c12859`
- `ffprobe`: rejected response as invalid media

The route returns the site's HTML fallback with HTTP 200 rather than an MP4. The required video-link acceptance criterion is not met.

## Evidence

- `smoke.log`
- `curl.txt`
- `video-headers.txt`
- `video-response.bin`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
