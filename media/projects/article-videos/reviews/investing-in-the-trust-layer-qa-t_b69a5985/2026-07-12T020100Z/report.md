# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T02:01:00Z
Task: `t_b69a5985`

## Result: BLOCKED

The repository smoke suite passes, but the direct production video URL does not satisfy the media contract.

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS
- Coverage: 14 pages and 352 linked resources across one live target

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting request: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T020100Z`
- Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`
- HTTP status: `200`
- Response Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- Cloudflare cache status: `MISS`
- File MIME detection: `text/html`
- SHA-256: `db91fbb783f453fa1a4bee2196a324c53df164dd36b5c4b69675ae3ad90ef34c`
- ffprobe: FAIL — invalid media data

The HTTP 200 is a false positive caused by the site's HTML fallback. The MP4 has not been published at the required production path.

## Evidence

- `smoke.log`
- `smoke.exit`
- `request-url.txt`
- `video-headers.txt`
- `curl-metrics.txt`
- `video-response.bin`
- `file-mime.txt`
- `ffprobe.txt`
- `ffprobe.stderr`
- `sha256.txt`
- `exits.txt`

## Required follow-up

Publish the approved MP4 to `/videos/investing-in-the-trust-layer.mp4`, then rerun this QA check. Approval requires HTTP 200, `Content-Type: video/mp4`, and a valid MP4 payload.
