# Investing in the Trust Layer — QA verification

Checked: 2026-07-11T23:00:09Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video endpoint

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=1783810845`
- Redirects: 0
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The production smoke suite passes, but the required video URL serves the site's HTML fallback rather than MP4 media. The acceptance criterion is not met.

## Evidence

- `npm-smoke.log`
- `npm-smoke.exit`
- `video.headers`
- `video.response`
- `video.curl.txt`
- `video.file.txt`
- `video.ffprobe.txt`
- `video.exit.txt`
