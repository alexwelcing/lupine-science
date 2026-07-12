# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T23:18:59Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Pages checked: 14
- Linked resources checked: 352
- Targets checked: 1

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T231859Z`
- Cache controls: unique query string, `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Detected MIME type: `text/html`
- Cloudflare cache status: `MISS`
- ffprobe: FAIL (exit 1, invalid media)

## Verdict

FAIL. The repository smoke suite passes, but the required live video route serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested contract. The deployment/static-asset routing must return `Content-Type: video/mp4` and valid MP4 bytes before this QA task can pass.

## Evidence

- `curl.txt`: curl status/content-type/size summary
- `headers.txt`: complete HTTP response headers
- `response.bin`: downloaded response body
- `file.txt`: detected MIME type
- `sha256.txt`: response checksum
- `ffprobe.txt`, `ffprobe-error.txt`, `ffprobe-exit.txt`: media validation
- `url.txt`, `stamp.txt`: exact request URL and timestamp
