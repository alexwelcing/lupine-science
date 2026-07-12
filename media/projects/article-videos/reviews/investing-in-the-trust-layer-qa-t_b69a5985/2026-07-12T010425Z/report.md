# Investing in the Trust Layer — live QA

Timestamp: 2026-07-12T01:04:25Z
Task: `t_b69a5985`

## `npm run smoke`

Working directory: `/home/alex/Dev/lupine/lupine-science`
Status: PASS (exit 0)

```text
> lupine-science@0.1.0 smoke
> node scripts/smoke-live.mjs

Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Stable video URL

URL: https://lupine.science/videos/investing-in-the-trust-layer.mp4
Result: FAIL

```text
http_code=200
content_type=text/html; charset=utf-8
size_download=84245
url_effective=https://lupine.science/videos/investing-in-the-trust-layer.mp4
```

The URL returns HTTP 200, but the required content type is not correct: it serves `text/html; charset=utf-8` rather than `video/mp4`. Response headers also include `x-content-type-options: nosniff`, so clients cannot safely interpret this HTML response as MP4 video. The live deployment appears to be serving the site HTML fallback for the stable video path.
