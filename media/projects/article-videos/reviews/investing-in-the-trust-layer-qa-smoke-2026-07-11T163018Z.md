# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T16:30:18Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured production target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with cache-busting query `qa=20260711T163018Z`, `Cache-Control: no-cache`, and `Accept: video/mp4`)

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File MIME detection: `text/html`
- Response SHA-256: `661c1c40440d01fdd89b943ea44bcde191dc12b0d3fa86d39357354d394e7103`
- `ffprobe`: exit 1 (`moov atom not found`; `Invalid data found when processing input`)

The endpoint returns the site's HTML fallback rather than the MP4. HTTP 200 alone does not satisfy the required video contract. Publish the MP4 at this path and repeat the check, requiring HTTP 200, `Content-Type: video/mp4`, and successful MP4 signature/probe validation.
