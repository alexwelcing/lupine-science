# Investing in the Trust Layer — live QA

Run: 2026-07-12 04:02:02 UTC  
Task: `t_b69a5985`

## Result: FAIL

### Smoke suite: PASS

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: 14 pages and 352 linked resources passed; all live smoke checks passed.

Evidence: `smoke.log`

### Published video: FAIL

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Observed both with and without a cache-busting query:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected a video MIME type such as `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document
- `ffprobe`: `Invalid data found when processing input`

The route is serving the site's HTML fallback under an HTTP 200 response, not an MP4. Therefore the task's required status-plus-content-type acceptance check does not pass.

## Evidence files

- `headers.txt` — cache-busted response headers
- `curl.txt` — cache-busted curl status and transfer metadata
- `no-query-headers.txt` — canonical URL response headers
- `no-query-curl.txt` — canonical URL curl status and transfer metadata
- `response.bin` — returned HTML body retained for inspection
- `file.txt` — file-type identification
- `ffprobe-error.txt` — media probe failure
- `sha256.txt` — response checksum
- `url.txt` — cache-busted request URL
