# Investing in the Trust Layer — QA smoke verification

Timestamp: 2026-07-11T19:14:40Z

## Result

BLOCKED — the repository live-site smoke suite passes, but the required video endpoint does not satisfy the MP4 contract.

## Smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Exact video endpoint

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T191440Z`

Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`

Observed:

- HTTP status: `200`
- Redirects: `0`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Cloudflare cache status: `MISS`
- File identification: `text/html`
- First bytes: HTML doctype
- SHA-256: `8423c014e4ccb4eed6cbe8757d2fa6278891b60b53ac19b47184c09e36465c14`
- ffprobe: rejected payload as invalid media (exit 1)

The exact live route is serving the site's HTML fallback rather than the MP4. The local publish artifact exists at `public/videos/investing-in-the-trust-layer.mp4`, is detected as `video/mp4`, is 3,813,568 bytes, and has SHA-256 `bf44a1a5ea76b63acc51423276268de42dc12000d94c5b07f0ef9985bdb97e49`. Deploy that file to the exact public route, then rerun QA and require HTTP 200, `Content-Type: video/mp4`, an MP4 signature, and successful ffprobe validation.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T191440Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T191440Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191440Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191440Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T191440Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191440Z-sha256.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191440Z-ffprobe.txt`
