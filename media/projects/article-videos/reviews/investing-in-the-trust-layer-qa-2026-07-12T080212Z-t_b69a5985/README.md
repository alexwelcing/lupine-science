# Investing in the Trust Layer — live QA

Task: `t_b69a5985`
Run: 2026-07-12 08:02–08:03 UTC

## Result: BLOCKED / FAIL

- `npm run smoke`: PASS (`14 pages and 352 linked resources`)
- Canonical video URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Actual content type: `text/html; charset=utf-8`
- Expected content type: `video/mp4`
- Downloaded response: 84,245-byte HTML document, not an MP4
- `ffprobe`: FAIL (`moov atom not found` / invalid input)
- A cache-busted request (`?qa=20260712T080321Z`) returned the same HTML response, so this is not only a stale canonical-URL cache entry.

The endpoint therefore does not satisfy the requested verification despite the broad live smoke suite passing. The smoke suite currently does not detect this invalid video response.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video.mp4` (the mis-served HTML response)
- `video-cachebust-headers.txt`
- `video-cachebust.bin`
- `cachebust-verification.txt`
- `cachebust-file.txt`
