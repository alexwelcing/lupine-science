# Investing in the Trust Layer — final QA verification

Checked: 2026-07-11T22:10:18Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- ffprobe: FAIL (`moov atom not found`; invalid media)

## Verdict

FAIL. The endpoint returns the site's HTML fallback rather than an MP4. It does not satisfy the required `video/mp4` content-type contract.

Raw evidence is stored beside this report: `npm-smoke.log`, `npm-smoke.exit`, `headers.txt`, `curl.txt`, `response.mp4`, `file-mime.txt`, and `ffprobe.txt`.
