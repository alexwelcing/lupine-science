# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T16:27:44Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

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
- File-signature detection: `text/html`
- Response SHA-256: `472b0d38cab76d9b8dfb96183c8c6e53c8210b8fdc76984cb32e6735962fa855`
- CDN cache status: `MISS`
- `ffprobe`: exit 1, `moov atom not found` / `Invalid data found when processing input`

The endpoint returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the required video contract. Publish the MP4 at this path and repeat the check, requiring both HTTP 200 and `Content-Type: video/mp4` plus successful MP4 signature/probe validation.
