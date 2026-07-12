# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T03:59:39Z
Task: `t_b69a5985`

## Smoke test

Result: PASS

`npm run smoke` checked 14 pages and 352 linked resources against `https://lupine.science`.

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T035939Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected a video type such as `video/mp4`)
- Download size: 84,245 bytes
- Redirects: 0
- `file` identifies the response as an HTML document
- `ffprobe` rejects the response as invalid media

The route is returning the site HTML fallback rather than an MP4 object. The task cannot pass until the deployed video asset or routing rule is corrected.

## Evidence

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
