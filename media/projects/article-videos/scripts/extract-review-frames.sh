#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  extract-review-frames.sh [options] INPUT.mp4

Extract JPEG review frames at a regular interval and at every supplied cue point.

Options:
  -c, --cue-file FILE   Read cue starts from WebVTT/SRT or one timestamp per line.
                         May be supplied more than once.
      --cue TIMESTAMP   Add a cue point (seconds or HH:MM:SS[.,]mmm).
                         May be supplied more than once.
  -o, --output DIR      Output directory. Default: INPUT-review-frames
  -i, --interval SEC    Grid interval in seconds. Default: 5
  -h, --help            Show this help.

Examples:
  extract-review-frames.sh render.mp4
  extract-review-frames.sh -c narration.vtt render.mp4
  extract-review-frames.sh --cue 00:00:09 --cue 19.5 -o review render.mp4

The output directory contains timestamped JPEGs and manifest.tsv. Duplicate grid
and cue timestamps produce one frame whose manifest source is "interval+cue".
Files named frame-*.jpg and manifest.tsv from a previous run are replaced.
EOF
}

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg is required"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe is required"

cue_files=()
explicit_cues=()
output_dir=''
interval='5'
input=''

while (($#)); do
  case "$1" in
    -c|--cue-file)
      (($# >= 2)) || die "$1 requires a file"
      cue_files+=("$2")
      shift 2
      ;;
    --cue)
      (($# >= 2)) || die "$1 requires a timestamp"
      explicit_cues+=("$2")
      shift 2
      ;;
    -o|--output)
      (($# >= 2)) || die "$1 requires a directory"
      output_dir=$2
      shift 2
      ;;
    -i|--interval)
      (($# >= 2)) || die "$1 requires a number of seconds"
      interval=$2
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      (($# == 1)) || die "expected exactly one input MP4"
      input=$1
      shift
      ;;
    -*)
      die "unknown option: $1"
      ;;
    *)
      [[ -z $input ]] || die "expected exactly one input MP4"
      input=$1
      shift
      ;;
  esac
done

[[ -n $input ]] || { usage >&2; exit 2; }
[[ -f $input ]] || die "input file not found: $input"
[[ ${input,,} == *.mp4 ]] || die "input must be an MP4 file: $input"
awk -v value="$interval" 'BEGIN { exit !(value ~ /^[0-9]+([.][0-9]+)?$/ && value > 0) }' \
  || die "interval must be a positive number: $interval"

for cue_file in "${cue_files[@]}"; do
  [[ -f $cue_file ]] || die "cue file not found: $cue_file"
done

duration=$(ffprobe -v error -select_streams v:0 -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$input")
[[ $duration =~ ^[0-9]+([.][0-9]+)?$ ]] || die "could not determine video duration"

if [[ -z $output_dir ]]; then
  output_dir=${input%.*}-review-frames
fi
mkdir -p "$output_dir"
shopt -s nullglob
old_frames=("$output_dir"/frame-*.jpg)
((${#old_frames[@]} == 0)) || rm -- "${old_frames[@]}"
rm -f -- "$output_dir/manifest.tsv"

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT
records=$work_dir/records.tsv
: > "$records"

# Convert seconds or a clock timestamp to integer milliseconds.
to_ms() {
  local timestamp=$1
  awk -v value="$timestamp" '
    BEGIN {
      gsub(/,/, ".", value)
      count = split(value, part, ":")
      if (count == 1 && part[1] ~ /^[0-9]+([.][0-9]+)?$/) {
        seconds = part[1]
      } else if (count == 2 && part[1] ~ /^[0-9]+$/ && part[2] ~ /^[0-9]+([.][0-9]+)?$/) {
        seconds = part[1] * 60 + part[2]
      } else if (count == 3 && part[1] ~ /^[0-9]+$/ && part[2] ~ /^[0-9]+$/ && part[3] ~ /^[0-9]+([.][0-9]+)?$/) {
        seconds = part[1] * 3600 + part[2] * 60 + part[3]
      } else {
        exit 1
      }
      printf "%.0f\n", seconds * 1000
    }
  '
}

add_cue() {
  local timestamp=$1
  local milliseconds
  if ! milliseconds=$(to_ms "$timestamp"); then
    die "invalid cue timestamp: $timestamp"
  fi
  printf '%s\tcue\n' "$milliseconds" >> "$records"
}

# Build the regular grid in milliseconds to avoid floating-point filename drift.
awk -v duration="$duration" -v interval="$interval" '
  BEGIN {
    duration_ms = int(duration * 1000 + 0.5)
    interval_ms = int(interval * 1000 + 0.5)
    for (time_ms = 0; time_ms < duration_ms; time_ms += interval_ms) {
      printf "%d\tinterval\n", time_ms
    }
  }
' >> "$records"

for timestamp in "${explicit_cues[@]}"; do
  add_cue "$timestamp"
done

for cue_file in "${cue_files[@]}"; do
  while IFS= read -r timestamp; do
    [[ -n $timestamp ]] && add_cue "$timestamp"
  done < <(
    awk '
      {
        sub(/\r$/, "")
        lines[++line_count] = $0
        if (index($0, "-->") > 0) has_timed_cues = 1
      }
      END {
        for (line_number = 1; line_number <= line_count; line_number++) {
          line = lines[line_number]
          if (has_timed_cues && index(line, "-->") > 0) {
            # Timing lines are "start --> end [settings]". The first whitespace-
            # delimited token is the start timestamp, which is robust to cue
            # settings placed before or after the arrow.
            split(line, fields, /[[:space:]]+/)
            print fields[1]
          } else if (!has_timed_cues &&
                     (line ~ /^[[:space:]]*([0-9]+:)?[0-9][0-9]:[0-9][0-9]([.,][0-9]+)?[[:space:]]*(#.*)?$/ ||
                      line ~ /^[[:space:]]*[0-9]+([.][0-9]+)?[[:space:]]*(#.*)?$/)) {
            sub(/[[:space:]]*#.*/, "", line)
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
            print line
          }
        }
      }
    ' "$cue_file"
  )
done

duration_ms=$(awk -v duration="$duration" 'BEGIN { printf "%.0f", duration * 1000 }')
normalized=$work_dir/normalized.tsv
awk -F '\t' -v duration_ms="$duration_ms" '
  $1 >= 0 && $1 < duration_ms {
    if (sources[$1] == "") {
      sources[$1] = $2
    } else if (index("+" sources[$1] "+", "+" $2 "+") == 0) {
      sources[$1] = sources[$1] "+" $2
    }
  }
  END {
    for (time_ms in sources) print time_ms "\t" sources[time_ms]
  }
' "$records" | sort -n -k1,1 > "$normalized"

manifest=$output_dir/manifest.tsv
printf 'timestamp\tseconds\tsource\tfile\n' > "$manifest"
frame_count=0
previous_seconds=''
while IFS=$'\t' read -r milliseconds source; do
  seconds=$(awk -v ms="$milliseconds" 'BEGIN { printf "%.3f", ms / 1000 }')
  hours=$((milliseconds / 3600000))
  minutes=$(((milliseconds / 60000) % 60))
  secs=$(((milliseconds / 1000) % 60))
  millis=$((milliseconds % 1000))
  timestamp=$(printf '%02d:%02d:%02d.%03d' "$hours" "$minutes" "$secs" "$millis")
  filename=$(printf 'frame-%02d-%02d-%02d-%03d.jpg' "$hours" "$minutes" "$secs" "$millis")

  # Guard against timestamp corruption that would produce duplicate filenames.
  if [[ -f $output_dir/$filename ]]; then
    die "duplicate filename would be generated at $timestamp ($filename); aborting to avoid overwriting evidence"
  fi
  # Guard against non-monotonic timestamps.
  if [[ -n $previous_seconds ]] && awk -v prev="$previous_seconds" -v cur="$seconds" 'BEGIN { exit !(cur <= prev) }'; then
    die "timestamps are not monotonic: $previous_seconds followed by $seconds"
  fi

  ffmpeg -hide_banner -loglevel error -y -ss "$seconds" -i "$input" \
    -map 0:v:0 -frames:v 1 -q:v 2 "$output_dir/$filename"
  [[ -s $output_dir/$filename ]] || die "failed to extract frame at $timestamp"

  printf '%s\t%s\t%s\t%s\n' "$timestamp" "$seconds" "$source" "$filename" >> "$manifest"
  ((frame_count += 1))
  previous_seconds=$seconds
done < "$normalized"

# Final consistency check: manifest rows must match unique frame files.
shopt -s nullglob
extracted_frames=("$output_dir"/frame-*.jpg)
expected_frames=$((frame_count))
actual_frames=${#extracted_frames[@]}
if ((actual_frames != expected_frames)); then
  die "manifest lists $expected_frames frames but found $actual_frames unique frame files"
fi

printf 'Extracted %d review frames to %s\n' "$frame_count" "$output_dir"
printf 'Manifest: %s\n' "$manifest"
