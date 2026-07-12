# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:24:59Z

## Result: FAIL

The repository smoke suite passes, but the required live video URL contract fails because the URL returns the site's HTML fallback rather than an MP4.

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit status: 0
- Result: PASS
- Checked: 14 pages and 352 linked resources

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Request: cache-busting query, `Accept: video/mp4`, `Cache-Control: no-cache`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: 84,245
- Detected MIME: `text/html`
- SHA-256: `bf9ad733198af58e7604855467351327fce569717e437c327d1ec8915981e39d`
- Cloudflare cache status: MISS
- ffprobe: exit 1, `Invalid data found when processing input`

HTTP 200 alone is a false positive; the deployed route does not serve valid MP4 content.

## Evidence

- `headers.txt`
- `response.bin`
- `verification.txt`
- `ffprobe.txt`
- `smoke.txt`
- `url.txt`
