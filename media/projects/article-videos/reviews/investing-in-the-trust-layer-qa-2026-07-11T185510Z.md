# Investing in the Trust Layer — live QA verification

Checked: 2026-07-11T185510Z
Task: `t_b69a5985`

## Repository smoke test

Command: `npm run smoke` from `/home/alex/Dev/lupine/lupine-science`

Result: PASS (exit 0)

- Target: `https://lupine.science`
- 14 pages checked
- 352 linked resources checked
- All live smoke checks passed across 1 target

## Direct video URL contract

Request: `GET https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T185510Z`

Result: FAIL

- HTTP status: `200`
- Response `Content-Type`: `text/html; charset=utf-8` (expected `video/mp4`)
- File-signature detection: `text/html`
- `ffprobe` exit: `1`
- Response SHA-256: `4b6a10f68d7ac2fce2a5d2834dda3960a30171f65de1b9309bc6e3782d099674`

The endpoint does not satisfy the requested MP4 contract; the live response is not a valid MP4.

## Raw curl metrics

```text
http_code=200
content_type=text/html; charset=utf-8
size_download=84245
url_effective=https://lupine.science/videos/investing-in-the-trust-layer.mp4?qa=2026-07-11T185510Z
```

## Response headers

```text
HTTP/2 200 
date: Sat, 11 Jul 2026 18:55:10 GMT
content-type: text/html; charset=utf-8
x-frame-options: DENY
report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=%2BfvcnWNyScq%2BFj9aY4AWaLrUVZrlxf%2BsfIkSuJU0WOBfQswi%2BBOWgDaTm%2B3uHVpjFQ27bCkzxug%2FgQkRR%2FUnpyxIDgPK0YRc1rbgTPqaeHIpfzH4NaUz6eQm8YcKU83y5HzNmCRsKnw6H1MibQ%3D%3D"}]}
nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
access-control-allow-origin: *
cache-control: public, max-age=14400, must-revalidate
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'none'; script-src 'self' 'sha256-uluBsiSV5ONcdXxCmn4jRhClulLz+CQLxbQ0j1t2Wo4=' 'sha256-Fa3fAHAVO/dSk7wQm4TdFbcwtkxkujyhSfVvEaza1g4=' 'sha256-+H46GX5rKHgWEIsEUo3U3OKC1lwWD+nZwIlrTSDM6B0='; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self' https://api.github.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
cross-origin-opener-policy: same-origin
permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
server: cloudflare
accept-ranges: bytes
cf-cache-status: MISS
cf-ray: a19a055bdee239b4-EWR
alt-svc: h3=":443"; ma=86400
```

## ffprobe

```text
/tmp/investing-in-the-trust-layer-2026-07-11T185510Z.bin: Invalid data found when processing input
{

}
```
