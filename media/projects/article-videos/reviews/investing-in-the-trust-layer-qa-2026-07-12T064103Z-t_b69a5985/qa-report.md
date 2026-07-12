# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T06:41:03Z  
Task: `t_b69a5985`

## Result: BLOCKED

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T064103Z`: HTTP 200.
- Required media content type: FAIL — response is `text/html; charset=utf-8`, not `video/mp4`.
- Downloaded response size: 84,245 bytes.
- `file` identification: HTML document, Unicode UTF-8 text.
- Response SHA-256: `8a4c5c8c2fd5dd0ab9d3e678dec619d53e1a4ae0020b878dbf0533436687fea9`.
- Redirect count: 0.

The route is returning the site's HTML fallback with a misleading 200 status rather than the MP4 asset. The video-link acceptance criterion is therefore not met.

## Evidence

- `smoke.log`
- `curl.txt`
- `video-headers.txt`
- `video-response.bin`
- `file.txt`
- `result.txt`
