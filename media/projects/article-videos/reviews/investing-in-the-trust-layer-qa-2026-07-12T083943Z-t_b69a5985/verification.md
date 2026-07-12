# Investing in the Trust Layer — live QA verification

Timestamp: 2026-07-12T08:39:43Z
Task: `t_b69a5985`
URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: BLOCKED / FAIL

- `npm run smoke`: PASS (14 pages and 352 linked resources)
- Video URL HTTP status: 200
- Response `Content-Type`: `text/html; charset=utf-8` (expected a video MIME type such as `video/mp4`)
- Downloaded response size: 84,245 bytes
- Local MIME detection: `text/html`
- `ffprobe`: FAIL — invalid media data

The path returns the site's HTML fallback with HTTP 200 rather than an MP4. The requested video-link acceptance criterion is therefore not met.

## Evidence

- `npm-run-smoke.log`
- `video-headers.txt`
- `curl-result.txt`
- `file-mime.txt`
- `video-response.bin`
- `ffprobe.txt`
