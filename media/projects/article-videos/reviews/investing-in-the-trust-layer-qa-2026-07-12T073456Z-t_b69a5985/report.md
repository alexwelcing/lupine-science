# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T07:35:24Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T073524Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: `84,245` bytes
- Detected MIME: `text/html`
- SHA-256: `168cec63c5b52a388a40cbe22d7af7334124cde1d6b08e7019056978c1432e79`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

FAIL. The site smoke suite passes, but `/videos/investing-in-the-trust-layer.mp4` serves the site's HTML fallback rather than MP4 media. HTTP 200 alone does not satisfy the required endpoint contract.

## Evidence

- `smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `video-response.bin`
- `curl-result.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `verification-exit-codes.txt`
