# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T18:42:41Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T184241Z`

Request headers:

- `Cache-Control: no-cache`
- `Accept: video/mp4`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- `CF-Cache-Status`: `MISS`
- Downloaded bytes: `84,245`
- File-signature MIME detection: `text/html`
- Response SHA-256: `8cfbcb604c5dc26560e74b22cf6f27d8434efc63a498ff83ef9ecbcab4925978`
- `ffprobe`: rejected response (`Invalid data found when processing input`)

The live URL returns the site's HTML fallback rather than the MP4. HTTP 200 alone does not satisfy the requested video contract.

## Local publish artifact

`public/videos/investing-in-the-trust-layer.mp4` exists locally:

- Size: `3,813,568` bytes
- File detection: `ISO Media, MP4 Base Media v1 [ISO 14496-12:2003]`

The production deployment must include this asset (or otherwise route the stable URL to an MP4). After deployment, rerun this check and require HTTP 200, `Content-Type: video/mp4`, and successful MP4 probing.

## Evidence files

- `investing-in-the-trust-layer-qa-2026-07-11T184241Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184241Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184241Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T184241Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T184241Z-ffprobe.txt`
