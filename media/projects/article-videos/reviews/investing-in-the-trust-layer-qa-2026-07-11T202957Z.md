# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:29:57Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one production target.

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T202957Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `4b5b2c77097f62809b55f5d45f32dd31fac19c75ffe77f1054c6246096ed1d4d`
- `ffprobe`: FAIL — invalid media data

## Result

FAIL. The repository smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract. Production must return `Content-Type: video/mp4` and valid MP4 bytes before this task can pass.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-smoke.log`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-ffprobe.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-sha256.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T202957Z-verification.txt`
