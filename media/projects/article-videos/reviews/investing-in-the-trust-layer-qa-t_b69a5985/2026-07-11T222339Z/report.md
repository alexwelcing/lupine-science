# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-11T22:23:39Z

## Result: BLOCKED

The repository smoke suite passes, but the required direct video URL contract fails.

## Repository smoke

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit status: 0
- Result: PASS — 14 pages and 352 linked resources checked across one live target

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- Cache-busting request: `?qa=2026-07-11T222339Z`
- Request headers: `Accept: video/mp4`, `Cache-Control: no-cache`
- curl exit status: 0
- HTTP status: 200
- Response Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- File-signature MIME: `text/html`
- ffprobe exit status: 1 (`Invalid data found when processing input`)

The route returns the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the release contract.

## Evidence

All evidence is in this directory:

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `curl.stderr`
- `response.bin`
- `file-mime.txt`
- `ffprobe.txt`
- `ffprobe.stderr`
- `sha256.txt`
- `status.txt`
- `timestamp.txt`
- `url.txt`
