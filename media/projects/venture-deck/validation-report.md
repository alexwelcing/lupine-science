# Venture deck validation report

Date: 2026-11-11
Deployment: not performed

## What changed

The deck was brought into line with the messaging canon (`docs/messaging-canon.md`):

- Slide 12 lists the realized sparse-DFT pilot first: its preregistered 40 meV gate against published references failed, the passing check is same-engine only, and against the references the pilot was 693.0–705.7 meV off. The source footer now cites “The Savings Stack,” the “What happened when we ran it” section of “Shared DFT Anchors…,” and the archived Z1 de-brief for the remaining limits.
- Slide 13 keeps the three `[OWNER DECISION]` fields untouched. Its framing no longer presents correction as a product: “Make measured model error part of the simulation loop materials labs already run.”; “Measurement on the lanes we have tested.”; “Evaluation that runs on a lab’s own hardware, from simulation to synthesis.”; close “Models guide. Evidence measures. Lean checks the arithmetic.” No figures changed.
- The self-contained copy `deck.html` was rebuilt from the current template. It had been left at the superseded pre-reset draft. `scripts/validate-venture-deck.mjs` now fails if its slides or embedded evidence differ from the served deck.

Earlier verification records for superseded builds are in git history.

## Outputs

| File | Bytes | SHA-256 |
|---|---:|---|
| `media/projects/venture-deck/deck.html` (self-contained) | 375,600 | `1dc289e5c7ede0575417418f1beb099a167a9a07b74d7fc883ec103fc3754c45` |
| `public/venture/deck.html` | 67,278 | `3c39310f548d5f60aba55f099db8263c4e2a8250ca5424ba26cdbda745813e7f` |
| `media/projects/venture-deck/evidence-manifest.json` | 38,778 | `a46d42a4be8af4f32498d14aead76415cd0c6da341c12373292048fcd1f9bff2` |

The PDF and build manifest are regenerated on every `npm run venture:build`; their current hashes are recorded in `build-manifest.json`.

## Commands and results

| Command | Result |
|---|---|
| `node scripts/build-venture-deck.mjs` | PASS: 13 slides, 13-page PDF |
| `node media/projects/venture-deck/build-standalone.mjs` | PASS: 13 slides, 375,600 bytes |
| `node media/projects/venture-deck/validate-standalone.mjs` | PASS: embedded fonts, images and evidence; four-color palette; no network requests; no overflow; keyboard navigation |
| `node scripts/validate-venture-deck.mjs` | PASS: includes the new standalone drift check, the risk headline, the three owner fields, the projected-72.4% rule and the retired-wording check on slides 1–12 |

## Preserved gates

- Exactly three `[OWNER DECISION]` fields remain on slide 13.
- Exact risk headline: “One 30-path panel. One chemistry family. Not peer-reviewed.”
- No cost figure appears outside the owner’s financing slide.
- 72.4% appears only on slide 7, labelled projected, with no new DFT and its four-separate-runs baseline.
- All 13 locked deck asset hashes and dimensions match `asset-lock.json`.
