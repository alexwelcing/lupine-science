# Investing in the Trust Layer — live QA

Verified: 2026-07-12T05:39:02Z
Task: `t_b69a5985`

## Result: FAIL

- `npm run smoke`: PASS (exit 0)
  - 14 pages checked
  - 352 linked resources checked
- `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T053902Z`: FAIL
  - HTTP status: `200`
  - Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
  - Response size: 84,245 bytes
  - Prefix identifies an HTML document (`<!doctype html>`)
  - `ffprobe`: `Invalid data found when processing input`

The route resolves to the site HTML fallback instead of the requested MP4 asset. The status requirement passes, but the required media content type and playable-video requirements do not.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `headers.txt`
- `curl-summary.txt`
- `range-headers.txt`
- `prefix.bin`
- `prefix-hex.txt`
- `file.txt`
- `ffprobe.txt`
