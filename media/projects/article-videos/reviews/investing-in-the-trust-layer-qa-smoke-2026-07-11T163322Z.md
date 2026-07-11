# Investing in the Trust Layer — QA smoke recheck

Checked: 2026-07-11T16:33:22Z

## Repository smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- File-signature detection: `text/html`
- Response SHA-256: `f2ab3034312e2362f229acb4e071407562a8d4ea71c483e09f0edd5369dfd19c`
- `ffprobe` result: exit 1, `moov atom not found` / `Invalid data found when processing input`

The request used a unique cache-busting query parameter plus `Cache-Control: no-cache` and `Accept: video/mp4`. The live route still serves the site's HTML fallback rather than an MP4, so the required video-link contract is not satisfied.

Current response headers are saved in `reviews/investing-in-the-trust-layer-video-headers-latest.txt`.
