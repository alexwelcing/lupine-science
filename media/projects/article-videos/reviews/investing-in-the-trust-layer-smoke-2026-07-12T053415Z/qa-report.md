# Investing in the Trust Layer — live smoke QA

Run: 2026-07-12 05:34 UTC
Target: `https://lupine.science`
Video: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: FAIL

- `npm run smoke`: PASS — 14 pages and 352 linked resources; all live smoke checks passed.
- Video HTTP status: PASS — `200`.
- Video content type: FAIL — returned `text/html; charset=utf-8`, expected an MP4 media type such as `video/mp4`.
- Payload signature: FAIL — response begins with `<!doctype html>` and was identified as an HTML document, not an MP4.

The live video URL appears to resolve to the site's HTML fallback rather than the published MP4 object. The task cannot pass until the deployed `/videos/investing-in-the-trust-layer.mp4` asset returns `200` with `Content-Type: video/mp4` and an MP4 payload.
