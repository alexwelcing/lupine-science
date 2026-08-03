# Image Credibility Audit

> One hallucinated word in one figure can destroy the credibility of the entire publication. This gate exists so that never ships.

## What it does

`npm run review:images` performs an adversarial OCR audit of every raster image that ships on lupine.science:

- `public/articles/**` — heroes, inline figures, thumbnails
- `public/videos/*-poster.jpg` — video poster frames
- `public/one-pager-assets/**` — executive-summary artwork
- `public/result-graphics/*.svg` — data charts (audited by extracting `<text>` nodes directly, not OCR)

Each raster image is OCRed **twice**:

1. **Default pass** — upscaled to 2200px width.
2. **Sparse-normalized pass** — grayscale + normalize + sharpen, with Tesseract page-segmentation mode 11 (sparse text), which surfaces text hiding in unusual layouts.

Words are classified against three references:

- the system dictionary (`/usr/share/dict/words`, with a domain-corpus fallback on CI runners that lack it),
- the Lupine domain corpus (all article prose, video captions, image manifests, result-graphic and poster manifests),
- a character bigram model that scores how pathological a token's letter sequence is.

A token is **suspect** when it is unknown to all three and either has a pathological character distribution (score < -4.5, no vowel, or repeated chunks) or very low OCR confidence. A suspect is promoted to **strong** when both OCR passes saw it, or it is high-confidence (≥80), or its bigram score is deeply pathological (< -5.5).

False-positive guards (added after the first full triage):

- Any token containing a digit is treated as a data label, not prose (`r=0.906`, `$270B/year`, `Ni(110)`, `MACE-MP-0`, `R-1234yf`, `100,000x`).
- Hyphenated compounds match on the joined form and part-by-part (`clean-energy`, `CO2-cured`).
- A unit lexicon (`kjmol`, `whkg`, `mscm`, `gtcoe`, …) and a project/model lexicon (`mace`, `chgnet`, `gnome`, `ashrae`, …) cover text no dictionary knows.

## Severity

- **P0 — likely fake text.** ≥3 strong suspects, or ≥1 strong suspect with confidence ≥85 and score < -5. Fails the audit (exit 1).
- **P1 — needs an eyeball.** Any strong suspect below the P0 threshold.
- **Clean.** No strong suspects.

Reports land in `media/projects/image-review/reports/` (gitignored) as JSON + Markdown.

## What the first audit found (2026-07-16, 164 images)

27 P0 + 18 P1, all eyeballed. Two failure CLASSES emerged:

1. **AI-hallucinated fake text (1 image).** `beyond-carbon-…-10-platform-roadmap.jpg` was model-generated gibberish soup (91 suspects: "Arasttiveiotool cordenhemiars", duplicated stage labels). Replaced by a matplotlib rebuild with real content. Policy: scene illustrations that fail the audit are rebuilt as code, never re-rolled with an image model.
2. **Matplotlib text-collision defects (12 charts).** Labels overlapping other labels, markers, arrows, or axis furniture. Not fake text — but the same OCR pipeline catches them because overlapping real words read as gibberish ("Device performance" + ">400 Wh/kg" → "pefprpance"). Fixed at the generator; see `media/projects/image-review/chart-fix-spec.md`.

Everything else was OCR misreading real chart text, which motivated the false-positive guards above. Two scene illustrations that passed the audit were spot-checked by eye and confirmed genuinely text-free — the gate is neither blind nor crying wolf.

## When an image fails

1. Open the report, note the suspect tokens and the OCR preview.
2. Eyeball the image. If the tokens are OCR hallucinations on a clean figure, add the real words to the domain corpus (`scripts/lib/text-quality.mjs` extra list) only when they are genuinely real terms.
3. If the figure contains model-hallucinated fake text, rebuild it as code (preferred) or regenerate it with a strict no-text prompt (see `media/projects/article-visuals/regenerate-gibberish-images.mjs`).
4. If the figure has a text-collision layout defect, fix the generator's label placement — do not whitelist the resulting gibberish tokens.
5. Re-run `npm run review:images`.

## Related gates

- `npm run review:videos` — same analysis applied to video posters and sampled frames.
- `scripts/lib/text-quality.mjs` — the shared classifier both reviewers use; extend the corpus there, not in one-off scripts.
- CI runs both reviewers as blocking jobs (`image-review`, `video-review` in `.github/workflows/ci.yml`); a P0 fails the pipeline and blocks deploy. On CI runners without `/usr/share/dict/words`, the classifier falls back to the domain corpus for bigram training.
