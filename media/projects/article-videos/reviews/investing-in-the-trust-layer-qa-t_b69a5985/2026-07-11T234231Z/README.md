# Investing in the Trust Layer — production QA

Checked: 2026-07-11 23:42 UTC

## Result

FAIL — the production video URL does not serve an MP4.

## Smoke suite

Command: `npm run smoke`

Result: exit 0; 14 pages and 352 linked resources passed.

## Direct video check

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Response body: Lupine Science homepage HTML
- `ffprobe`: failed with `moov atom not found` / invalid data

A cache-busted request with `Cache-Control: no-cache` produced the same status, Content-Type, and 84,245-byte HTML response.

## Evidence

- `headers.txt` — production response headers
- `curl-summary.txt` — status, Content-Type, size, effective URL
- `cache-bust-summary.txt` — cache-busted verification
- `response.mp4` — returned HTML body (retained with requested filename for forensic evidence)
- `url.txt` — tested URL
