# QA smoke and live video verification

Task: `t_b69a5985`
Verified: `2026-07-12T06:13:34Z`

## Result: FAIL

The site-wide smoke suite passes, but the required live video endpoint does not return an MP4.

## Smoke suite

Command: `npm run smoke`

Result: PASS

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

Evidence: `smoke.log`

## Live video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T061334Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Response size: 84,245 bytes
- Detected file type: HTML document, UTF-8 text
- Cloudflare cache status: `MISS`

The route is serving the site's HTML fallback rather than the requested MP4. The HTTP-status criterion passes, but the content-type criterion fails, so the task's acceptance criteria are not met.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `curl.txt`
- `file.txt`
- `sha256.txt`
- `video-response.bin`
