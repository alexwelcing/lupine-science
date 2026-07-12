# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T08:53:06Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit code 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T085306Z`
Request: full GET with `Accept: video/mp4`, `Cache-Control: no-cache`, and cache-busting query
Result: FAIL

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Redirects: `0`
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `c59b1bc921143c471b530d09d196e13d5bd14473e9ea9825a61a4258f3d35db1`
- `ffprobe`: invalid data

Conclusion: the general smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` serves the site's HTML fallback rather than an MP4. The required video-link contract is not met.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `url.txt`
- `headers.txt`
- `curl-result.txt`
- `response.bin`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe-error.txt`
