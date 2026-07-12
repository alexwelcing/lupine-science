# Live QA verification: Investing in the Trust Layer

Verified at 2026-07-12T06:19:55Z for kanban task `t_b69a5985`.

## Result

**FAIL — smoke suite passes, but the direct video URL does not serve MP4 content.**

## Smoke suite

Command: `npm run smoke`

Result: PASS

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

Evidence: `smoke.log`

## Direct video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T061955Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: 84,245 bytes
- Detected file type: HTML document
- First bytes: `<!doctype html>`
- `ffprobe` could not identify a valid media container

The request is resolving to the site's HTML fallback rather than the published MP4 asset. The requested 200-status criterion passes, but the required MP4 content-type criterion fails, so the task cannot be accepted yet.

## Evidence

- `curl.txt`
- `video-headers.txt`
- `video-response.bin`
- `file.txt`
- `ffprobe.txt`
- `timestamp.txt`
- `url.txt`
