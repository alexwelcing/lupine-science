# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:48:01Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T204801Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Cloudflare cache status: `MISS`
- Detected MIME type: `text/html`
- SHA-256: `3fd932df01bd12be5f52bc3e814feed9a37874b23c3134b68ecb5569637a3f70`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The endpoint returns the site's HTML fallback with HTTP 200 rather than an MP4. The release contract is not satisfied until the response has both HTTP 200 and `Content-Type: video/mp4` and is valid MP4 media.
