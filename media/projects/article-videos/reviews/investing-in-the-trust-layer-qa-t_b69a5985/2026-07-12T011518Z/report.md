# Investing in the Trust Layer — live QA

Result: FAIL

- `npm run smoke`: PASS (`14 pages and 352 linked resources`; exit 0)
- Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T011518Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected a video MIME type such as `video/mp4`)
- Downloaded body: 84,245 bytes; identified by `file` as an HTML document
- Redirects: 0

The live route is returning the site's HTML fallback rather than the MP4, so the video-link acceptance criterion is not met.

Evidence in this directory: `smoke.log`, `headers.txt`, `curl.txt`, `file.txt`, `response.bin`, `exits.txt`, `url.txt`, and `stamp.txt`.
