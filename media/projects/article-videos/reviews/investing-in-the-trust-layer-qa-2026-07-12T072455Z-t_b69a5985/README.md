# Investing in the Trust Layer — live QA

- `npm run smoke`: PASS (14 pages, 352 linked resources)
- Video URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (FAIL; expected a video MIME type such as `video/mp4`)
- Downloaded body: HTML document, 84,245 bytes (FAIL; not an MP4)
- ffprobe: FAIL (invalid media)

The route returns the site HTML fallback rather than the video asset, so the requested video-link verification does not pass.
