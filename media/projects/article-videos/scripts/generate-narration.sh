#!/usr/bin/env bash
set -euo pipefail

# Generate a robot-voice narration master from a TTS input file.
# Uses the voice config in media/projects/article-videos/voice-config.json.
#
# Usage:
#   scripts/generate-narration.sh --project ./the-02-percent-synthesis-problem \
#     --input narration-tts-input.txt --output narration
#
# Outputs (in the project directory):
#   <basename>-raw.mp3      Edge TTS raw output with sentence-level VTT
#   <basename>-raw.vtt      Edge TTS subtitle output
#   <basename>-final.wav    48 kHz mono PCM24 master normalized to -16 LUFS-I
#
# Options:
#   --project DIR   Episode project directory (required)
#   --input FILE    TTS input text file, relative to project (default: narration-tts-input.txt)
#   --output NAME   Output basename (default: narration)
#   --proof         Generate a 30-second proof from the first ~75 words only
#   --dry-run       Print the edge-tts command without running it

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
project_root=$(cd "$script_dir/.." && pwd)
venv_python="$project_root/.venv-tts/bin/python3"
venv_edge_tts="$project_root/.venv-tts/bin/edge-tts"
config_file="$project_root/voice-config.json"

project=''
input_file='narration-tts-input.txt'
output_name='narration'
proof=false
dry_run=false

usage() {
  sed -n '2,21p' "$0" | sed 's/^# //'
}

die() {
  printf 'error: %s\n' "$*" >&2
  exit 2
}

while (($#)); do
  case "$1" in
    --project)
      project=${2:?missing value for --project}
      shift 2
      ;;
    --input)
      input_file=${2:?missing value for --input}
      shift 2
      ;;
    --output)
      output_name=${2:?missing value for --output}
      shift 2
      ;;
    --proof)
      proof=true
      shift
      ;;
    --dry-run)
      dry_run=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1"
      ;;
  esac
done

[[ -n $project ]] || die "--project is required"
project=$(cd "$project" && pwd)
input_path=$project/$input_file
[[ -r $input_path ]] || die "input file is not readable: $input_path"
[[ -r $config_file ]] || die "voice config not found: $config_file"
[[ -x $venv_edge_tts ]] || die "Edge TTS virtual environment not installed at $venv_edge_tts"
for cmd in ffmpeg ffprobe; do
  command -v "$cmd" >/dev/null 2>&1 || die "$cmd is required"
done

read_config_value() {
  "$venv_python" -c "import json; print(json.load(open('$config_file', encoding='utf-8'))['$1'])"
}

voice=$(read_config_value voice) || die "could not read voice from config"
rate=$(read_config_value rate) || die "could not read rate from config"
pitch=$(read_config_value pitch) || die "could not read pitch from config"

raw_mp3="$project/${output_name}-raw.mp3"
raw_vtt="$project/${output_name}-raw.vtt"
final_wav="$project/${output_name}-final.wav"

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT

tts_input="$input_path"
if $proof; then
  tts_input="$work_dir/proof-input.txt"
  "$venv_python" -c "
from pathlib import Path
src = Path('$input_path').read_text(encoding='utf-8')
Path('$tts_input').write_text(' '.join(src.split()[:75]) + '\n', encoding='utf-8')
"
fi

printf 'Voice: %s\nRate: %s\nPitch: %s\nInput: %s\n' "$voice" "$rate" "$pitch" "$tts_input"

if $dry_run; then
  printf 'edge-tts --voice %s --rate %s --pitch %s -f %s --write-media=%s --write-subtitles=%s\n' \
    "$voice" "$rate" "$pitch" "$tts_input" "$raw_mp3" "$raw_vtt"
  exit 0
fi

"$venv_edge_tts" \
  --voice "$voice" \
  --rate "$rate" \
  --pitch "$pitch" \
  -f "$tts_input" \
  --write-media="$raw_mp3" \
  --write-subtitles="$raw_vtt"

# Two-pass loudnorm to -16 LUFS-I, peak limited, mono, 48 kHz, PCM24.
analyze_log="$work_dir/loudnorm-analyze.log"
ffmpeg -hide_banner -y -i "$raw_mp3" \
  -af "loudnorm=I=-15:TP=-1.5:LRA=7:print_format=json" \
  -f null - > /dev/null 2> "$analyze_log" || die "ffmpeg loudnorm analysis failed"

loudnorm_filter=$("$venv_python" -c "
import json, re
text = open('$analyze_log', encoding='utf-8', errors='replace').read()
blocks = re.findall(r'\\{[^{}]*\"input_i\"[^{}]*\\}', text, re.S)
if not blocks:
    raise SystemExit('could not find loudnorm analysis block')
m = json.loads(blocks[-1])
print('loudnorm=I=-15:TP=-1.5:LRA=7:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}'.format(**m))
") || die "could not build loudnorm filter"

apply_log="$work_dir/loudnorm-apply.log"
ffmpeg -hide_banner -y -i "$raw_mp3" \
  -af "$loudnorm_filter" \
  -ar 48000 -ac 1 -c:a pcm_s24le "$final_wav" > /dev/null 2> "$apply_log" || die "ffmpeg loudnorm apply failed"

verify_log="$work_dir/loudnorm-verify.log"
ffmpeg -hide_banner -y -i "$final_wav" \
  -af "loudnorm=print_format=json" \
  -f null - > /dev/null 2> "$verify_log" || die "ffmpeg loudnorm verification failed"

lufs=$("$venv_python" -c "
import json, re
text = open('$verify_log', encoding='utf-8', errors='replace').read()
blocks = re.findall(r'\\{[^{}]*\"input_i\"[^{}]*\\}', text, re.S)
if not blocks:
    raise SystemExit(1)
print(float(json.loads(blocks[-1])['input_i']))
") || die "could not parse output LUFS"

duration=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$final_wav")

printf '\nOutput:\n'
printf '  raw mp3 : %s\n' "$raw_mp3"
printf '  raw vtt : %s\n' "$raw_vtt"
printf '  final wav: %s\n' "$final_wav"
printf '  duration: %.3fs\n' "$duration"
printf '  output LUFS-I: %.2f\n' "$lufs"
