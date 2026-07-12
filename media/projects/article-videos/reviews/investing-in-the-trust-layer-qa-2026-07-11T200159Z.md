# Investing in the Trust Layer — live QA smoke

Timestamp: 2026-07-11T20:01:59Z

## Result: FAIL

- `npm run smoke` from `/home/alex/Dev/lupine/lupine-science` passed: 14 pages and 352 linked resources.
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4` returned HTTP 200.
- Response `Content-Type` was `text/html; charset=utf-8`, not `video/mp4`.
- Downloaded body was 84,245 bytes and identified by `file` as `text/html`.
- `ffprobe` rejected the body with `Invalid data found when processing input`.
- SHA-256: `1b825cc3d2087e63852b1bc580a5327965ee440c8f2ba65b80ad2ece7a800e7c`.

The video-link acceptance criterion is not met. The live route appears to return an HTML fallback rather than the MP4 asset. The current smoke suite checks linked-resource status but does not require a video MIME type, so it can pass this failure.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T200159Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T200159Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T200159Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T200159Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T200159Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T200159Z-sha256.txt`
