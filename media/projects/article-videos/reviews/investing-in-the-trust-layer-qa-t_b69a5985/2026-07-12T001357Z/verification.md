# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T00:13:57Z
Task: t_b69a5985

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

```text
> lupine-science@0.1.0 smoke
> node scripts/smoke-live.mjs

Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Direct video URL contract

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T001352Z`
Headers sent: `Accept: video/mp4`, `Cache-Control: no-cache`
Result: FAIL

```text
http_code=200
content_type=text/html; charset=utf-8
size_download=84245
```

Expected `Content-Type: video/mp4`; the endpoint still serves the site's HTML fallback. HTTP 200 alone does not satisfy the requested video-link contract.
