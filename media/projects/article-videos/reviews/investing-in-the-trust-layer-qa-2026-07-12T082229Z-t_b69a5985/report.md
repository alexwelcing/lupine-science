# Live QA — Investing in the Trust Layer

Tested: 2026-07-12 08:22 UTC  
Target: https://lupine.science

## Smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T082259Z`

Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- `file(1)` identifies the response as an HTML document
- `ffprobe` rejects it with `moov atom not found` / `Invalid data found when processing input`
- Cloudflare cache status: `MISS`, so the cache-busted request still received the HTML fallback

## Verdict

The general site smoke suite passes, but the requested video endpoint does not serve an MP4. It returns the site HTML fallback with HTTP 200 and an incorrect content type. The task cannot pass until the deployed static video exists at `/videos/investing-in-the-trust-layer.mp4` and is served as `video/mp4`.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-url.txt`
- `video-headers.txt`
- `video-curl-metrics.txt`
- `video-response.mp4` (mislabelled HTML response)
- `video-file.txt`
- `video-ffprobe.txt`
