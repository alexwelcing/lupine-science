# Investing in the Trust Layer — live QA verification

Verified: 2026-07-12T03:41:48Z

## Smoke suite

- Command: `npm run smoke`
- Result: PASS (exit 0)
- Coverage reported: 14 pages and 352 linked resources
- Evidence: `smoke.log`

## Direct video route

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T034148Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Download size: 84,245 bytes
- Redirects: 0
- Detected body: HTML document
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The status requirement passes, but the route does not return `video/mp4`; it returns the site's HTML fallback. The requested acceptance criteria are not met.

Evidence files:

- `video-curl.txt`
- `video-headers.txt`
- `video-response.bin`
- `video-file.txt`
- `video-ffprobe.txt`
- `video-sha256.txt`
- `url.txt`
