# Investing in the Trust Layer — live video QA

Task: `t_b69a5985`
Checked: 2026-07-12T07:13:56Z (UTC)

## Result: FAIL

The site-wide smoke suite passes, but the required MP4 route does not serve an MP4 payload.

## Smoke test

Command: `npm run smoke`
Exit status: 0
Result: PASS — 14 pages and 352 linked resources.

Full output: `smoke.log`

## Exact video URL verification

Request URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T071356Z`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Redirects: `0`
- Download size: `84,245` bytes
- Payload identification: HTML document, UTF-8 text (expected ISO Media / MP4)
- SHA-256: `d0fab3767b687e52271ebd2ed5dab462c6e82e264a2166d7f4be3f891e158182`

The cache-busted request proves the live route is returning the site's HTML fallback with a misleading 200 status rather than the requested video asset. The acceptance criterion is therefore not met.

## Evidence

- `headers.txt` — complete HTTP response headers
- `curl.txt` — curl status, MIME type, byte count, and redirect count
- `response.bin` — downloaded response body
- `file.txt` — payload type inspection
- `sha256.txt` — response checksum
- `url.txt` — exact tested URL
- `timestamp.txt` — UTC test timestamp
- `smoke.log` — smoke-suite output
