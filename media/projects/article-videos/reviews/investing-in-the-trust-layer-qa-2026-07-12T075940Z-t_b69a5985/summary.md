# Investing in the Trust Layer — live QA verification

Timestamp: 2026-07-12T07:59:40Z

## Result

FAIL — the site-wide smoke test passes, but the requested video URL does not serve an MP4.

- `npm run smoke`: PASS (14 pages, 352 linked resources)
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T075940Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Redirects: 0
- `file`: HTML document
- `ffprobe`: invalid data

The route is returning the site's HTML fallback with a misleading HTTP 200 rather than the video asset.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `url.txt`
- `timestamp.txt`
