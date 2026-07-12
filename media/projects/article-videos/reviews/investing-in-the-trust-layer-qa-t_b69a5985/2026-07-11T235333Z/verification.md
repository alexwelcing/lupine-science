# Investing in the Trust Layer — QA smoke and video-link verification

Verified: 2026-07-11 23:53 UTC

## `npm run smoke`

Result: PASS (exit code 0)

```text
> lupine-science@0.1.0 smoke
> node scripts/smoke-live.mjs

Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Direct video URL

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

```text
http_code=200
content_type=text/html; charset=utf-8
size_download=84245
num_redirects=0
```

The response body is an HTML document, not an MP4. `ffprobe` fails with `moov atom not found` and `Invalid data found when processing input`.

A second request with a unique cache-busting query parameter produced the same result: HTTP 200, `text/html; charset=utf-8`, 84,245-byte HTML body, and zero redirects.

## Conclusion

The live smoke suite passes, but the required video-link contract does not. The `/videos/investing-in-the-trust-layer.mp4` route must serve the published MP4 with a video media type such as `video/mp4` before this QA task can pass.
