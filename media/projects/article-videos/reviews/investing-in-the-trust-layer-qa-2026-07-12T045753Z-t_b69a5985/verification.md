# Investing in the Trust Layer — QA verification

Checked: 2026-07-12T04:57:53Z
Task: `t_b69a5985`

## Smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video endpoint

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T045753Z`
Result: FAIL

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `ace856f3fe0b2ec707d2f1ea868449ead72aececc75c873f8560f4e67120ba03`
- `ffprobe`: failed with `moov atom not found` / invalid media
- Cloudflare cache status: `MISS`

The video URL resolves to the site's HTML fallback rather than an MP4. The required endpoint contract is not met, so this QA task cannot pass yet.

## Evidence

- `headers.txt`
- `video.mp4` (actual HTML response retained under the requested filename)
- `file-mime.txt`
- `url.txt`
