#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  heygen-avatar-video.sh --avatar ID --voice ID --script FILE [options]

Required:
  --avatar ID           HeyGen avatar look ID
  --voice ID            HeyGen voice ID
  --script FILE         UTF-8 narration text file

Options:
  --out DIR             Output directory (default: ./renders/heygen)
  --title TEXT          HeyGen dashboard title (default: Lupine Science avatar proof)
  --speed N             Voice speed, 0.5-1.5 (default: 1.18)
  --engine TYPE         avatar_v, avatar_iv, or avatar_iii (default: avatar_v)
  --format TYPE         mp4 or webm (default: mp4)
  --aspect RATIO        16:9, 9:16, 4:5, 5:4, 1:1, or auto (default: 16:9)
  --resolution VALUE    720p, 1080p, or 4k (default: 1080p)
  --dry-run             Write and print request JSON without auth or rendering
  -h, --help            Show this help

Authentication:
  heygen auth login --oauth    # web-plan credits
  heygen auth login --api-key  # API wallet
USAGE
}

avatar_id=""
voice_id=""
script_file=""
out_dir="./renders/heygen"
title="Lupine Science avatar proof"
speed="1.18"
engine="avatar_v"
format="mp4"
aspect="16:9"
resolution="1080p"
dry_run=false

while (($#)); do
  case "$1" in
    --avatar) avatar_id=${2:?missing value for --avatar}; shift 2 ;;
    --voice) voice_id=${2:?missing value for --voice}; shift 2 ;;
    --script) script_file=${2:?missing value for --script}; shift 2 ;;
    --out) out_dir=${2:?missing value for --out}; shift 2 ;;
    --title) title=${2:?missing value for --title}; shift 2 ;;
    --speed) speed=${2:?missing value for --speed}; shift 2 ;;
    --engine) engine=${2:?missing value for --engine}; shift 2 ;;
    --format) format=${2:?missing value for --format}; shift 2 ;;
    --aspect) aspect=${2:?missing value for --aspect}; shift 2 ;;
    --resolution) resolution=${2:?missing value for --resolution}; shift 2 ;;
    --dry-run) dry_run=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
done

for command in heygen jq curl; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command" >&2
    exit 1
  fi
done

if [[ -z "$avatar_id" || -z "$voice_id" || -z "$script_file" ]]; then
  printf 'Missing required argument.\n' >&2
  usage >&2
  exit 2
fi

if [[ ! -r "$script_file" ]]; then
  printf 'Script is not readable: %s\n' "$script_file" >&2
  exit 1
fi

case "$engine" in avatar_v|avatar_iv|avatar_iii) ;; *) printf 'Invalid engine: %s\n' "$engine" >&2; exit 2 ;; esac
case "$format" in mp4|webm) ;; *) printf 'Invalid format: %s\n' "$format" >&2; exit 2 ;; esac
case "$aspect" in 16:9|9:16|4:5|5:4|1:1|auto) ;; *) printf 'Invalid aspect ratio: %s\n' "$aspect" >&2; exit 2 ;; esac
case "$resolution" in 720p|1080p|4k) ;; *) printf 'Invalid resolution: %s\n' "$resolution" >&2; exit 2 ;; esac

if ! awk -v n="$speed" 'BEGIN { exit !(n ~ /^[0-9]+([.][0-9]+)?$/ && n >= 0.5 && n <= 1.5) }'; then
  printf 'Speed must be a number from 0.5 through 1.5; got %s\n' "$speed" >&2
  exit 2
fi

script=$(<"$script_file")
if [[ -z "${script//[[:space:]]/}" ]]; then
  printf 'Script is empty: %s\n' "$script_file" >&2
  exit 1
fi

mkdir -p "$out_dir"
request_file="$out_dir/request.json"
response_file="$out_dir/create-response.json"
status_file="$out_dir/video-status.json"

jq -n \
  --arg avatar_id "$avatar_id" \
  --arg voice_id "$voice_id" \
  --arg script "$script" \
  --arg title "$title" \
  --arg resolution "$resolution" \
  --arg aspect_ratio "$aspect" \
  --arg output_format "$format" \
  --arg engine "$engine" \
  --argjson speed "$speed" \
  '{
    type: "avatar",
    avatar_id: $avatar_id,
    title: $title,
    resolution: $resolution,
    aspect_ratio: $aspect_ratio,
    output_format: $output_format,
    script: $script,
    voice_id: $voice_id,
    voice_settings: {
      speed: $speed,
      pitch: 0,
      volume: 1,
      locale: "en-US"
    },
    caption: {file_format: "srt"},
    engine: {type: $engine}
  }' > "$request_file"

if [[ "$dry_run" == true ]]; then
  jq . "$request_file"
  printf 'dry_run_request=%s\n' "$request_file" >&2
  exit 0
fi

if ! heygen auth status >/dev/null 2>&1; then
  printf 'HeyGen is not authenticated. Run: heygen auth login --oauth\n' >&2
  exit 3
fi

printf 'Submitting HeyGen render (this consumes credits)...\n' >&2
heygen video create --wait -d "$request_file" > "$response_file"

video_id=$(jq -r '.data.video_id // .data.id // empty' "$response_file")
if [[ -z "$video_id" ]]; then
  printf 'HeyGen response did not include a video ID; inspect %s\n' "$response_file" >&2
  exit 1
fi

video_url=$(jq -r '.data.video_url // empty' "$response_file")
subtitle_url=$(jq -r '.data.subtitle_url // empty' "$response_file")

if [[ -z "$video_url" ]]; then
  heygen video get "$video_id" > "$status_file"
  status=$(jq -r '.data.status // empty' "$status_file")
  if [[ "$status" != "completed" ]]; then
    printf 'Video status is %s; inspect %s\n' "${status:-unknown}" "$status_file" >&2
    exit 1
  fi
  video_url=$(jq -r '.data.video_url // empty' "$status_file")
  subtitle_url=$(jq -r '.data.subtitle_url // empty' "$status_file")
fi

if [[ -z "$video_url" ]]; then
  printf 'Completed response has no video URL. Inspect %s and %s\n' "$response_file" "$status_file" >&2
  exit 1
fi

video_path="$out_dir/${video_id}.${format}"
curl --fail --location --silent --show-error "$video_url" --output "$video_path"

subtitle_path=""
if [[ -n "$subtitle_url" ]]; then
  subtitle_path="$out_dir/${video_id}.srt"
  curl --fail --location --silent --show-error "$subtitle_url" --output "$subtitle_path"
fi

printf 'video_id=%s\nvideo=%s\n' "$video_id" "$video_path"
if [[ -n "$subtitle_path" ]]; then
  printf 'subtitles=%s\n' "$subtitle_path"
fi
