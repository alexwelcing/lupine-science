# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T02:09:00Z

## Result: FAIL

Repository smoke test passed, but the direct video URL does not satisfy the MP4 contract.

### Repository smoke

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: 0
- Result: 14 pages and 352 linked resources passed across 1 live target.

### Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T020900Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded bytes: 84,245
- Detected MIME: `text/html`
- SHA-256: `4aee974e63942f73825f3f7827649fae1244dab734fb3fe63fc67051470adf7d`
- ffprobe: failed with `Invalid data found when processing input`

The URL is serving the site's HTML fallback rather than an MP4. The release criterion is therefore not met.

### Evidence

- `smoke.log`
- `smoke.exit`
- `url.txt`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `sha256.txt`
- `ffprobe.txt`
- `verification.txt`
