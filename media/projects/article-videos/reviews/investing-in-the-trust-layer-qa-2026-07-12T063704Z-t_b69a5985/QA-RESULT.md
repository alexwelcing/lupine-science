# Investing in the Trust Layer — QA result

Checked: 2026-07-12T06:37:04Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T063704Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- Detected MIME type: `text/html`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The generic live-site smoke suite passes, but the required video endpoint serves the site's HTML fallback rather than an MP4. The exact `/videos/investing-in-the-trust-layer.mp4` object must be deployed or its routing fixed before this QA task can pass.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `video-response.bin`
- `curl-metrics.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe-error.txt`
