# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T16:41:43Z

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`.

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4` (requested with a cache-busting query parameter)

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File detection: HTML document, Unicode UTF-8 text
- Response SHA-256: `16aa2935e5dc4282d7283a2a89085a454b74240494ffed05008b6a31217c31dc`
- CDN cache status: `MISS`
- `ffprobe`: `Invalid data found when processing input`

## Conclusion

The smoke suite passes, but the required video link contract does not. The live route returns the site's HTML fallback under HTTP 200 instead of an MP4 response. Deployment/rewrite configuration must publish the MP4 at this path before QA can approve the release.
