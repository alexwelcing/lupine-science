# Investing in the Trust Layer — live QA verification

Task: `t_b69a5985`
Timestamp: 2026-07-12T05:25:05Z
URL: https://lupine.science/videos/investing-in-the-trust-layer.mp4

## Smoke test

Command: `npm run smoke`
Result: PASS (exit 0)
Summary: 14 pages and 352 linked resources passed; all live smoke checks passed across one target.

## Video endpoint

Fresh full GET with redirects enabled:

- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Download size: 84,245 bytes
- `file`: HTML document
- `ffprobe`: failed (`moov atom not found`; invalid media)

Expected: HTTP 200 with `Content-Type: video/mp4` and a valid MP4 body.
Actual: the production fallback HTML page is returned under HTTP 200. This does not satisfy the task acceptance criterion.

Local repository wiring is present at `public/videos/investing-in-the-trust-layer.mp4`, and both the videos index and article link to the requested slug. The live deployment therefore appears not to contain/serve the MP4 yet.

Evidence files:

- `smoke.log`
- `curl-summary.txt`
- `video-headers.txt`
- `video-response.mp4` (despite the filename, this is the returned HTML body)
