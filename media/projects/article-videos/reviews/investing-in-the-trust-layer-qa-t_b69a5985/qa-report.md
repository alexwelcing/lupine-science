# Investing in the Trust Layer — live QA

Verified: 2026-07-12T02:42:39Z

## Smoke test

Command: `npm run smoke`

Result: PASS

- 14 pages checked
- 352 linked resources checked
- 1 live target passed

Evidence: `smoke.log`

## Direct video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T024310Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Detected file type: HTML document
- `ffprobe`: failed with `Invalid data found when processing input`

The route serves the site's HTML fallback rather than an MP4 asset, so the acceptance criteria are not met.

Evidence:

- `curl-result.txt`
- `video-headers.txt`
- `video-response.bin`
- `file-result.txt`
- `ffprobe.txt`
- `ffprobe-error.txt`
