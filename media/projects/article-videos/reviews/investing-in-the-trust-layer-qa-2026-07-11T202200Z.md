# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:22:00Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one live target.

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T202200Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `5b99260ee3b4ec83a9b6ec751f2356c019f039f98f7d06a2688152b9786a11bb`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL — invalid media data

## Result

FAIL. The repository smoke suite passes, but the required `/videos/investing-in-the-trust-layer.mp4` endpoint serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract; deployment must return `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202200Z-smoke.log`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202200Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202200Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202200Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202200Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202200Z-ffprobe.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202200Z-sha256.txt`
