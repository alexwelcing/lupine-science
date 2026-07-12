# Investing in the Trust Layer — live QA verification

Checked: 2026-07-12T07:21:45Z
Task: `t_b69a5985`

## Repository smoke test

- Command: `npm run smoke`
- Working directory: `/home/alex/Dev/lupine/lupine-science`
- Result: PASS (exit 0)
- Coverage: 14 pages and 352 linked resources

## Direct video URL contract

- URL: `https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-12T072145Z`
- HTTP status: 200
- Content-Type: `text/html; charset=utf-8`
- Expected Content-Type: `video/mp4`
- Downloaded size: 84,245 bytes
- Detected MIME type: `text/html`
- SHA-256: `449d4fca8c0244fab9ba6da24636352cbf530b7334a62e47193ac1e62dfa33d9`
- ffprobe: FAIL (`moov atom not found`; invalid media)

## Verdict

FAIL. The live route returns the site's HTML fallback under HTTP 200, not an MP4. The required video-link contract is therefore not satisfied.

## Evidence files

- `smoke.log`
- `headers.txt`
- `curl.txt`
- `file-mime.txt`
- `sha256.txt`
- `ffprobe.txt`
- `investing-in-the-trust-layer.mp4` (captured HTML response despite extension)
