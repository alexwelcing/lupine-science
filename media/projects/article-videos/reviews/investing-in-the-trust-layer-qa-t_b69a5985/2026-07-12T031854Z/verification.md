# Investing in the Trust Layer — live QA verification

Verified at: 2026-07-12T03:18:54Z

## Smoke suite

Command: `npm run smoke` from the lupine-science repository root.

Result: PASS

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

Evidence: `smoke.log`

## Direct video route

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T031854Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Detected file type: HTML document
- First 16 bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- SHA-256: `c34cbfc37abe0c91c5fff13e83e5644964223b8d76111960fd7870c17ba9671b`
- `ffprobe`: invalid data

The URL returns the site HTML fallback rather than an MP4 asset. The required 200 status is present, but the required video Content-Type and media payload are not, so the task acceptance criteria are not met.

Evidence files: `video-headers.txt`, `video-response.bin`, `curl-summary.txt`, `file.txt`, `ffprobe.txt`, `signature.txt`, and `sha256.txt`.
