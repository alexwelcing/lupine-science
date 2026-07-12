# Investing in the Trust Layer — QA recheck

Checked: 2026-07-11T20:16:08Z

## Repository smoke test

- Command: `npm run smoke`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T201608Z`
- HTTP status: `200`
- Content-Type: `text/html; charset=utf-8` (FAIL; expected `video/mp4`)
- Downloaded size: `84,245` bytes
- CDN cache status: `MISS`
- File detection: HTML document
- First bytes: `<!doctype html>`
- SHA-256: `b9b9ea301ca7c534b43fbfcb33cb7c51bfd16f4de16849ec5dd8ec19ed254a53`
- ffprobe: FAIL (`Invalid data found when processing input`)

## Verdict

BLOCKED. The repository smoke suite passes, but the required video endpoint still serves the site's HTML fallback rather than an MP4. HTTP 200 alone does not satisfy the media contract.

## Evidence

- `investing-in-the-trust-layer-qa-2026-07-11T201608Z-smoke.log`
- `investing-in-the-trust-layer-qa-2026-07-11T201608Z-headers.txt`
- `investing-in-the-trust-layer-qa-2026-07-11T201608Z-response.bin`
