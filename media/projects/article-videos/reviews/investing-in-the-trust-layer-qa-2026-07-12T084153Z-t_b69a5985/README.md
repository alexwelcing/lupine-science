# Investing in the Trust Layer — live QA verification

Tested: 2026-07-12 08:41:53 UTC
Target: https://lupine.science
Task: t_b69a5985

## Result: FAIL

The site-wide smoke suite passes, but the requested video endpoint is not serving MP4 media.

## Smoke suite

Command: `npm run smoke` from the repository root.

- Exit code: 0
- Pages checked: 14
- Linked resources checked: 352
- Result: all live smoke checks passed

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T084153Z`

Observed:

- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Download size: 84,245 bytes
- File identification: HTML document
- `ffprobe`: failed with `Invalid data found when processing input`

Expected:

- HTTP status: 200
- A video media content type such as `video/mp4`
- A valid MP4 payload readable by `ffprobe`

The endpoint appears to return the site's HTML fallback under a misleading 200 status. This does not satisfy the acceptance criterion.

## Evidence

- `smoke.log`: full smoke-suite output
- `headers.txt`: response headers
- `curl.txt`: curl status/content-type/size summary
- `response.bin`: downloaded response body
- `file.txt`: file signature identification
- `ffprobe.txt`: media validation output
- `sha256.txt`: response checksum
- `result.env`: command exit codes
