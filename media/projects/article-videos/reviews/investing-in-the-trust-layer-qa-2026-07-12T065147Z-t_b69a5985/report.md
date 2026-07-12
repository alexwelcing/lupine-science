# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T06:51:47Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke`
Working directory: `/home/alex/Dev/lupine/lupine-science`
Result: **PASS** (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video URL contract

URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T065147Z-full`
Result: **FAIL**

A cache-busting full GET with `Accept: video/mp4` and `Cache-Control: no-cache` returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: `84,245` bytes
- File MIME detection: `text/html`
- SHA-256: `c7b9362c929c8bd5ef9d8d5b6f9363682ee099b57d0c5e70d462a2e7cc694809`
- `ffprobe`: exit 1, invalid media

A range request independently returned HTTP `206` with `Content-Type: text/html; charset=utf-8`; the body begins with `<!doctype html>`, confirming the endpoint serves the site's HTML fallback rather than MP4 bytes.

## Conclusion

The repository smoke suite passes, but the required live video-link contract does not. HTTP 200 is present for the full request, but the response is HTML rather than `video/mp4`; this task cannot be marked complete until the deployed asset/routing is fixed.

## Evidence

- `headers.txt` / `prefix.bin` / `prefix-hex.txt`: range-request evidence
- `full-headers.txt` / `full-response.bin`: full GET evidence
- `full-curl-summary.txt`: status, content type, size, and effective URL
- `full-file-mime.txt`: MIME detection
- `full-sha256.txt`: response checksum
- `full-ffprobe.txt`: media validation failure
