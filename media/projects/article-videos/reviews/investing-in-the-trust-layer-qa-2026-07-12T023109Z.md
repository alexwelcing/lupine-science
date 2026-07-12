# Investing in the Trust Layer — Production QA

Timestamp: 2026-07-12T02:31:09Z
Result: **FAIL**

## Smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T023109Z`

Expected:

- HTTP 200
- `Content-Type: video/mp4`
- MP4 payload

Actual:

- HTTP 200
- `Content-Type: text/html; charset=utf-8`
- 84,245-byte HTML document
- No redirects
- Cloudflare cache status: MISS
- `ffprobe`: invalid media data

The endpoint resolves through the site's HTML fallback rather than serving the MP4. The acceptance criterion is therefore not met despite the general smoke suite passing.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-12T023109Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-12T023109Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T023109Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T023109Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-12T023109Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T023109Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T023109Z-sha256.txt`
