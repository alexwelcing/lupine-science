# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T20:04:37Z

## Result: FAIL

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T200437Z`
Result: FAIL

The cache-busting request used `Cache-Control: no-cache` and `Accept: video/mp4` and returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `cba1662604339f1ce8c5c998c78cd9383d02b917a2d27c412911d0a0cd2d8c9f`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

The endpoint returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video contract. Deploy the MP4 at the requested path, then rerun this check and require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-ffprobe.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-sha256.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-stamp.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T200437Z-url.txt`
