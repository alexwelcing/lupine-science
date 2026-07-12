# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T02:14:31Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T021431Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8`
- Detected MIME: `text/html`
- Response size: `84,245` bytes
- SHA-256: `d707ed530a7a8ac0b2b10653c3eb320b160ff57859087703bf4ffec180d8edc6`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

BLOCKED. The smoke suite passes, but the direct video endpoint serves the site's HTML fallback rather than an MP4. The release requirement is not met until the endpoint returns HTTP 200 with `Content-Type: video/mp4` and a valid MP4 payload.

## Evidence

- `smoke.log`
- `url.txt`
- `headers.txt`
- `response.bin`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.json`
- `ffprobe.stderr`
