# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:19:30Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one live target.

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260711T201930Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `28fc44581d70b8e29d826fe95fb3d2b1f933d9657d7f37f70faaf04d5ac53088`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL — invalid media data

## Result

FAIL. The repository smoke suite passes, but the required `/videos/investing-in-the-trust-layer.mp4` endpoint serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video-link contract; deployment must return `Content-Type: video/mp4` and valid MP4 bytes.
