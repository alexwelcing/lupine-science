# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T01:53:09Z
Task: t_b69a5985
Endpoint: https://lupine.science/videos/investing-in-the-trust-layer.mp4

## Result: FAIL

- `npm run smoke`: PASS (`14 pages and 352 linked resources`; exit 0).
- Video endpoint HTTP status: PASS (`200`, no redirects).
- Video endpoint content type: FAIL (`text/html; charset=utf-8`, expected an MP4 media type such as `video/mp4`).
- Downloaded response: FAIL (`84,245` bytes; detected as HTML rather than MP4).
- `ffprobe`: FAIL (`Invalid data found when processing input`).

The route currently returns the site's HTML fallback with status 200, not the requested video. The acceptance criterion is therefore not met.

## Evidence

- `smoke.log` — complete smoke-test output
- `curl.txt` — curl status, effective URL, content type, size, and redirect count
- `video-headers.txt` — response headers
- `video-response.bin` — downloaded response body
- `file.txt` — file-type inspection
- `ffprobe.txt` — media validation failure
