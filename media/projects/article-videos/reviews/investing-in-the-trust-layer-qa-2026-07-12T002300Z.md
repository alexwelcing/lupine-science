# Investing in the Trust Layer — QA smoke and video-link verification

Timestamp: 2026-07-12T00:23:00Z
Task: `t_b69a5985`

## Repository smoke suite

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Exit code: `0`

```text
> lupine-science@0.1.0 smoke
> node scripts/smoke-live.mjs

Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T002300Z`
Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`

```text
http_code=200
content_type=text/html; charset=utf-8
size_download=84245
num_redirects=0
curl_exit=0
file_mime_type=text/html
bytes=84245
ffprobe_error=moov atom not found; Invalid data found when processing input
```

## Result

FAIL. The required URL returns HTTP 200, but the response is the site's HTML fallback (`text/html; charset=utf-8`) rather than an MP4 (`video/mp4`). `ffprobe` confirms the downloaded response is not valid media. The deployment/static asset routing must be corrected before this QA card can pass.
