# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T00:20:23Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T002023Z`
- Redirects: 0
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected body MIME type: `text/html`
- `ffprobe`: FAIL (`Invalid data found when processing input`)
- SHA-256: `ed326e8a74005d76ee661d020d0ed3b0c49ba84dcfa0946ccc6b7a2ed8270f4f`

## Verdict

FAIL. The live smoke suite passes and the URL returns HTTP 200, but it serves the site's HTML fallback rather than MP4 media. The acceptance criterion remains unsatisfied until this endpoint returns `Content-Type: video/mp4` and valid MP4 bytes.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-12T002023Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-12T002023Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T002023Z-curl.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T002023Z-file.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T002023Z-ffprobe.txt`
- `investing-in-the-trust-layer-qa-2026-07-12T002023Z-sha256.txt`
