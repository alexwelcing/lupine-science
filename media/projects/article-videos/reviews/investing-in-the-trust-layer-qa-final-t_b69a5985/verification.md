# Investing in the Trust Layer — final QA verification

Checked: 2026-07-12T07:01:54Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage reported: 14 pages and 352 linked resources

## Direct video endpoint

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4`
- HTTP status: `200`
- HTTP Content-Type: `text/html; charset=utf-8`
- Detected body MIME type: `text/html`
- Downloaded size: `84,245` bytes
- SHA-256: `3ad238100b9ac3a418d660db6aec5804584ac7ccdf6eed955a1b982a1fbfbb05`
- Media validation: FAIL (`ffprobe`: invalid data)

## Verdict

FAIL. The repository-wide live smoke test passes, but the required video endpoint does not serve an MP4. It returns the site's HTML fallback with HTTP 200 and `text/html; charset=utf-8`; the required content type is `video/mp4`.

## Evidence

- `npm-run-smoke.log`
- `smoke-exit-code.txt`
- `video-headers.txt`
- `curl-result.txt`
- `file-mime.txt`
- `video-response.bin`
