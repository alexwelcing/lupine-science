# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T06:29:29Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources across one live target

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T062929Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: 200
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `944d5205c758391523933d9d3a5f2c57c00d0b4cb75005e8fba1690360749c18`
- `ffprobe`: FAIL — `moov atom not found`; invalid input data

## Verdict

FAIL. The repository smoke suite passes, but the required live video-link contract does not. The route returns the site's HTML fallback with HTTP 200 rather than an MP4 response with `Content-Type: video/mp4`.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `response.mp4` (the 84,245-byte HTML response retained for diagnosis)
