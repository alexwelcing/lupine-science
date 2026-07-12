# QA smoke test — Investing in the Trust Layer

Tested: 2026-07-12 07:29 UTC
Target: https://lupine.science
Kanban task: `t_b69a5985`

## `npm run smoke`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

Evidence: `npm-run-smoke.log`, `smoke-exit-code.txt`

## Video endpoint

Requested URL:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T072915Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Response size: 84,245 bytes
- Payload identified by `file(1)` as an HTML document
- `ffprobe` rejected the payload as invalid media data
- First 16 bytes: `3c 21 64 6f 63 74 79 70 65 20 68 74 6d 6c 3e 0a` (`<!doctype html>`)
- SHA-256: `39eb0d034ba8945080342e7c227b4c5d2e390c4606c58722a08d65f3b219f64f`
- Cloudflare cache status: `MISS`

Evidence: `video-headers.txt`, `video-curl-summary.txt`, `video-file-type.txt`, `video-ffprobe.txt`, `video-url.txt`, `video-response.bin`

## Verdict

The general production smoke suite passes, but the required video endpoint serves the HTML fallback document rather than MP4 media. The task cannot pass until `/videos/investing-in-the-trust-layer.mp4` is deployed and returned with a media content type such as `video/mp4`.
