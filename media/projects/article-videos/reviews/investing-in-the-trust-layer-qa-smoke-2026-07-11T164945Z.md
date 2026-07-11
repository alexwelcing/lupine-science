# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T16:49:45Z

## Repository smoke test

Command: `npm run smoke` (repository root)

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a unique cache-busting query, `Cache-Control: no-cache`, and `Accept: video/mp4`)

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File MIME detection: `text/html`
- Response SHA-256: `29cdc1b2008519b3d21abd1eda368bba661463c7788780d51fb77397ccf5873e`
- `ffprobe`: rejected the response with `Invalid data found when processing input`

The live route still serves the site's HTML fallback rather than an MP4. The required URL contract is not satisfied despite the 200 status.

## Evidence

- Smoke output: `media/projects/article-videos/reviews/investing-in-the-trust-layer-smoke-latest.log`
- Response headers: `media/projects/article-videos/reviews/investing-in-the-trust-layer-video-headers-latest.txt`
