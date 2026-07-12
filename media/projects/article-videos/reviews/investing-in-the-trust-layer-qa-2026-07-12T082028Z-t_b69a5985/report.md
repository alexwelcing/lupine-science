# Investing in the Trust Layer — QA smoke and video-link verification

Verified: 2026-07-12T08:20:28Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Exit code: 0
- Result: PASS
- Coverage: 14 pages and 352 linked resources

## Direct video URL

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T082028Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Download size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `e718359bbe3aaa1bab23cdfcaf3f08abb9fc8266cab35a6d93898ef50829c2ec`
- ffprobe exit code: 1

## Verdict

FAIL. The smoke suite passes, and the video route returns HTTP 200, but it serves the site's HTML fallback rather than an MP4. The required video-link content-type contract is not satisfied.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-response.bin`
- `curl-result.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe-error.txt`
