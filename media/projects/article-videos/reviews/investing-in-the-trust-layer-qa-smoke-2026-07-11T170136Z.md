# Investing in the Trust Layer — QA smoke recheck

Checked: 2026-07-11T17:01:36Z

## Repository smoke test

Command: `npm run smoke` from the repository root.

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Request used a unique cache-busting query string and headers `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- CDN cache status: `MISS`
- Payload MIME detection: `text/html`
- Response SHA-256: `64e1d777565822d54b61d54454b1aa08fe06155ea82e5051c19dbe4b091746b1`
- `ffprobe`: rejected payload with `moov atom not found` / `Invalid data found when processing input`

## Conclusion

The repository smoke suite passes, but the requested live video-link verification does not. The route returns the site's HTML fallback under a misleading HTTP 200 response. Publish/deploy `public/videos/investing-in-the-trust-layer.mp4`, then require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing before release approval.
