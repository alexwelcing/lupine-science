#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: publish-video-r2.sh <file> [object-key]

Required environment:
  VIDEO_R2_BUCKET       R2 bucket name
  VIDEO_CDN_BASE_URL    Production custom-domain origin, e.g. https://media.lupine.science
  CLOUDFLARE_API_TOKEN  Token with R2 object write permission
  CLOUDFLARE_ACCOUNT_ID Cloudflare account ID

The default object key is videos/<file-name>. Existing objects are not overwritten
unless VIDEO_R2_ALLOW_OVERWRITE=1 is set.
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage >&2
  exit 2
fi

file=$1
key=${2:-videos/$(basename "$file")}

[[ -f "$file" ]] || { echo "File does not exist: $file" >&2; exit 2; }
[[ "$key" != /* && "$key" != *'..'* ]] || { echo "Object key must be relative and may not contain '..': $key" >&2; exit 2; }

for variable in VIDEO_R2_BUCKET VIDEO_CDN_BASE_URL CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID; do
  [[ -n "${!variable:-}" ]] || { echo "Missing required environment variable: $variable" >&2; exit 2; }
done

case "$file" in
  *.mp4) content_type='video/mp4' ;;
  *.webm) content_type='video/webm' ;;
  *.vtt) content_type='text/vtt; charset=utf-8' ;;
  *.jpg|*.jpeg) content_type='image/jpeg' ;;
  *.png) content_type='image/png' ;;
  *) content_type='application/octet-stream' ;;
esac

remote="${VIDEO_R2_BUCKET}/${key}"
if [[ "${VIDEO_R2_ALLOW_OVERWRITE:-0}" != 1 ]] && npx --yes wrangler@latest r2 object get "$remote" --file /dev/null --remote >/dev/null 2>&1; then
  echo "Refusing to overwrite existing object: $remote" >&2
  echo "Set VIDEO_R2_ALLOW_OVERWRITE=1 only for an intentional replacement." >&2
  exit 1
fi

cache_control='public, max-age=31536000, immutable'
npx --yes wrangler@latest r2 object put "$remote" \
  --file "$file" \
  --content-type "$content_type" \
  --cache-control "$cache_control" \
  --remote

url="${VIDEO_CDN_BASE_URL%/}/${key}"
echo "Published: $url"
echo "Verifying object headers..."
curl --fail --silent --show-error --head "$url" | grep -iE '^(HTTP/|content-type:|content-length:|cache-control:|accept-ranges:|etag:)'
