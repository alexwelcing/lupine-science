# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T06:39:10Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T063910Z`
Result: FAIL

A cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `c714dbc0b7b2aae6c47a4a16f9c7b90036553a54a3ff27573f4b61479036eb2e`
- `ffprobe`: rejected the response as invalid media
- Cloudflare cache status: `MISS`

The endpoint returns the site's HTML fallback, not an MP4. HTTP 200 alone does not satisfy the required video-link contract.

## Evidence

- `headers.txt` — response headers
- `curl.txt` — curl transfer metadata
- `response.bin` — downloaded response body
- `file.txt` — MIME detection
- `sha256.txt` — response checksum
- `ffprobe.txt` — media validation failure
