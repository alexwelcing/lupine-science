# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T03:24:22Z
Result: FAIL

## Smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T032422Z`

Expected:

- HTTP 200
- `Content-Type: video/mp4`
- Valid MP4 payload

Actual:

- HTTP 200
- `Content-Type: text/html; charset=utf-8`
- 84,245-byte HTML document
- No redirects
- Cloudflare cache status: MISS
- `ffprobe`: invalid media data

The video URL is still resolving to the site's HTML fallback rather than an MP4, so the acceptance criterion is not met.

## Evidence

- `smoke.log`
- `smoke-status.txt`
- `headers.txt`
- `curl.txt`
- `curl.stderr`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `ffprobe.stderr`
- `sha256.txt`
