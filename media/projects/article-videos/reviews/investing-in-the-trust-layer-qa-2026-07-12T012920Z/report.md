# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T01:29:20Z

## Result: FAIL

`npm run smoke` passed against `https://lupine.science`: 14 pages and 352 linked resources.

The required video URL does not serve an MP4:

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Expected Content-Type: `video/mp4`
- Actual Content-Type: `text/html; charset=utf-8`
- Payload size: 84,245 bytes
- Payload begins with `<!doctype html>`
- `ffprobe` fails with `moov atom not found` / invalid data

This appears to be the site's HTML fallback responding for a missing or unpublished video asset. The task cannot be approved until the URL returns status 200 with `Content-Type: video/mp4` and a valid MP4 payload.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `video.mp4` (actual HTML response retained as received)
- `ffprobe.txt`
- `verification.txt`
