# Investing in the Trust Layer — production QA

Task: `t_b69a5985`
Timestamp: `2026-07-12T06:09:30Z`
Endpoint: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T060930Z`

## Result: FAIL

- `npm run smoke`: PASS (exit 0; 14 pages and 352 linked resources)
- Video HTTP status: PASS (`200`)
- Video Content-Type: FAIL (`text/html; charset=utf-8`, expected `video/mp4`)
- Downloaded response: FAIL (`HTML document`, 84,245 bytes)
- `ffprobe`: FAIL (exit 1; response is not valid media)
- Redirects: 0

The production route returns the site's HTML fallback with HTTP 200 rather than the requested MP4. The task cannot pass until the deployed video asset is served at `/videos/investing-in-the-trust-layer.mp4` with `Content-Type: video/mp4`.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `curl-result.txt`
- `file-result.txt`
- `ffprobe.txt`
- `video-response.bin`
