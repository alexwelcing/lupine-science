# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T01:02:20Z

## `npm run smoke`

Status: PASS (exit 0)

```text
Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Stable video URL

URL: https://lupine.science/videos/investing-in-the-trust-layer.mp4

Result: FAIL

```text
HTTP/2 200
content-type: text/html; charset=utf-8
size_download: 84245
```

Expected: HTTP 200 with `Content-Type: video/mp4`.

The canonical slug is confirmed by both `public/videos/index.html` and `public/articles/investing-in-the-trust-layer/index.html`. The local file exists at `public/videos/investing-in-the-trust-layer.mp4`, but the live URL is currently serving the site's HTML fallback rather than the MP4, indicating the asset has not reached the live deployment (or is not present in the deployed artifact).
