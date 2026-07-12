# Live QA verification: Investing in the Trust Layer

Verified at 2026-07-12T03:30:35Z.

## Smoke suite

Command: `npm run smoke`

Result: PASS — 14 pages and 352 linked resources; all live smoke checks passed.

Evidence: `qa-smoke.log`

## Direct video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T033035Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: 84,245 bytes
- File signature: HTML document
- First 16 bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)

The route is still returning the site HTML fallback rather than the MP4 asset. The HTTP-status criterion passes, but the required content type does not; overall acceptance criteria are not met.

Evidence:

- `qa-video-curl.txt`
- `qa-video-headers.txt`
- `qa-video-response.bin`
