# Investing in the Trust Layer — live QA

Task: `t_b69a5985`
Timestamp: 2026-07-12T08:27:59Z
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Results

- `npm run smoke`: PASS — 14 pages and 352 linked resources.
- HEAD request: HTTP 200, but `Content-Type: text/html; charset=utf-8` (FAIL; expected an MP4 media type such as `video/mp4`).
- Range GET (`bytes=0-1023`): HTTP 206, also `Content-Type: text/html; charset=utf-8`.
- Downloaded prefix begins with `<!doctype html>` and `file` identifies it as an HTML document, confirming the endpoint serves HTML rather than MP4 bytes.

## Evidence

- `headers.txt`: HEAD response headers.
- `curl-summary.txt`: HEAD status and content type.
- `range-headers.txt`: ranged GET response headers.
- `range-summary.txt`: ranged GET status and content type.
- `prefix.bin`: first 1024 response bytes.

## Verdict

FAIL. The general live smoke suite passes, but the requested video URL does not serve an MP4 with the correct content type.
