# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T22:25:43Z
Task: `t_b69a5985`

## Result: BLOCKED

The repository smoke suite passes, but the required direct video URL does not return an MP4.

## Repository smoke

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit status: 0
- Result: PASS — 14 pages and 352 linked resources checked across one live target

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting request: `?qa=2026-07-11T222543Z`
- Request headers: `Accept: video/mp4`, `Cache-Control: no-cache`
- curl exit status: 0
- HTTP status: 200
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- File-signature MIME: `text/html`
- SHA-256: `8b49c9d6f0aa331afe226caab948303586a6ca6a0e1f50ee0ec8dbb360e805bb`
- ffprobe exit status: 1 (`Invalid data found when processing input`)

The endpoint is returning the site's HTML fallback with HTTP 200, so the required video-link contract is not satisfied.

## Evidence

- `smoke.log` and `smoke.exit`
- `url.txt`
- `headers.txt`
- `curl.txt`, `curl.stderr`, and `curl.exit`
- `response.bin`
- `file-mime.txt`
- `ffprobe.txt`, `ffprobe.stderr`, and `ffprobe.exit`
- `sha256.txt`
