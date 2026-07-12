# Investing in the Trust Layer — live QA smoke verification

Checked: 2026-07-12T01:57:45Z

## Repository smoke suite

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T015745Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `84e78ce7879a4baa2baefd17006bdee0c7a646a3d27c87b1518751f74c885074`
- Cloudflare cache status: `MISS`
- `ffprobe`: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The smoke suite passes, but the required live video endpoint returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the release contract; the endpoint must return `Content-Type: video/mp4` and valid MP4 bytes.

Raw evidence is stored alongside this report: `smoke.log`, `headers.txt`, `curl.txt`, `response.bin`, `file.txt`, `sha256.txt`, `ffprobe.txt`, and `verification.txt`.
