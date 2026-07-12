# Investing in the Trust Layer — QA smoke verification

Checked: 2026-07-12T01:21:08Z

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=20260712T012014Z`
- HTTP status: 200
- HTTP Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)
- Downloaded bytes: 84,245
- Detected file MIME: `text/html`
- ffprobe: FAIL (`moov atom not found`; invalid media)

## Verdict

BLOCKED. The repository smoke suite passes, but the required video route does not serve an MP4. It returns the site's HTML fallback with HTTP 200, so the status-plus-content-type release contract is not satisfied.

## Evidence

- `smoke.log` / `smoke.exit`
- `url.txt`
- `headers.txt`
- `curl.txt`
- `response.mp4` (actual HTML response retained verbatim)
- `file.txt`
- `ffprobe.txt`
- `sha256.txt`
