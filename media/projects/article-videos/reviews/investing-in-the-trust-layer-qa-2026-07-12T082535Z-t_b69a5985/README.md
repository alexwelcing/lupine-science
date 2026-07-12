# Investing in the Trust Layer — live QA

Task: `t_b69a5985`
Run: 2026-07-12 08:25 UTC

## Result: BLOCKED / FAIL

- `npm run smoke`: PASS (`14 pages and 352 linked resources`)
- Canonical video URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Actual content type: `text/html; charset=utf-8`
- Expected content type: `video/mp4`
- Downloaded response: 84,245-byte HTML document, not an MP4
- `ffprobe`: FAIL (`Invalid data found when processing input`)
- SHA-256: `7ee7ccbf373410bad5a22ce2a270beb18a1705acb4cde34f703b97537809f407`

The endpoint does not satisfy the requested verification despite the broad live smoke suite passing. The smoke suite currently does not detect this invalid video response.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-url.txt`
- `video-headers.txt`
- `video-curl-summary.txt`
- `video-file-type.txt`
- `video-response.bin` (the mis-served HTML response)
- `video-ffprobe.txt`
- `video-ffprobe-error.txt`
- `video-verdict.txt`
- `video-sha256.txt`
