# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T02:50:02Z

## Repository smoke test

- Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Stable video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T024929Z`
- Request headers: `Accept: video/mp4`, `Cache-Control: no-cache`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` — FAIL, expected `video/mp4`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- Redirects: 0
- Cloudflare cache status: MISS
- SHA-256: `4f37c937661ba2fbbe942ebb36365152c1d9d4cbb1039f716e869f2ab2d0de8b`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

## Verdict

BLOCKED. The repository smoke suite passes, but the required live video contract does not. The `/videos/investing-in-the-trust-layer.mp4` route returns the site HTML fallback with HTTP 200 instead of an MP4 response. Because the cache-busting, no-cache request was a Cloudflare MISS, this is not explained by a stale cached response.
