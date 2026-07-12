# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T00:48:19Z

## Result

**FAIL — the live video URL does not satisfy the MP4 contract.**

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources checked.

## Exact video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME type: `text/html`
- SHA-256: `1cf8d1d056e9fe543dcc9e5894be53748dea34dce8caa06fdde0451d05e6946f`
- `ffprobe`: exit 1, invalid media data
- Cloudflare cache status: `REVALIDATED`

A separate cache-busted request produced the same status, content type, size, and invalid-media result. The endpoint serves the site's HTML fallback rather than an MP4. HTTP 200 alone is therefore a false positive.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit`
- `exact-curl.txt`
- `exact-headers.txt`
- `exact-response.bin`
- `exact-file-mime.txt`
- `exact-ffprobe.txt`
- `exact-sha256.txt`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file-mime.txt`
