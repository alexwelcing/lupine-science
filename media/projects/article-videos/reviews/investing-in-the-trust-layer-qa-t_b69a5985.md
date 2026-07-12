# QA smoke test: Investing in the Trust Layer

Checked: 2026-07-12T08:16:29Z UTC

## `npm run smoke`

Working directory: `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit code 0)

```text
> lupine-science@0.1.0 smoke
> node scripts/smoke-live.mjs

Smoke-testing https://lupine.science (5 attempt(s), 10000ms delay)
  PASS: 14 pages and 352 linked resources
All live smoke checks passed across 1 target(s).
```

## Video URL verification

Requested with a cache-busting query and a 1 KiB byte range:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T081609Z`

Observed:

- HTTP status: `206 Partial Content` because the request included `Range: bytes=0-1023`; the server's full-resource response is known to return `200`.
- Content-Type: `text/html; charset=utf-8` (FAIL; expected an MP4 media type such as `video/mp4`).
- Content-Range: `bytes 0-1023/84055`.
- Downloaded bytes identified by `file --mime-type` as `text/html`.
- Redirect count: `0`.

Conclusion: the general live smoke test passes, but the required video endpoint is serving the site's HTML fallback rather than an MP4. The task cannot be completed until the video is deployed/routed at `/videos/investing-in-the-trust-layer.mp4` with `Content-Type: video/mp4`.
