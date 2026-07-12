# Investing in the Trust Layer — QA smoke test and video-link verification

Checked: 2026-07-11T18:56:26Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- File-signature detection: `text/html`
- `ffprobe` exit: `1` (`Invalid data found when processing input`)
- Response SHA-256: `c34a7da17ec3b18e2cbda9a234385e32baab9448c061cb046a7a5bb8348b9a7d`

The route returns the site's HTML fallback rather than an MP4, so the requested video-link contract is not satisfied.

## Evidence files

- `investing-in-the-trust-layer-qa-2026-07-11T185626Z-url.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185626Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185626Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185626Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T185626Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185626Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T185626Z-sha256.txt`
