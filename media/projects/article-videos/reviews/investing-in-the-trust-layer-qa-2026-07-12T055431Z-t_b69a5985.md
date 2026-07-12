# Investing in the Trust Layer — live QA

Task: `t_b69a5985`
Checked: 2026-07-12 05:54:31 UTC
Target: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: BLOCKED / FAIL

The site-wide smoke test passes, but the requested video URL does not serve an MP4. It returns the HTML application shell with an incorrect media content type.

## `npm run smoke`

Run from `/home/alex/Dev/lupine/lupine-science`.

- Exit code: `0`
- Result: `PASS: 14 pages and 352 linked resources`
- Summary: `All live smoke checks passed across 1 target(s).`

## Direct video verification

A cache-busting GET request was sent to:

`https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T055431Z`

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: `84,245` bytes
- Redirects: `0`
- `file` identification: `HTML document, Unicode text, UTF-8 text`
- `ffprobe`: `Invalid data found when processing input`
- SHA-256: `62403f8f8d9aa9e1a0827941923f6741d31d02693508b9b5c9a50c5922de7d08`
- Cloudflare cache status: `MISS`

## Conclusion

The acceptance criterion is not met. Although the path returns HTTP 200, it does not return a video response or valid MP4 payload. The deployed static asset/routing configuration must be fixed so this exact path returns `Content-Type: video/mp4` and a probeable MP4 body.
