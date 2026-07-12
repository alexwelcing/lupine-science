# Investing in the Trust Layer — QA smoke and video-link verification

Timestamp: 2026-07-12T00:26:37Z
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

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T002637Z`
Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`

```text
http_code=200
content_type=text/html; charset=utf-8
size_download=84245
num_redirects=0
curl_exit=0
file_mime_type=text/html
sha256=e1f5768700902bb5b55830909605e24a97a871d73f9b28cfd794e049be7faae2
cf-cache-status=MISS
ffprobe_exit=1
ffprobe_error=Invalid data found when processing input
```

## Result

FAIL. The repository smoke suite passes, but the required video endpoint does not satisfy the media contract. It returns HTTP 200 with `Content-Type: text/html; charset=utf-8` and an 84,245-byte HTML fallback instead of `video/mp4`; `file` identifies the body as HTML and `ffprobe` rejects it. Deployment/static-asset routing must be corrected before this QA task can pass.
