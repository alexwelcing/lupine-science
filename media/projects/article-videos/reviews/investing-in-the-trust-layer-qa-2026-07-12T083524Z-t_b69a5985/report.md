# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T08:35:24Z

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T083524Z`
Result: FAIL

A full GET returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Redirects: `0`
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- `ffprobe` exit code: `1` (invalid media)

Conclusion: the repository smoke test passes, but the required video endpoint serves the site's HTML fallback rather than an MP4. The task remains blocked until the video is deployed or routed at `/videos/investing-in-the-trust-layer.mp4` with `Content-Type: video/mp4`.

## Evidence

- `headers.txt`
- `curl.txt`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `investing-in-the-trust-layer.mp4` (captured response body; actually HTML)
