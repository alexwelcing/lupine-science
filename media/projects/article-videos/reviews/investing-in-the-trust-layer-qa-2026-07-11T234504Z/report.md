# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:45:04Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage reported: 14 pages and 352 linked resources

## Direct video endpoint

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T234504Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document, Unicode UTF-8 text
- `ffprobe`: FAIL (exit 1)
- SHA-256: `7ee6f4e148b405fdf553e4a417acd73993a66383e192ff7360c5e0f2a64f3b21`

## Verdict

FAIL. The repository smoke suite passes, but the required direct video endpoint serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not met until the URL returns HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `curl-summary.txt`
- `video-headers.txt`
- `file.txt`
- `ffprobe.txt`
- `ffprobe-exit.txt`
- `sha256.txt`
- `video-response.bin`
