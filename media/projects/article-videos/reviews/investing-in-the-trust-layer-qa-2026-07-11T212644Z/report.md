# Investing in the Trust Layer — QA verification

Checked: 2026-07-11T21:26:44Z

## Result: BLOCKED

### Repository smoke test

- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Command: `npm run smoke`
- Exit status: 0 (PASS)
- Coverage: 14 pages and 352 linked resources

### Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T212644Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)
- Downloaded size: 84,245 bytes
- Detected MIME: `text/html`
- SHA-256: `8767697602a04d8339333063ecca11f0aff742bc1d2886bf743fda9df1753ed3`
- ffprobe: invalid media

The endpoint returns the site's HTML fallback rather than the required MP4. HTTP 200 alone does not satisfy the release contract.

## Evidence

- `smoke.log`
- `smoke-exit.txt`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `curl-exit.txt`
- `response.bin`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `ffprobe-exit.txt`
