# Investing in the Trust Layer — live QA

Task: `t_b69a5985`
Run: `2026-07-12T085105Z`
Result: **FAIL / BLOCKED**

## Smoke suite

Command: `npm run smoke` from the repository root.

Result: PASS (exit 0).

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Required video endpoint

Requested URL:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T085105Z`

Request included `Accept: video/mp4` and `Cache-Control: no-cache`.

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- `file`: HTML document, UTF-8 text
- First bytes: `3c21646f63747970652068746d6c3e` (`<!doctype html>`), not an MP4 `ftyp` signature
- `ffprobe`: exit 1, invalid data
- Cloudflare cache status: `MISS`

## Conclusion

The generic live smoke suite passes, but the required video-link contract fails. The `/videos/investing-in-the-trust-layer.mp4` path is returning the site's HTML fallback rather than an MP4 object. Deploy/fix routing for the MP4 so the endpoint returns HTTP 200, `Content-Type: video/mp4`, and valid MP4 bytes, then rerun this QA task.

## Evidence

- `smoke.log`
- `video-headers.txt`
- `video-response.bin`
- `curl-result.txt`
- `file-type.txt`
- `signature.txt`
- `ffprobe.txt`
- `sha256.txt`
