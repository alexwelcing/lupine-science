# Caption and subtitle workflow

Every published article video ships with a sidecar WebVTT file and a plain-text transcript. The VTT is generated from reviewed timestamped cues; it is not hand-timed after export.

## 1. Prepare timestamped cues

Create `<slug>/captions.json` from the final narration transcript or word-timestamp output. Use seconds or `HH:MM:SS.mmm` timestamps:

```json
{
  "cues": [
    {"id": "intro", "start": 0.25, "end": 2.8, "text": "Materials shape the world we build."},
    {"id": "scale", "start": "00:00:03.000", "end": "00:00:06.200", "text": "Concrete alone accounts for immense global demand."}
  ]
}
```

Editorial rules:

- time against the final narration mix, not the draft TTS files;
- split at phrase boundaries, normally one or two lines and no more than 84 characters per cue;
- avoid overlaps; retain natural reading gaps where the narration pauses;
- use sentence case and meaningful punctuation; do not include visual-only labels;
- record names, acronyms, and technical vocabulary in `captions-allow.txt`, one item per line.

## 2. Generate WebVTT

```bash
python3 scripts/captions.py generate articles/<slug>/captions.json renders/<slug>.vtt
```

Generation rejects empty, overlapping, or non-positive cues and normalizes timestamps to `HH:MM:SS.mmm`.

## 3. Spell-check and verify against the final MP4

Install the deterministic checker once with `sudo apt install aspell aspell-en`. Then run:

```bash
python3 scripts/captions.py check \
  renders/<slug>.vtt renders/<slug>-1080p.mp4 \
  --allow captions-allow.txt
```

The command fails when:

- WebVTT syntax is invalid or contains no cues;
- cues overlap, have invalid duration, or extend beyond the ffprobe-measured MP4 duration (100 ms tolerance);
- a cue exceeds 84 characters;
- aspell reports a word not present in the project allow-list.

A pass prints the measured video duration, cue count, first/last cue times, trailing gap, and a `PASS` line. Run it again after every render or caption edit.

## 4. Human time-sync review

Automated checks prove bounds and ordering, but not semantic alignment. Watch the final MP4 with the VTT enabled at 1× speed, then spot-check at 0.75× around every scene cut and narration pause. Verify:

- each cue appears with the spoken word or phrase (target drift no more than 200 ms);
- no cue disappears before its phrase ends;
- shot changes do not strand a prior sentence unless intentionally carried;
- the first and last spoken words are captioned;
- captions do not obscure critical graphics in the reserved y=828–954 zone.

For objective evidence, mux the sidecar without re-encoding and inspect it in VLC:

```bash
ffmpeg -i renders/<slug>-1080p.mp4 -i renders/<slug>.vtt \
  -map 0 -map 1 -c copy -c:s webvtt -metadata:s:s:0 language=eng \
  renders/<slug>-caption-review.mkv
```

Record reviewer, date, MP4 path, VTT path, command output, and any corrected timestamps in the article review ticket. Publish the original MP4 plus sidecar VTT; the MKV is review evidence only.

## Release gate

Captions pass only when the script exits zero and the human sync review is recorded. The published transcript must be regenerated from the same approved cue text so captions and transcript cannot diverge.
