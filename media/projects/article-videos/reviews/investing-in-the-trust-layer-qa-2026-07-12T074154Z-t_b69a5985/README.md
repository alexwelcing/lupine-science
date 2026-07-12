# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T07:41:54Z
Task: `t_b69a5985`
Endpoint: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- Full cache-busted GET: HTTP 200, but `Content-Type: text/html; charset=utf-8` (84,245 bytes).
- Ranged cache-busted GET: HTTP 206, also `Content-Type: text/html; charset=utf-8`; downloaded prefix identifies as an HTML document.
- Acceptance criterion is **not met**: the `.mp4` URL resolves to the site's HTML fallback rather than an MP4 response (`video/mp4`).

## Evidence

- `smoke.log`
- `full-get-headers.txt`
- `full-get-result.txt`
- `video-headers.txt`
- `video-prefix.bin`
- `curl-result.txt`
- `file-result.txt`
