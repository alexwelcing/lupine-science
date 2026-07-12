# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T07:48:18Z
Task: `t_b69a5985`
URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- Video URL HTTP status: PASS — 200.
- Video URL content type: FAIL — `text/html; charset=utf-8` (expected `video/mp4`).
- Payload validation: FAIL — downloaded 84,245-byte HTML document; `ffprobe` rejected it as non-media.

The live route is returning the site HTML fallback rather than the MP4, so the requested video-link verification does not pass.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `curl-summary.txt`
- `video-response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `result.env`
