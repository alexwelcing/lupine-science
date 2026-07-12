# Investing in the Trust Layer — QA smoke and live video verification

Checked: 2026-07-12T05:07:03Z

## Smoke suite

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video route

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T050612Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- Cloudflare cache status: `MISS`
- SHA-256: `930194d284e4a7c02efd0b17b5fd391eb3daa88c03b0b20ab4c3d9ca7902d9b9`
- ffprobe: rejected response as invalid media

## Verdict

FAIL. The repository smoke suite passes, and the route returns HTTP 200, but it serves the site's HTML fallback rather than an MP4. The acceptance criterion requiring the correct video content type is not met.

Evidence files in this directory: `smoke.log`, `url.txt`, `curl.txt`, `headers.txt`, `response.bin`, `file.txt`, `sha256.txt`, `ffprobe.txt`, and `ffprobe-error.txt`.
