# Investing in the Trust Layer — live QA verification

Verified: 2026-07-12T03:10:15Z

## Result

FAIL — the site smoke suite passes, but the required direct MP4 route does not serve video content.

## Smoke suite

Command: `npm run smoke` from the Lupine Science repository root.

Result: PASS

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

Evidence: `smoke.log`

## Direct video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T030950Z`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Download size: 84,245 bytes
- Detected file type: HTML document
- First 16 bytes: `3c 21 64 6f 63 74 79 70 65 20 68 74 6d 6c 3e 0a` (`<!doctype html>\n`)
- SHA-256: `7538f760f849ae9991aa306bf479e78138bb18cd7573919ac36b4cfea14d47d8`
- `ffprobe`: invalid media data

The route returns the site HTML fallback with status 200 rather than the MP4 asset, so the acceptance criterion is not met.

Evidence:

- `video-headers.txt`
- `curl-summary.txt`
- `video-response.bin`
- `file.txt`
- `ffprobe.txt`
