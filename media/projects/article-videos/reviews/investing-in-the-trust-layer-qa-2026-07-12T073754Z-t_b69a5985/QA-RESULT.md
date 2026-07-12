# Investing in the Trust Layer — live QA result

Timestamp: 2026-07-12T07:37:54Z
Task: `t_b69a5985`

## Smoke suite

Command: `npm run smoke` (repository root)

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- 1 production target passed

## Required video endpoint

Cache-busted full GET:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T073754Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Redirects: 0
- Payload identification: HTML document
- `ffprobe`: invalid media data

## Conclusion

The generic live-site smoke suite passes, but the required video contract does not. The production route is returning the site's HTML fallback instead of an MP4. Deploy or correctly route the MP4 at `/videos/investing-in-the-trust-layer.mp4`, then rerun this QA task.

Raw evidence is stored alongside this report: `smoke.log`, `video-headers.txt`, `video-response.bin`, `curl-metrics.txt`, `file-identification.txt`, `ffprobe-error.txt`, and `sha256.txt`.
