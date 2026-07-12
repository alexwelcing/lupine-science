# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T19:39:42Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- 14 pages and 352 linked resources passed across one live target.

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- Detected file MIME: `text/html`
- SHA-256: `c0efb269909b78e6eccadfe043be9a1afc2dd4fe89021e976667e1558d5b2a0b`
- `ffprobe`: FAIL — `moov atom not found`; invalid media

## Verdict

BLOCKED. The repository smoke suite passes, and the video URL returns HTTP 200, but the response is the site's HTML fallback rather than an MP4. The endpoint does not meet the required video content-type contract.
