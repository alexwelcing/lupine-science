# Investing in the Trust Layer — Live QA

Task: `t_b69a5985`
Timestamp: 2026-07-12T04:08:49Z
Result: **FAIL**

## Smoke test

Command: `npm run smoke`
Result: **PASS** (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T040849Z`

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

The endpoint still resolves to the site's HTML fallback instead of serving the MP4. The smoke suite passes, but the video-link acceptance criterion is not met.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
