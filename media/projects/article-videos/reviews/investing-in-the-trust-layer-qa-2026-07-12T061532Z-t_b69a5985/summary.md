# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T06:15:32Z

## Result: FAIL — video endpoint serves HTML

### Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS — 14 pages and 352 linked resources checked

### Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- Actual Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`

The direct path exists only through the site's HTML fallback and does not serve the required MP4. The article and video index both link to this exact path, so there is no alternate deployed filename to verify.

### Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-curl.txt`
- `video-url.txt`
