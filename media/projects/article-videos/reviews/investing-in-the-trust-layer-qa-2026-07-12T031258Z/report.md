# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T03:12:58Z
Result: **FAIL**

## Smoke test

Command: `npm run smoke`

- Exit code: 0
- 14 pages checked
- 352 linked resources checked
- Result: PASS

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T031258Z`

Expected:

- HTTP 200
- `Content-Type: video/mp4`
- Valid MP4 payload

Actual:

- HTTP 200
- `Content-Type: text/html; charset=utf-8`
- 84,245-byte HTML payload (`file` reports `text/html`)
- Cloudflare cache status: MISS
- `ffprobe` exit code 1: invalid media data

The general production smoke suite passes, but the required video endpoint resolves to the site's HTML fallback rather than an MP4. The video-link acceptance criterion is not met.

## Evidence

- `smoke.log`
- `headers.txt`
- `response.bin`
- `file-mime.txt`
- `ffprobe.txt`
- `sha256.txt`
- `status.txt`
- `url.txt`
