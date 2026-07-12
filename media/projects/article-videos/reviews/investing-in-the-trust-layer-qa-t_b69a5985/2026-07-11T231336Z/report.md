# Investing in the Trust Layer — production QA

Checked: 2026-07-11T23:13:36Z

## Result

Acceptance criterion: **FAIL**

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources

## Direct video contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T231336Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- `ffprobe` exit code: `1` (`Invalid data found when processing input`)
- Cloudflare cache status: `MISS`

The live route is serving the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video-link contract.

## Evidence

All raw evidence is in this directory:

- `npm-smoke.log`
- `npm-smoke.exit`
- `url.txt`
- `headers.txt`
- `curl-metrics.txt`
- `curl-stderr.txt`
- `curl.exit`
- `response.bin`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe-stderr.txt`
- `ffprobe.exit`
