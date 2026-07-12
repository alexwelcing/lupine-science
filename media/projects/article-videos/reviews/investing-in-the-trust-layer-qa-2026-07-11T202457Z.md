# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:24:57Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one production target.

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T202457Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `9e2960c9426050e419c4f5789610c2196711ee4027e6d65afa8548d95d395a74`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL — invalid media data

## Result

FAIL. The repository smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract. The production deployment must return `Content-Type: video/mp4` and valid MP4 bytes before this task can pass.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-smoke.log`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-ffprobe.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-sha256.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202457Z-verification.txt`
