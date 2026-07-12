# Investing in the Trust Layer — live QA

- `npm run smoke`: PASS (14 pages, 352 linked resources).
- Video URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`.
- Content-Type: `text/html; charset=utf-8` (FAIL; expected an MP4 video MIME type such as `video/mp4`).
- Downloaded body: HTML document, 84,245 bytes (FAIL; this is the app shell, not an MP4).

Conclusion: smoke suite passes, but the video-link acceptance criterion is not met.
