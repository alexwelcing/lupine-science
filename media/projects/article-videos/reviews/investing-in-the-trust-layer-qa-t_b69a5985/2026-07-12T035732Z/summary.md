# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T03:57:32Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T035732Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84245`
- Detected MIME: `text/html`
- curl exit: `0`
- ffprobe exit: `1` (`Invalid data found when processing input`)

## Verdict

FAIL. The repository smoke suite passes, but the live video route returns the site's HTML fallback rather than an MP4. The release contract is not satisfied until the route returns HTTP 200 with `Content-Type: video/mp4` and a valid MP4 payload.
