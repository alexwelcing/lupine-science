# Investing in the Trust Layer — live QA verification

Timestamp: 2026-07-12T06:34:18Z
Task: `t_b69a5985`

## Result: FAIL

- `npm run smoke`: PASS (exit 0; 14 pages and 352 linked resources)
- Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Response content type: `text/html; charset=utf-8` (expected an MP4 video type such as `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document
- `ffprobe`: failed with `moov atom not found` / invalid data

The URL returns the site's HTML fallback with status 200 rather than an MP4 payload. The required video-link verification therefore does not pass despite the general smoke suite passing.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `curl-result.txt`
- `video.mp4` (actual HTML response body retained for evidence)
- `file.txt`
- `ffprobe.txt`
