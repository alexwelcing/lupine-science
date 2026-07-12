# Investing in the Trust Layer — QA smoke and live video contract

Checked: 2026-07-11T21:40:26Z

## Repository smoke test

Command: `npm run smoke` from the repository root.

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct live video URL

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260711T214026Z`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- Cloudflare cache status: `MISS`
- `file` detection: HTML document
- SHA-256: `bcab41e871e746ae939a1728840c7f0b305f620451b9e662c4b3ce4540e15014`
- `ffprobe` exit code: `1` (`Invalid data found when processing input`)

The live `/videos/investing-in-the-trust-layer.mp4` route still serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video contract. Publish/map the MP4 at this route, then rerun this QA check and require HTTP 200 plus `Content-Type: video/mp4` and successful media probing.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit-code`
- `video-url.txt`
- `video-headers.txt`
- `curl-summary.txt`
- `video-response.bin`
- `file-type.txt`
- `sha256.txt`
- `ffprobe.txt`
