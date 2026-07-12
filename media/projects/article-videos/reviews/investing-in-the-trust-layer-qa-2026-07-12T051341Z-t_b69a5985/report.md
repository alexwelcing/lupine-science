# Investing in the Trust Layer — live QA

UTC run: 2026-07-12T05:13:41Z
Task: `t_b69a5985`

## Result: BLOCKED

- `npm run smoke`: PASS (14 pages, 352 linked resources; exit 0).
- Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=1783833253`
- HTTP status: 200.
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`).
- Downloaded response: 84,245 bytes, detected as an HTML document rather than MP4.
- `ffprobe`: failed with `Invalid data found when processing input`.

The status requirement passes, but the content-type and media payload requirements fail. The live route is serving the site's HTML fallback rather than the requested MP4.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `file.txt`
- `ffprobe.txt`
- `ffprobe-error.txt`
- `sha256.txt`
- `response.bin`
