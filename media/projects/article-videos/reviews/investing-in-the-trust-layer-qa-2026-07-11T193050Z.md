# Investing in the Trust Layer — QA smoke verification

Timestamp: 2026-07-11T19:30:50Z

## Verdict

BLOCKED / FAIL — the repository smoke suite passes, but the required live video endpoint serves the site's HTML fallback instead of an MP4.

## Repository smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Direct video contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T193050Z`

Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`

Observed:

- HTTP status: `200`
- Redirects: `0`
- Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)
- Download size: `84,245` bytes
- File identification: `text/html`
- First bytes: `<!doctype html>\n<html lang="en">`
- First 16 bytes (hex): `3c21646f63747970652068746d6c3e0a`
- SHA-256: `2624f5a3e97dc9811269436799245b63c8352977f24ebb75f0596c67505cd032`
- ffprobe: exit `1`, `Invalid data found when processing input`

The endpoint meets the HTTP 200 portion of the acceptance criterion but fails the required media content type and payload checks. Deploy the MP4 to the exact public route, then rerun QA and require HTTP 200, `Content-Type: video/mp4`, an MP4 signature, and successful ffprobe validation.
