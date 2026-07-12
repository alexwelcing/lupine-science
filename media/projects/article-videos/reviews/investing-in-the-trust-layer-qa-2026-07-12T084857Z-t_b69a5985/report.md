# Investing in the Trust Layer — live QA

- Task: `t_b69a5985`
- Checked: `2026-07-12T08:48:57Z`
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T084857Z`

## Result: FAIL

- `npm run smoke`: PASS (14 pages, 352 linked resources)
- Video HTTP status: `200`
- Video response `Content-Type`: `text/html; charset=utf-8` (expected an MP4 media type such as `video/mp4`)
- Downloaded response MIME detected by `file`: `text/html`
- Download size: `84245` bytes
- Redirects: `0`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

The route returns the site HTML fallback with status 200 rather than the requested MP4 asset, so the video-link acceptance criterion is not satisfied.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file-mime.txt`
- `ffprobe.txt`
- `sha256.txt`
