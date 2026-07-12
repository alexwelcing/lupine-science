# Investing in the Trust Layer — live QA

- Task: `t_b69a5985`
- Tested: 2026-07-12 06:01 UTC
- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`

## Result: FAIL

The website smoke suite passed, but the stable video URL does not serve an MP4 with the required content type.

### Smoke suite

Command: `npm --prefix /home/alex/Dev/lupine/lupine-science run smoke`

Result: exit 0; 14 pages and 352 linked resources passed.

Evidence: `smoke.log`

### Video URL

A full GET returned:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- `file`: HTML document, Unicode UTF-8 text
- `ffprobe`: failed with `moov atom not found` / invalid media data

A range request also returned HTML (`206`, `text/html; charset=utf-8`) rather than MP4 bytes.

Evidence:

- `video-full-headers.txt`
- `curl-full-result.txt`
- `video-headers.txt`
- `curl-result.txt`
- `video.mp4` (the mis-served HTML response, retained for diagnosis)
- `sha256.txt`

## Required remediation

Publish the approved MP4 at `/videos/investing-in-the-trust-layer.mp4` (or fix routing so the object is not handled by the HTML fallback), set `Content-Type: video/mp4`, deploy, and rerun this QA check.
