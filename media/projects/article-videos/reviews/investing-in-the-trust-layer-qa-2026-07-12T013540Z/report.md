# Investing in the Trust Layer — live QA

Checked: 2026-07-12T01:35:40Z

## Result: FAIL

- `npm run smoke`: PASS (exit 0) — 14 pages and 352 linked resources checked.
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T013540Z`
- HTTP status: `200`
- Redirects: `0`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: `84,245` bytes
- File-signature MIME detection: `text/html`
- SHA-256: `04af09e3cf8a354706ea9e1e322cee8144e959fb9c7d8d5c4f833cc78b11c679`
- `ffprobe`: FAIL (exit 1, invalid data)
- Cloudflare cache status: `MISS`

The repository smoke suite passes, but the required video-link contract does not. The production route returns the site's HTML fallback under HTTP 200 rather than an MP4. Publish or correctly route `public/videos/investing-in-the-trust-layer.mp4`, then rerun QA and require both HTTP 200 and `Content-Type: video/mp4` with valid MP4 bytes.

## Evidence

- `smoke.log`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe-exit.txt`
