# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T03:52:48Z
Task: t_b69a5985

## Smoke test

Command: `npm run smoke`
Result: PASS

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T035248Z`
HTTP status: 200
Content-Type: `text/html; charset=utf-8`
Downloaded size: 84,245 bytes
Redirects: 0
Detected payload: HTML document
First 16 bytes (hex): `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)

## Verdict

FAIL. The endpoint returns HTTP 200, but it serves the site HTML fallback rather than an MP4. Acceptance requires a video content type (normally `video/mp4`) and an actual MP4 payload.

Evidence files:

- `smoke.log`
- `video-curl.txt`
- `video-headers.txt`
- `video-file.txt`
- `video-signature.txt`
- `video-response.bin`
