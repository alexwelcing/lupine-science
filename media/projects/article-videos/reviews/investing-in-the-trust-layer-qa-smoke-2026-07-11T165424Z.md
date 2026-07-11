# Investing in the Trust Layer — QA smoke recheck

Checked: 2026-07-11T16:54:24Z

## Repository smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

Smoke output: `reviews/investing-in-the-trust-layer-smoke-current.log`

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a unique cache-busting query string, `Cache-Control: no-cache`, and `Accept: video/mp4`)

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File-signature detection: `text/html`
- Response SHA-256: `79dfeebb6df5b960dce53b627633a2081bf8a5d62559f04dc711e935db81e1a2`
- CDN response: `CF-Cache-Status: MISS`
- `ffprobe`: exit 1, `moov atom not found` / `Invalid data found when processing input`

Response headers: `reviews/investing-in-the-trust-layer-video-headers-current.txt`

## Verdict

The smoke suite passes, but the release criterion does not. The live `/videos/investing-in-the-trust-layer.mp4` route still serves the site's HTML fallback instead of an MP4. Deployment or static-asset routing must be corrected, then the direct URL must be rechecked for both HTTP 200 and `Content-Type: video/mp4` before approval.
