# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T01:48:45Z UTC
Task: `t_b69a5985`

## Result

BLOCKED / FAIL: the general live smoke suite passes, but the required video URL does not serve an MP4.

## Checks

- `npm run smoke`: PASS (exit 0; 14 pages and 352 linked resources)
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T014845Z`: HTTP 200
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: 84,245
- `file`: HTML document
- `ffprobe`: exit 1 (not valid media)
- Redirects: 0

The 200 response is the site's HTML fallback, not the requested video. The current smoke implementation checks linked-resource HTTP success but does not validate media content types, so its PASS does not satisfy the task's video verification criterion.

## Evidence

- `smoke.log`
- `smoke-exit.txt`
- `curl-summary.txt`
- `video-headers.txt`
- `video-response.bin`
- `file-type.txt`
- `ffprobe.txt`
