# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T23:56:37Z
Task: `t_b69a5985`

## Result: BLOCKED — video endpoint violates the media contract

### Repository live smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one production target

### Direct video endpoint

Requested URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T235637Z`
Expected: HTTP 200 with `Content-Type: video/mp4` and a valid MP4 body
Actual:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Download size: `84,245` bytes
- Detected body MIME: `text/html`
- `curl` exit: `0`
- `ffprobe` exit: `1` (`Invalid data found when processing input`)

The route returns the site's HTML fallback under a successful status, not an MP4. The task acceptance criterion is therefore not met even though the general smoke suite passes. The current smoke script checks linked-resource status but does not validate video response MIME, so this false-positive is not caught by `npm run smoke`.

## Evidence

All evidence is in this directory:

- `smoke.txt` and `smoke-status.txt`
- `curl.txt`
- `headers.txt`
- `response.bin`
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
- `verification.txt`
- `url.txt`
