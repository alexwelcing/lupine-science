# Investing in the Trust Layer — Live QA

Timestamp: 2026-07-12T02:25:47Z

## Smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

Evidence: `smoke.log`, `smoke-result.txt`

## Direct video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T022547Z`

Result: FAIL

- HTTP status: 200
- Response `Content-Type`: `text/html; charset=utf-8`
- Detected body MIME type: `text/html`
- Response size: 84,245 bytes
- Redirects: 0
- `ffprobe`: failed because the response is not an MP4 media file

Expected: HTTP 200 with an MP4 content type such as `video/mp4` and a probeable video body.

Conclusion: the general live smoke suite is healthy, but `/videos/investing-in-the-trust-layer.mp4` is currently resolving to the HTML fallback instead of the deployed video asset.

Evidence: `url.txt`, `curl.txt`, `video-headers.txt`, `video-response.bin`, `file-mime.txt`, `ffprobe.txt`
