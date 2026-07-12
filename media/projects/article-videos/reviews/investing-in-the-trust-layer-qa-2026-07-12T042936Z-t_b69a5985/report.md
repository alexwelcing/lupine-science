# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T04:29:36Z
Task: `t_b69a5985`

## Result: FAIL

The repository live smoke suite passes, but the required video URL contract fails because the endpoint returns the site HTML fallback rather than an MP4.

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS
- Coverage: 14 pages and 352 linked resources

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T042936Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `a20f9a9d3692e31610ecbedeb773ec2363382d0d8971f073506b6dcbd75821d6`
- Media validation: FAIL — `ffprobe` reports `moov atom not found` and invalid input

HTTP 200 alone does not meet the acceptance criteria. The deployed route must serve an actual MP4 with a video content type.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `video-headers.txt`
- `video-curl-summary.txt`
- `video-file-mime.txt`
- `video-ffprobe.txt`
- `video-sha256.txt`
