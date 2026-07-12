# Investing in the Trust Layer — live QA

Timestamp: 2026-07-11T23:59:18Z

## Result

BLOCKED / FAIL: the live video URL returns HTTP 200, but serves the site HTML fallback rather than MP4 media.

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T235918Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: `84,245` bytes
- `file`: HTML document, UTF-8 text
- `ffprobe`: `Invalid data found when processing input`
- SHA-256: `a54929981fbba61ad53098fd47ed61593b21ac3cc46ed41c2d6622c386ef4788`

## Smoke test

`npm run smoke` exited 0:

- 14 pages checked
- 352 linked resources checked
- Script reported all checks passed

This is a false positive for the video acceptance criterion because the smoke test checks linked-resource HTTP success but does not validate media Content-Type or parseability.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `response.bin`
