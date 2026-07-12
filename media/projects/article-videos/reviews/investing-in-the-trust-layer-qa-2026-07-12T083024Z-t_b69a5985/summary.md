# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T08:30:24Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T083024Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- `ffprobe`: invalid media data

The endpoint returns the site's HTML fallback rather than an MP4. Although the HTTP status is 200, the required content-type contract is not satisfied.

## Evidence

- `npm-smoke.txt`
- `video-headers.txt`
- `video-response.bin`
- `video-http-status.txt`
- `video-file-mime.txt`
- `video-size-bytes.txt`
- `video-sha256.txt`
- `video-ffprobe-error.txt`
