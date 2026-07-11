#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  audio-qa.sh [options] NARRATION [BGM]

Check narration integrated loudness and peak level. When a BGM stem is supplied,
also check that it sits sufficiently below narration while narration is active.
A failed check exits 1; invalid usage or missing dependencies exits 2.

Options:
  --bgm FILE              BGM stem (alternative to the second positional argument)
  --min-lufs LUFS         Minimum narration loudness. Default: -16
  --max-lufs LUFS         Maximum narration loudness. Default: -14
  --max-peak DBFS         Highest allowed narration sample peak. Default: -1
  --min-duck-db DB        Minimum narration-over-BGM RMS margin. Default: 6
  -h, --help              Show this help

Examples:
  audio-qa.sh narration.wav
  audio-qa.sh narration.wav ducked-bgm.wav
  audio-qa.sh --bgm ducked-bgm.wav --min-duck-db 8 narration.wav

The ducking check analyzes 100 ms windows where narration is within 35 dB of
its loudest window. It reports the power-weighted RMS margin between narration
and the BGM stem over those windows. Supply the post-ducking BGM stem, not the
unducked source or a final mix.
EOF
}

die() {
  printf 'error: %s\n' "$*" >&2
  exit 2
}

is_number() {
  [[ $1 =~ ^-?[0-9]+([.][0-9]+)?$ ]]
}

min_lufs=-16
max_lufs=-14
max_peak=-1
min_duck_db=6
narration=''
bgm=''

while (($#)); do
  case "$1" in
    --bgm)
      (($# >= 2)) || die "$1 requires a file"
      [[ -z $bgm ]] || die 'BGM supplied more than once'
      bgm=$2
      shift 2
      ;;
    --min-lufs|--max-lufs|--max-peak|--min-duck-db)
      (($# >= 2)) || die "$1 requires a number"
      is_number "$2" || die "$1 must be numeric: $2"
      case "$1" in
        --min-lufs) min_lufs=$2 ;;
        --max-lufs) max_lufs=$2 ;;
        --max-peak) max_peak=$2 ;;
        --min-duck-db) min_duck_db=$2 ;;
      esac
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      while (($#)); do
        if [[ -z $narration ]]; then narration=$1
        elif [[ -z $bgm ]]; then bgm=$1
        else die 'expected NARRATION and optional BGM only'
        fi
        shift
      done
      ;;
    -*) die "unknown option: $1" ;;
    *)
      if [[ -z $narration ]]; then narration=$1
      elif [[ -z $bgm ]]; then bgm=$1
      else die 'expected NARRATION and optional BGM only'
      fi
      shift
      ;;
  esac
done

[[ -n $narration ]] || { usage >&2; exit 2; }
[[ -r $narration ]] || die "narration is not readable: $narration"
[[ -z $bgm || -r $bgm ]] || die "BGM is not readable: $bgm"
for command in ffmpeg python3; do
  command -v "$command" >/dev/null 2>&1 || die "$command is required"
done

python3 - "$min_lufs" "$max_lufs" "$max_peak" "$min_duck_db" <<'PY' || die 'invalid thresholds'
import sys
lo, hi, peak, duck = map(float, sys.argv[1:])
if lo > hi:
    raise SystemExit(1)
if peak > 0 or duck < 0:
    raise SystemExit(1)
PY

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT

loudnorm_log=$work_dir/loudnorm.log
if ! ffmpeg -hide_banner -nostats -i "$narration" \
  -map 0:a:0 -af loudnorm=print_format=json -f null - > /dev/null 2> "$loudnorm_log"; then
  printf 'error: ffmpeg could not analyze narration: %s\n' "$narration" >&2
  exit 2
fi

narration_lufs=$(python3 - "$loudnorm_log" <<'PY'
import json, re, sys
text = open(sys.argv[1], encoding='utf-8', errors='replace').read()
blocks = re.findall(r'\{[^{}]*"input_i"[^{}]*\}', text, re.S)
if not blocks:
    raise SystemExit(1)
print(float(json.loads(blocks[-1])["input_i"]))
PY
) || die 'could not parse narration LUFS from ffmpeg output'

peak_log=$work_dir/peak.log
if ! ffmpeg -hide_banner -nostats -i "$narration" \
  -map 0:a:0 -af volumedetect -f null - > /dev/null 2> "$peak_log"; then
  printf 'error: ffmpeg could not measure narration peak: %s\n' "$narration" >&2
  exit 2
