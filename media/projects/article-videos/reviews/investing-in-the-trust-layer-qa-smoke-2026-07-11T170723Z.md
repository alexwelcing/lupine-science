# Investing in the Trust Layer — live QA smoke

Checked: 2026-07-11T17:07:23Z

## Repository smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260711T170723Z`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- File-signature detection: `text/html`
- Response SHA-256: `7912e68035ce180db10a1606780d25eebc5876b498b36d0c11a0b3ffc99ae943`
- CDN response: `CF-Cache-Status: MISS`
- `ffprobe` rejected the response with `Invalid data found when processing input`

The required video-link contract is not satisfied. The live route returns the site's HTML fallback rather than an MP4, despite HTTP 200 and a cache-busting request.
