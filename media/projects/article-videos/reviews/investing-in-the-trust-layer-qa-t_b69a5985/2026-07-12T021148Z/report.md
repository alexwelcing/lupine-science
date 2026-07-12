# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T02:11:48Z

## Result: FAIL

The repository smoke test passed, but the direct production video URL does not satisfy the MP4 response contract.

## Repository smoke

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources passed across 1 live target.

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T021148Z`
- Request: `HEAD`, with `Accept: video/mp4` and `Cache-Control: no-cache`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Cloudflare cache status: `MISS`

The route returns HTTP 200 but serves the site's HTML fallback, not the requested MP4. The release criterion is not met.
