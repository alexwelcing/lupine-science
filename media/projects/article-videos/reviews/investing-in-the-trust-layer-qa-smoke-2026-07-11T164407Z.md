# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T16:44:07Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured production target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260711T164407Z`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File-signature detection: `text/html`
- Response SHA-256: `b0e1fea4983eba91417d36df6591c9b0f87f17f9b0fd94236185d55b45c1a3d0`
- `ffprobe`: FAIL (exit 1, invalid media data)

## Verdict

The repository smoke suite passes, but the required video-link contract does not. The live route returns the site HTML fallback under HTTP 200 rather than an MP4 response. QA cannot approve this release until the MP4 is deployed at the requested path with `Content-Type: video/mp4`.

## Evidence

- `reviews/investing-in-the-trust-layer-smoke-latest.log`
- `reviews/investing-in-the-trust-layer-video-headers-latest.txt`
