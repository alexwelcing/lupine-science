# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T04:52:53Z
Task: `t_b69a5985`

## Result

FAIL — the repository smoke suite passes, but the direct video URL does not serve an MP4.

## Smoke suite

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Exit status: 0

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T045253Z`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- First 16 bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- SHA-256: `bff5dace9b7863ecde1e8848cb60c20b6d1d65ddb38b4ad6a807b2adb7497daa`
- `ffprobe`: `Invalid data found when processing input`
- Cloudflare cache status: `MISS`

The endpoint returns the site's HTML fallback rather than the requested MP4 asset. The 200-status criterion passes, but the required content type and media validity criteria fail.

## Evidence

- `smoke.log`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `response.bin`
- `file.txt`
- `signature.txt`
- `sha256.txt`
- `ffprobe.txt`
