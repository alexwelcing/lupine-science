# Investing in the Trust Layer — live QA

Timestamp (UTC): 2026-07-12T06:17:38Z
Task: `t_b69a5985`

## Result: FAIL

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T061738Z`: HTTP 200.
- Expected media content type: `video/mp4`.
- Actual content type: `text/html; charset=utf-8`.
- Downloaded response size: 84,245 bytes.
- `file` identifies the response as an HTML document.
- `ffprobe` rejects it as invalid media.

The URL returns the site's HTML fallback rather than an MP4, so the video-link acceptance criterion is not met.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `curl-result.txt`
- `video-response.bin`
- `file.txt`
- `ffprobe.txt`
- `exit-codes.txt`
