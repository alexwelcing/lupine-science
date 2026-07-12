# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:35:47Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T233547Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected body MIME type: `text/html`
- `ffprobe`: FAIL (`Invalid data found when processing input`)
- SHA-256: `2143ab92c0bb7c098a94f8c1a2c1f5d0faedf19afddf1a45f4d0afa1cf4ddbd1`

## Verdict

FAIL. The live smoke suite passes and the URL returns HTTP 200, but the endpoint serves the site's HTML fallback rather than valid MP4 media. The acceptance criterion remains unsatisfied until the route returns `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `smoke.log`
- `headers.txt`
- `response.bin`
- `curl.txt`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `summary.txt`
