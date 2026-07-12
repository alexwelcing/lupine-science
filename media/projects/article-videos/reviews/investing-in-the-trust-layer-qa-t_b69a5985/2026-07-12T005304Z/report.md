# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T00:53:04Z

## Result

Release contract: **FAIL**

## Repository smoke test

- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Command: `npm run smoke`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources; all live smoke checks passed across one target.

## Exact live video URL

- Required URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Request: cache-busted GET with `Accept: video/mp4` and `Cache-Control: no-cache`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- Cloudflare cache status: `MISS`
- `ffprobe`: exit `1`, invalid media

The route returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video-link contract.

## Evidence

- `npm-smoke.log`, `npm-smoke.exit`
- `headers.txt`, `curl.txt`, `curl.stderr`, `curl.exit`
- `response.bin`, `file-mime.txt`, `sha256.txt`
- `ffprobe.txt`, `ffprobe.stderr`, `ffprobe.exit`
