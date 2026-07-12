# Investing in the Trust Layer — final QA recheck

Checked: 2026-07-11T21:32:26Z
Task: `t_b69a5985`

## Result: BLOCKED

The repository live smoke suite passes, but the direct production video URL does not serve an MP4 and therefore fails the task acceptance criterion.

## Repository smoke suite

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: `0`
- Result: PASS
- Coverage reported: 14 pages and 352 linked resources

## Direct production video contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260711T213226Z`
- Request headers: `Accept: video/mp4`, `Cache-Control: no-cache`
- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: `84,245` bytes
- Cloudflare cache status: `MISS`
- File-signature MIME: `text/html`
- SHA-256: `74055debe4cfdab8ed7e15f4d92463cc75c62110e8eb5243e1b4d955ef501d9d`
- `ffprobe`: exit 1, `Invalid data found when processing input`

Conclusion: the URL returns the site's HTML fallback with a misleading HTTP 200, not the published MP4. A deploy containing `public/videos/investing-in-the-trust-layer.mp4` is required before QA can approve this task.

## Evidence

- `npm-smoke.log`
- `url.txt`
- `headers.txt`
- `curl-summary.txt`
- `response.bin`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
