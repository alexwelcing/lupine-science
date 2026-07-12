# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T01:38:53Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T013853Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `8e7bbf0548b06493ba00017dcc18807ec17ad91ffd980111aab22fe7c9bb1e1e`
- Cloudflare cache status: `MISS`
- MP4 validation: FAIL (`ffprobe`: `moov atom not found`; invalid media)

## Verdict

BLOCKED. The repository smoke suite passes, but the required live video URL contract does not. The endpoint returns the site's HTML fallback under HTTP 200 rather than an MP4 response. A cache-busting query, `Cache-Control: no-cache`, `Accept: video/mp4`, and `CF-Cache-Status: MISS` confirm this is not a stale CDN response.

## Evidence

- `smoke.log`
- `headers.txt`
- `response.mp4` (the HTML response body retained verbatim)
- `url.txt`
- `report.md`
