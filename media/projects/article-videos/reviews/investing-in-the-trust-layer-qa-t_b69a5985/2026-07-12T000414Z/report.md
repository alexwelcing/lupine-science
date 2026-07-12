# Investing in the Trust Layer — live QA

Run: 2026-07-12T00:04:14Z
Task: `t_b69a5985`

## Result

**BLOCKED / FAIL** — the general live smoke suite passes, but the requested video URL does not serve an MP4.

## Checks

- `npm run smoke`: PASS (exit 0)
  - 14 pages checked
  - 352 linked resources checked
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4`: HTTP 200
- Response `Content-Type`: `text/html; charset=utf-8` (expected an MP4 media type such as `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document
- `ffprobe`: `Invalid data found when processing input`

The endpoint appears to fall back to an HTML page while retaining HTTP 200, so the video link is not valid despite the smoke suite passing.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit`
- `video-headers.txt`
- `curl-summary.txt`
- `video-response.bin`
- `file.txt`
- `ffprobe.txt`
