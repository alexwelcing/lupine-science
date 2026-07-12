# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T19:49:12Z

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
Result: FAIL

A cache-busting request with `Cache-Control: no-cache` and `Accept: video/mp4` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `3b4276931fe52b44e17af97175f7a39a2ebe5839fd1c274a981a139e375c8ca4`
- Cloudflare cache status: `MISS`
- `ffprobe`: rejected the response as invalid media

The endpoint returns the site's HTML fallback, not an MP4. HTTP 200 alone does not satisfy the release contract.

## Evidence

- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194912Z-smoke.log`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194912Z-curl.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194912Z-headers.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194912Z-response.bin`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194912Z-file.txt`
- `reviews/investing-in-the-trust-layer-qa-2026-07-11T194912Z-sha256.txt`
