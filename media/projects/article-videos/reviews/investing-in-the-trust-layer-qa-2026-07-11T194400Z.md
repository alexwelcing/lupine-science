# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T19:44:00Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T194400Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: `84,245`
- Detected MIME type: `text/html`
- SHA-256: `35fa3b0e375cfa6b406d144f5105c69e553b1706b304f4052a8d29fe5eaf2c75`
- ffprobe: FAIL (`Invalid data found when processing input`)

Result: FAIL. The live endpoint returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the requested video-link contract.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T194400Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T194400Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T194400Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T194400Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T194400Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T194400Z-sha256.txt`
