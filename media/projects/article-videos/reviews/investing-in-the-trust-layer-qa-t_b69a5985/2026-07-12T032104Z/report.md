# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T03:21:04Z

## Result: BLOCKED / FAIL

- `npm run smoke`: PASS (exit 0)
- Site smoke coverage: 14 pages and 352 linked resources
- Video URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Final HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded response size: 84,245 bytes
- Redirects: none (effective URL is unchanged)

The requested path is wired in `public/articles/investing-in-the-trust-layer/index.html` and `public/videos/index.html`, and the MP4 exists locally at `public/videos/investing-in-the-trust-layer.mp4`. The live host is currently serving its HTML fallback for that path rather than the deployed MP4, so the endpoint contract cannot be confirmed.

Evidence:

- `smoke.log`
- `smoke-exit-code.txt`
- `video-url.txt`
- `video-headers.txt`
- `video-verification.txt`
