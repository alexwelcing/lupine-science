# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T16:39:16Z

## Repository smoke test

Command: `npm run smoke` from the repository root.

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across the configured target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Cache-busting request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- File detection: HTML document, Unicode UTF-8 text
- Response SHA-256: `70141a724b29b189331b4f97a3e07ddf0fa9e55446e50de5c71e13c2431b99bd`
- CDN cache status: `MISS`
- `ffprobe`: failed with `moov atom not found` / `Invalid data found when processing input`

## Conclusion

The smoke suite passes, but the required video link contract does not. The live route returns the site's HTML fallback under HTTP 200 instead of an MP4 response. Deployment/rewrite configuration must publish the MP4 at this path before QA can approve the release.
