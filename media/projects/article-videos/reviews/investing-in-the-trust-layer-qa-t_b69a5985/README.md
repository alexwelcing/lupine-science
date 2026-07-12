# Investing in the Trust Layer — live QA

Task: `t_b69a5985`
Run started: 2026-07-12T01:55:43Z

## Result

BLOCKED: the site-wide smoke test passes, but the stable video URL does not return an MP4.

## Site-wide smoke test

Command: `npm run smoke`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

Full output: `smoke.log`

## Stable video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
Cache-busted request result:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Detected format: HTML document
- `ffprobe`: invalid media data
- Cloudflare cache status: `MISS`

The route is returning the site's HTML fallback rather than the expected video asset, so the requested video-link verification fails.

## Evidence

- `smoke.log` — smoke-test output
- `smoke-exit-code.txt` — smoke-test exit status
- `video-headers.txt` — live response headers
- `curl-metrics.txt` — status, content type, size, and effective URL
- `video-response.bin` — downloaded response body
- `file.txt` — detected body format
- `ffprobe.txt` — media validation failure
- `sha256.txt` — response checksum
