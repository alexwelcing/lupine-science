# Investing in the Trust Layer — live QA

Checked at: 2026-07-12 01:43:58 UTC

## Result: BLOCKED

- `npm run smoke`: PASS (`14 pages and 352 linked resources`)
- Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T014358Z`
- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84245` bytes
- Local MIME detection: `text/html`
- `ffprobe`: failed with `Invalid data found when processing input`

The URL currently resolves to an HTML response rather than the requested MP4, so the video-link acceptance criterion is not met.

Evidence files in this directory: `smoke.log`, `url.txt`, `headers.txt`, `curl.txt`, `file-mime.txt`, `response.bin`, and `ffprobe.txt`.
