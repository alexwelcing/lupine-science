# Review handoff — Beyond Carbon opening identity v3

Status: **ready for independent Fable review; not approved**

## Durable package

- Source root: `media/projects/article-videos/beyond-carbon-error-geometry/`
- Opening composition: `compositions/logo-sting.html`
- Candidate master: `renders/beyond-carbon-error-geometry-v3-review-1080p.mp4`
- Synchronized captions: `renders/beyond-carbon-error-geometry-v3-review-1080p.vtt`
- Master SHA-256: `2e42e2d7498233d61ac89e1a166680215f872f3881f9a8a951fe57ec75d23bf4`
- Evidence root: `evidence/t_fee03953-v3/`
- Manifest: `evidence/t_fee03953-v3/manifest.tsv`
- Animator opening QA: `evidence/t_fee03953-v3/opening-identity-qa.md`
- Animator scorecard: `evidence/t_fee03953-v3/animator-self-scorecard.csv`

## Closure evidence

The v3 master is a fresh render from the final source. Its first two exact decoded samples show the mark and wordmark plus episode/readout context, eliminating the prior blank and identity-only risk. The manifest contains 101 full-resolution decoded frames and 12 contact sheets, including opening continuity at 0.000/0.100/0.500/1.000/2.000 seconds, all cue and cadence samples, all four prior transition defects with brackets, and the final hold.

Raw lint, validate, strict inspect, render, full-decode, ffprobe, typography, VTT timing, and spelling evidence is retained in this directory. All automated gates pass with zero errors/warnings/findings; the complete MP4 decodes with exit 0.

## Required independent action

Fable must verify the hash, inspect all 101 decoded rows, independently score each row, and explicitly score t=0 and t=0.1 at least 7/10 with no blank, mark-only, identity-only, clipping, collision, or low-opacity focal defect. Animator self-scores are evidence of self-QA only and must not be copied as reviewer approval.
