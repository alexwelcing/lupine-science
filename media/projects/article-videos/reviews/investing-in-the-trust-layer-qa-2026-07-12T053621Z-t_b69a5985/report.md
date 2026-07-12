# Investing in the Trust Layer — live QA

Verified: 2026-07-12T05:36:21Z
Task: `t_b69a5985`

## Verdict

BLOCKED. The live smoke suite passes, but the required video endpoint serves the site's HTML fallback instead of an MP4.

## Smoke suite

Command: `npm run smoke`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

Evidence: `smoke.log`, `smoke-exit-code.txt`

## Video endpoint

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T053621Z-t_b69a5985`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Redirects: 0
- Cloudflare cache status: `MISS`
- Detected file type: HTML document
- SHA-256: `75b8d7aa1fd2bf2db1d76d6a27c5a88bfa53286abb38bbb4b6ad0551a453425a`
- `ffprobe`: exit code 1, invalid media data

The cache-miss response confirms this is a fresh origin/deployment result, not a stale cached object. Publish the MP4 at the required path or correct the production routing, then rerun this QA task.

Evidence: `headers.txt`, `curl.txt`, `curl-exit-code.txt`, `response.bin`, `file.txt`, `sha256.txt`, `ffprobe.txt`, `ffprobe-exit-code.txt`
