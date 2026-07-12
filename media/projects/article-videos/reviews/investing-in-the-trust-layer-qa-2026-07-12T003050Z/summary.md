# Investing in the Trust Layer — QA smoke and live video verification

Checked: 2026-07-12T00:31:15Z

## Repository smoke test

- Command: `npm run smoke`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Live video contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T003050Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: 200
- Response Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)
- Cloudflare cache status: MISS
- Downloaded bytes: 84,245
- Detected MIME type: `text/html`
- SHA-256: `1889476c54842a89b96bf703bad45863b815c3d4762faa0d012b05a09798e60b`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

BLOCKED. The live route returns the site HTML fallback rather than an MP4. HTTP 200 alone is a false positive. Publish or correctly route the MP4, then rerun this check and require both HTTP 200 and `Content-Type: video/mp4` plus successful media probing.
