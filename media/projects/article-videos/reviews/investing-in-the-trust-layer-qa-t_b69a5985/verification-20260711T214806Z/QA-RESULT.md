# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T21:48:06Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `f59930039b8e3da9b5021ca85e78030ae5227a9d62520660c48a9138f638c3ef`
- ffprobe: FAIL (exit 1; response is not valid media)

## Verdict

FAIL. The live smoke suite passes, but the required direct video URL serves the site's HTML fallback rather than MP4 media. Acceptance requires HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit`
- `video-headers.txt`
- `video-response.bin`
- `curl-metrics.txt`
- `curl.exit`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe.err`
- `ffprobe.exit`
