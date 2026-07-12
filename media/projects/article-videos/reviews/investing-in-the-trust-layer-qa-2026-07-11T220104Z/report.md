# Investing in the Trust Layer — QA smoke and video-link verification

Checked: 2026-07-11T22:01:04Z

## Result: BLOCKED

### Repository smoke suite

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources; all live smoke checks passed.

### Direct video endpoint

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T220104Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Response content type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- `file` MIME detection: `text/html`
- Cloudflare cache status: `MISS`
- SHA-256: `10cf57872f78ba42db9efcc35d73c0333cd4e677ec6130c7dfb7c7bbc91ddeb8`
- `ffprobe`: FAIL — invalid media data

The acceptance criterion is not met. Although the endpoint returns HTTP 200, its body is the site HTML fallback rather than an MP4. The cache-busting query and `CF-Cache-Status: MISS` show this is not a stale cached response.

## Evidence

- `smoke.log` — complete smoke-suite output
- `headers.txt` — live response headers
- `curl.txt` — curl status/content-type/size metrics
- `response.bin` — downloaded response body
- `file.txt` — MIME signature result
- `ffprobe.txt` — media validation failure
- `sha256.txt` — response checksum