fi
narration_peak=$(python3 - "$peak_log" <<'PY'
import re, sys
text = open(sys.argv[1], encoding='utf-8', errors='replace').read()
matches = re.findall(r'max_volume:\s*(-?(?:inf|\d+(?:\.\d+)?))\s*dB', text, re.I)
if not matches:
    raise SystemExit(1)
value = matches[-1]
print('-inf' if value.lower() == '-inf' else float(value))
PY
) || die 'could not parse narration peak from ffmpeg output'

printf 'Narration LUFS: %s LUFS (allowed %s to %s)\n' "$narration_lufs" "$min_lufs" "$max_lufs"
printf 'Narration peak: %s dBFS (maximum %s dBFS)\n' "$narration_peak" "$max_peak"

failures=0
if ! python3 - "$narration_lufs" "$min_lufs" "$max_lufs" <<'PY'
import sys
value, lo, hi = map(float, sys.argv[1:])
raise SystemExit(0 if lo <= value <= hi else 1)
PY
then
  printf 'FAIL: narration loudness is outside the allowed LUFS range\n' >&2
  failures=$((failures + 1))
else
  printf 'PASS: narration loudness\n'
fi

if ! python3 - "$narration_peak" "$max_peak" <<'PY'
import sys
value, maximum = map(float, sys.argv[1:])
raise SystemExit(0 if value <= maximum else 1)
PY
then
  printf 'FAIL: narration peak exceeds %s dBFS\n' "$max_peak" >&2
  failures=$((failures + 1))
else
  printf 'PASS: narration peak\n'
fi

if [[ -n $bgm ]]; then
  narration_pcm=$work_dir/narration.f32le
  bgm_pcm=$work_dir/bgm.f32le
  ffmpeg -hide_banner -loglevel error -y -i "$narration" -map 0:a:0 \
    -ac 1 -ar 48000 -f f32le "$narration_pcm" \
    || die "could not decode narration: $narration"
  ffmpeg -hide_banner -loglevel error -y -i "$bgm" -map 0:a:0 \
    -ac 1 -ar 48000 -f f32le "$bgm_pcm" \
    || die "could not decode BGM: $bgm"

  if ! duck_result=$(python3 - "$narration_pcm" "$bgm_pcm" <<'PY'
from array import array
import math, sys

sample_rate = 48000
window = sample_rate // 10

def samples(path):
    values = array('f')
    with open(path, 'rb') as handle:
        values.frombytes(handle.read())
    return values

narration = samples(sys.argv[1])
bgm = samples(sys.argv[2])
count = min(len(narration), len(bgm))
if count < window:
    raise SystemExit('audio must contain at least 100 ms of overlapping material')

windows = []
for start in range(0, count - window + 1, window):
    n_power = sum(value * value for value in narration[start:start + window]) / window
    b_power = sum(value * value for value in bgm[start:start + window]) / window
    windows.append((n_power, b_power))
peak_power = max(n_power for n_power, _ in windows)
if peak_power <= 0:
    raise SystemExit('narration is silent')
active_floor = peak_power * (10 ** (-35 / 10))
active = [(n, b) for n, b in windows if n >= active_floor]
if not active:
    raise SystemExit('no active narration windows found')
n_power = sum(n for n, _ in active) / len(active)
b_power = sum(b for _, b in active) / len(active)
margin = math.inf if b_power <= 0 else 10 * math.log10(n_power / b_power)
print(f'{margin:.2f}\t{len(active)}\t{len(windows)}')
PY
  ); then
    printf 'error: could not analyze BGM ducking: %s\n' "$duck_result" >&2
    exit 2
  fi
  IFS=$'\t' read -r duck_margin active_windows total_windows <<< "$duck_result"
  printf 'BGM ducking margin: %s dB (minimum %s dB; %s/%s active windows)\n' \
    "$duck_margin" "$min_duck_db" "$active_windows" "$total_windows"
  if ! python3 - "$duck_margin" "$min_duck_db" <<'PY'
import sys
margin, minimum = map(float, sys.argv[1:])
raise SystemExit(0 if margin >= minimum else 1)
PY
  then
    printf 'FAIL: BGM is not sufficiently below active narration\n' >&2
    failures=$((failures + 1))
  else
    printf 'PASS: BGM ducking\n'
  fi
else
  printf 'SKIP: BGM ducking (no BGM stem supplied)\n'
fi

if ((failures)); then
  printf 'Audio QA failed: %d check(s) failed\n' "$failures" >&2
  exit 1
fi
printf 'Audio QA passed\n'
