# Investing in the Trust Layer — QA smoke verification

Timestamp: 2026-07-12 07:53 UTC
Task: `t_b69a5985`

## Result: BLOCKED

- `npm run smoke`: PASS (exit 0)
  - 14 pages and 352 linked resources passed.
- `GET /videos/investing-in-the-trust-layer.mp4`: HTTP 200, but FAILS media verification.
  - Content-Type: `text/html; charset=utf-8` (expected an MP4 media type such as `video/mp4`).
  - Download size: 84,245 bytes.
  - `file`: HTML document.
  - `ffprobe`: invalid data.
  - Cloudflare cache status: MISS, so the cache-busted request still reached an HTML fallback rather than an MP4 object.

## Evidence

- `npm-run-smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `headers.txt`
- `curl-result.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`

The live route returns 200 but does not serve the requested video. Deployment/static routing must publish the MP4 at the exact path instead of resolving it through the HTML fallback.
