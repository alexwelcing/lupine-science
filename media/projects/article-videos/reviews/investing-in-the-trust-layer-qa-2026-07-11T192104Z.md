# Investing in the Trust Layer — QA smoke verification

Timestamp: 2026-07-11T19:21:04Z

## Result

BLOCKED — the repository live-site smoke suite passes, but the required video endpoint does not satisfy the MP4 contract.

## Smoke suite

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across one target

## Exact video endpoint

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T192104Z`

Request headers: `Cache-Control: no-cache`, `Accept: video/mp4`

Observed:

- HTTP status: `200`
- Redirects: `0`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Download size: 84,245 bytes
- File identification: HTML document, Unicode UTF-8 text
- SHA-256: `4129bcbcfa18602d9c9a1880d7894797d165844e4cf5298a9511d4cfc9462088`
- ffprobe: rejected payload as invalid media (exit 1)

The exact live route is serving the site's HTML fallback rather than the MP4. Deploy the MP4 to this public route, then rerun QA and require HTTP 200, `Content-Type: video/mp4`, an MP4 signature, and successful ffprobe validation.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-url.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-response.bin`
- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-sha256.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T192104Z-ffprobe.txt`
