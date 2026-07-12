# Investing in the Trust Layer — QA smoke verification

Timestamp: 2026-07-11T19:10:58Z

## Result

BLOCKED — the general live-site smoke suite passes, but the required video endpoint does not satisfy the MP4 contract.

## Smoke suite

Command: `npm run smoke`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Video endpoint

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T191058Z`

Request headers included `Cache-Control: no-cache` and `Accept: video/mp4`.

Observed:

- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- Cloudflare cache status: `MISS`
- File identification: HTML document
- SHA-256: `dbb9cc58b4f0030db37c1b91f51fa0c3442934fcff6140d773760b9a0c5230f1`
- ffprobe: rejected payload as invalid media (exit 1)

The route is serving the site's HTML fallback rather than the deployed MP4. Deploy `public/videos/investing-in-the-trust-layer.mp4` to the exact live path, then rerun QA and require HTTP 200, `Content-Type: video/mp4`, and successful ffprobe validation.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T191058Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T191058Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191058Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191058Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T191058Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191058Z-sha256.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T191058Z-ffprobe.txt`
