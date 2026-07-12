# Investing in the Trust Layer — live video QA

Task: `t_b69a5985`
Verified: `2026-07-12T03:50:01Z` (response `Date` header)

## Result: BLOCKED

The general live smoke suite passes, but the direct video URL does not satisfy the media contract.

## Smoke suite

Command: `npm run smoke`

Result: PASS

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

Evidence: `smoke.log`

## Direct video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T034946Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- File identification: HTML document
- First 16 bytes: `3c21646f63747970652068746d6c3e0a` (`<!doctype html>\n`)
- `ffprobe`: failed with `Invalid data found when processing input`

The live route is serving the site's HTML fallback rather than an MP4 asset. The task must remain blocked until the URL returns HTTP 200 with `Content-Type: video/mp4` and a valid MP4 payload.

## Evidence files

- `curl-summary.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `first16.txt`
- `ffprobe.txt`
- `ffprobe-error.txt`
- `sha256.txt`
- `smoke.log`
- `url.txt`
