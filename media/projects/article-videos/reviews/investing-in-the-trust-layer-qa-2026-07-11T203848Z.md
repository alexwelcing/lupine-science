# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:38:48Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one production target.

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T203848Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- `ffprobe`: FAIL — invalid media data

## Result

FAIL. The repository smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video-link contract. Production must return `Content-Type: video/mp4` and valid MP4 bytes before this task can pass.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T203848Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T203848Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T203848Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T203848Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T203848Z-ffprobe.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T203848Z-sha256.txt`
