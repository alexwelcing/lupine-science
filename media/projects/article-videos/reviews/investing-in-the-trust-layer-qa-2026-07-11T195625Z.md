# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T19:56:25Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Result: FAIL
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected body MIME: `text/html`
- SHA-256: `4301cbb5202a8315cbc784b3346d01573a703265c61f4186538b0547b330ee43`
- `ffprobe`: FAIL — invalid media data
- Cloudflare cache status: `MISS`

A cache-busting request with `Accept: video/mp4` and `Cache-Control: no-cache` still received the site's HTML fallback. HTTP 200 alone does not satisfy the video delivery contract.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-smoke.log`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-url.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-ffprobe.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T195625Z-sha256.txt`
