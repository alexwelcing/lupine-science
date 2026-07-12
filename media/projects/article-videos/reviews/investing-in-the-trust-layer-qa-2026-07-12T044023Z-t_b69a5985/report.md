# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T04:40:23Z
Task: `t_b69a5985`

## Result: BLOCKED

The repository smoke suite passes, but the live video endpoint does not satisfy the required media contract.

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources checked across one target

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a cache-busting query parameter)
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- Redirects: `0`
- Cloudflare cache status: `MISS`
- SHA-256: `2a85edb3eed2370b1ee25b1aadc155f4a7b8535f60052b19eb5244a4734e5b58`
- ffprobe: FAIL (`Invalid data found when processing input`)

HTTP 200 is a false positive: the route is returning the site's HTML fallback rather than an MP4. The video asset must be deployed at the expected path and then this QA check rerun.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-response.bin`
- `curl-metrics.txt`
- `file-mime.txt`
- `ffprobe.txt`
- `sha256.txt`
- `tool-exit-codes.txt`
