# Investing in the Trust Layer — QA smoke and live video verification

Checked: 2026-07-11T18:35:19Z

## Repository smoke test

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All configured live smoke checks passed

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T183519Z`

Request headers included `Cache-Control: no-cache`, `Pragma: no-cache`, and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- `CF-Cache-Status`: `MISS`
- File detection: `text/html`
- SHA-256: `88b22147618bf6e021b51d77a1c99bbf246af9b4dd715340591f52dca99f3f4f`
- `ffprobe`: rejected as invalid media

The live route returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the release contract. Deploy the video at the requested public path, then repeat this check and require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T183519Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T183519Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T183519Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T183519Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T183519Z-ffprobe.txt`
