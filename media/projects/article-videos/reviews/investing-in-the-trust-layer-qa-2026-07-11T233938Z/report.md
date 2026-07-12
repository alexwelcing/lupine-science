# Investing in the Trust Layer — QA smoke and video-link verification

Timestamp: 2026-07-11T23:39:38Z

## Repository smoke suite

- Command: `npm run smoke`
- Result: PASS (exit 0)
- Coverage reported: 14 pages and 352 linked resources

## Live video endpoint

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T233938Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Download size: 84,245 bytes
- `file`: HTML document
- `ffprobe`: FAIL (exit 1)
- SHA-256: `f6efb295371334b54bc66c0448652d53003acb269fb894a3a7102b29927eb27f`

## Verdict

FAIL. The smoke suite passes, but the required video-link contract does not. The live `/videos/investing-in-the-trust-layer.mp4` route returns the site's HTML fallback instead of an MP4. Production must return HTTP 200 with `Content-Type: video/mp4` and valid MP4 bytes before this task can pass.

Raw evidence is stored alongside this report (`smoke.log`, `headers.txt`, `curl.txt`, `file.txt`, `ffprobe.txt`, `sha256.txt`, and `verification.txt`).
