# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T19:33:59Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=1783798439`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Cloudflare cache status: `MISS`
- Downloaded bytes: `84,245`
- Detected MIME type: `text/html`
- SHA-256: `1a041e73d835671cb97e1ded27ed2cd5e1c659272e86ceee9c19aedc56b685ca`
- `ffprobe`: rejected payload with `moov atom not found` / `Invalid data found when processing input`

## Conclusion

The repository smoke suite passes, but the required `/videos/investing-in-the-trust-layer.mp4` contract does not. The live route serves the site's HTML fallback with a misleading HTTP 200 response. Release verification remains blocked until the deployed URL returns HTTP 200 with `Content-Type: video/mp4` and a valid MP4 payload.
