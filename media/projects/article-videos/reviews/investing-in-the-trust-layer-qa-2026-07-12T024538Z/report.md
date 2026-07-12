# Investing in the Trust Layer — Live QA

Timestamp: 2026-07-12T02:45:38Z
Result: **FAIL**

## Smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T024538Z`

Expected:

- HTTP 200
- `Content-Type: video/mp4`
- Valid MP4 payload

Actual:

- HTTP 200
- `Content-Type: text/html; charset=utf-8`
- 84,245-byte HTML document
- No redirects
- `ffprobe` rejected the payload as invalid media data

The endpoint still resolves through the site's HTML fallback rather than serving the MP4. The requested acceptance criterion is not met.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `status.txt`
