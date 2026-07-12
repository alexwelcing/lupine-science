import csv
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

from faster_whisper import WhisperModel

project = Path(sys.argv[1]).resolve()
audio = project / "narration-ana-final.wav"
approved = (project / "narration-text.txt").read_text(encoding="utf-8").strip()
raw_vtt = project / "narration-ana-raw.vtt"
outdir = project / "transcript"
outdir.mkdir(exist_ok=True)

TITLE = "Beyond Carbon: The Error Geometry of Environmental Materials"


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower().replace("’", "'"))


def tokenize(value: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9]+(?:(?:['’–—-])[A-Za-z0-9]+)*", value)


def timestamp(seconds: float, separator: str = ".") -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    seconds, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}{separator}{millis:03d}"


def seconds(parts: list[str]) -> float:
    hours, minutes, secs, millis = map(int, parts)
    return hours * 3600 + minutes * 60 + secs + millis / 1000


sentences = [
    value.strip()
    for value in re.split(r"(?<=[.!?])\s+", approved.replace("\n", " "))
    if value.strip()
]

model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    str(audio), language="en", beam_size=5, word_timestamps=True, vad_filter=True
)
asr_words = []
for segment in segments:
    for word in segment.words or []:
        if norm(word.word):
            asr_words.append(
                {
                    "word": word.word.strip(),
                    "start": float(word.start),
                    "end": float(word.end),
                    "confidence": round(float(word.probability), 4),
                }
            )

cue_pattern = re.compile(
    r"(\d+)\s*\n"
    r"(\d\d):(\d\d):(\d\d)[,.](\d{3})\s+-->\s+"
    r"(\d\d):(\d\d):(\d\d)[,.](\d{3})\s*\n([^\n]+)"
)
cue_matches = cue_pattern.findall(raw_vtt.read_text(encoding="utf-8"))
if len(cue_matches) != len(sentences):
    raise SystemExit(f"Cue mismatch: {len(cue_matches)} VTT cues vs {len(sentences)} sentences")

rows = []
for sentence_index, match in enumerate(cue_matches):
    cue_number, *values = match
    cue_start = seconds(values[0:4])
    cue_end = seconds(values[4:8])
    target_words = tokenize(sentences[sentence_index])
    observed = [
        word
        for word in asr_words
        if word["end"] > cue_start - 0.12 and word["start"] < cue_end + 0.12
    ]
    matcher = SequenceMatcher(
        None,
        [norm(value) for value in target_words],
        [norm(value["word"]) for value in observed],
        autojunk=False,
    )
    mapped = {}
    for block in matcher.get_matching_blocks():
        for offset in range(block.size):
            mapped[block.a + offset] = observed[block.b + offset]

    for index, token in enumerate(target_words):
        if index in mapped:
            record = dict(mapped[index])
        else:
            left = next((mapped[j] for j in range(index - 1, -1, -1) if j in mapped), None)
            right = next(
                (mapped[j] for j in range(index + 1, len(target_words)) if j in mapped), None
            )
            run_left = index
            while run_left > 0 and run_left - 1 not in mapped:
                run_left -= 1
            run_right = index
            while run_right + 1 < len(target_words) and run_right + 1 not in mapped:
                run_right += 1
            low = left["end"] if left else cue_start
            high = right["start"] if right else cue_end
            count = run_right - run_left + 1
            position = index - run_left
            record = {
                "start": low + (high - low) * position / count,
                "end": low + (high - low) * (position + 1) / count,
                "confidence": None,
            }
        # The raw TTS cue boundaries are authoritative sentence constraints.
        record["start"] = max(cue_start, min(record["start"], cue_end))
        record["end"] = max(record["start"], min(record["end"], cue_end))
        rows.append(
            {
                "index": len(rows) + 1,
                "word": token,
                "start": round(record["start"], 3),
                "end": round(record["end"], 3),
                "start_time": timestamp(record["start"]),
                "end_time": timestamp(record["end"]),
                "confidence": record["confidence"],
                "sentence": int(cue_number),
            }
        )

payload = {
    "title": TITLE,
    "source_audio": str(audio),
    "audio_duration_seconds": round(float(info.duration), 3),
    "word_count": len(rows),
    "timing_method": "faster-whisper small.en word alignment, corrected to approved narration text and raw TTS sentence boundaries",
    "words": rows,
}
(outdir / "word-timestamps.json").write_text(
    json.dumps(payload, indent=2) + "\n", encoding="utf-8"
)
with (outdir / "word-timestamps.csv").open("w", newline="", encoding="utf-8") as handle:
    writer = csv.DictWriter(handle, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

(outdir / "transcript.txt").write_text(approved + "\n", encoding="utf-8")
markdown = [f"# Transcript — {TITLE}", "", f"Source audio: `{audio}`", ""]
for sentence_number, sentence in enumerate(sentences, 1):
    sentence_rows = [row for row in rows if row["sentence"] == sentence_number]
    markdown.extend(
        [
            f"**{sentence_rows[0]['start_time']}–{sentence_rows[-1]['end_time']}**  ",
            sentence,
            "",
        ]
    )
(outdir / "transcript.md").write_text("\n".join(markdown).rstrip() + "\n", encoding="utf-8")

# Caption cues: no more than eight words and never cross a sentence boundary.
caption_groups = []
current = []
for row in rows:
    if current and row["sentence"] != current[-1]["sentence"]:
        caption_groups.append(current)
        current = []
    current.append(row)
    if len(current) >= 8:
        caption_groups.append(current)
        current = []
if current:
    caption_groups.append(current)

vtt_lines = ["WEBVTT", ""]
for cue_index, group in enumerate(caption_groups, 1):
    text = " ".join(word["word"] for word in group)
    vtt_lines.extend(
        [
            str(cue_index),
            f"{timestamp(group[0]['start'])} --> {timestamp(group[-1]['end'])}",
            text,
            "",
        ]
    )
(outdir / "captions.vtt").write_text("\n".join(vtt_lines), encoding="utf-8")

print(
    json.dumps(
        {
            "asr_words": len(asr_words),
            "approved_words": len(rows),
            "sentences": len(sentences),
            "caption_cues": len(caption_groups),
            "duration_seconds": payload["audio_duration_seconds"],
        }
    )
)
