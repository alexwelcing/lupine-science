# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T16:46:17Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured production target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260711T164617Z`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File-signature detection: HTML document
- Response SHA-256: `0a93ed67f2559eef8ee3fd1b499672f34aa58200b75bfbe602cff762477bf9ca`
- `ffprobe`: FAIL (exit 1, invalid media data)
- Cloudflare cache status: `MISS`

## Verdict

The repository smoke suite passes, but the required video-link contract does not. The live route returns the site HTML fallback under HTTP 200 rather than an MP4 response. QA cannot approve this release until the MP4 is deployed at the requested path with `Content-Type: video/mp4`.

## Evidence

- `reviews/investing-in-the-trust-layer-smoke-latest.log`
- `reviews/investing-in-the-trust-layer-video-headers-latest.txt`
