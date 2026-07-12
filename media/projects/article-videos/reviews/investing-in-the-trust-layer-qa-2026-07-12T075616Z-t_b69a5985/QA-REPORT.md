# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T07:56:16Z
Task: t_b69a5985

## Result: FAIL

- `npm run smoke` from the repository root: PASS (14 pages, 352 linked resources).
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T075616Z`: HTTP 200.
- Required response content type: video/MP4.
- Actual HTTP `Content-Type`: `text/html; charset=utf-8`.
- Downloaded body: 84,245 bytes; detected MIME type `text/html`.

The route meets the HTTP 200 requirement but does not serve the requested MP4, so acceptance criteria are not met.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-curl.txt`
- `video-headers.txt`
- `video-detected-mime.txt`
- `video-response.bin`
