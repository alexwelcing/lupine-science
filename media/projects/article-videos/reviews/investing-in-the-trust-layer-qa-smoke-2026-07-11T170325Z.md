# Investing in the Trust Layer — QA smoke recheck

Checked: 2026-07-11T17:03:25Z

## Repository smoke test

Command: `npm run smoke` (run from the repository root)

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

A cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned:

- HTTP status: `200`
- `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File-signature detection: `text/html`
- SHA-256: `e76477444dda2cee51f83ed6f78766ec589001ac2275c5adb1ed37fad59c96eb`
- `CF-Cache-Status`: `MISS`
- `ffprobe`: rejected the response with `Invalid data found when processing input`

The route still serves the site's HTML fallback rather than the MP4, so the required video-link contract is not satisfied despite the HTTP 200 response.
