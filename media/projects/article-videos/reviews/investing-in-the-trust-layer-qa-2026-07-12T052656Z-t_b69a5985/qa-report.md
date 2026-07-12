# Investing in the Trust Layer — live QA

Task: `t_b69a5985`
Timestamp (UTC): `2026-07-12T052656Z`
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: FAIL

The site-wide smoke test passes, but the requested video endpoint does not serve an MP4.

### Smoke test

Command: `npm run smoke`
Exit code: `0`
Result: PASS — 14 pages and 352 linked resources checked.

### Video endpoint

Both HEAD and GET returned HTTP `200`, but both reported `Content-Type: text/html; charset=utf-8` rather than a video MIME type. The GET body is 84,245 bytes and local MIME detection identifies it as `text/html`. Therefore the endpoint appears to return the HTML fallback page, not the requested MP4.

Expected:
- HTTP 200
- `Content-Type: video/mp4`
- MP4 response body

Actual:
- HTTP 200
- `Content-Type: text/html; charset=utf-8`
- HTML response body

## Evidence

- `npm-smoke.log`
- `npm-smoke-exit-code.txt`
- `head-headers.txt`
- `head-summary.txt`
- `get-headers.txt`
- `get-summary.txt`
- `get-body-mime.txt`
- `get-body-sha256.txt`
- `get-body.bin`
- `curl-exit-codes.txt`
