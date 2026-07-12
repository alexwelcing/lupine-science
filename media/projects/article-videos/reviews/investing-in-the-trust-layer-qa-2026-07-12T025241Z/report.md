# Investing in the Trust Layer — Production QA

Timestamp: 2026-07-12T02:52:41Z
Result: **FAIL**

## Smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T025241Z`

Expected:

- HTTP 200
- `Content-Type: video/mp4`
- Valid MP4 payload

Actual:

- HTTP 200
- `Content-Type: text/html; charset=utf-8`
- 84,245-byte HTML document
- No redirects
- `ffprobe` exit 1: invalid media data

The endpoint still resolves through the site's HTML fallback instead of serving the MP4. The acceptance criterion is not met despite the general smoke suite passing.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `status.txt`
