# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T18:29:30Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260711T182930Z`

Request headers:

- `Cache-Control: no-cache`
- `Accept: video/mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- `CF-Cache-Status`: `MISS`
- Downloaded bytes: `84,245`
- File-signature detection: `text/html`
- Response SHA-256: `2714f81e081d4279a92039b1d45408e25ddb60cc1edd138a2f3064c937194e57`
- `ffprobe`: rejected response (`moov atom not found`; `Invalid data found when processing input`)

The live URL returns the site's HTML fallback rather than the MP4. HTTP 200 alone does not satisfy the video contract.

## Local publish artifact

`public/videos/investing-in-the-trust-layer.mp4` exists locally:

- Size: `3,813,568` bytes
- Detected MIME: `video/mp4`
- SHA-256: `bf44a1a5ea76b63acc51423276268de42dc12000d94c5b07f0ef9985bdb97e49`

The site deployment must include this asset (or otherwise route the stable URL to an MP4), after which QA must repeat this check and require HTTP 200 plus `Content-Type: video/mp4` and a valid MP4 signature.
