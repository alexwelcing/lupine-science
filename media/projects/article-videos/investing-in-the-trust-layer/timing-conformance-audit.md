# Investing in the Trust Layer — 30 fps timing conformance audit

Status: reconformed for director review  
Production source: `audio/final-mix.wav` (115.368s, preserved in full)  
Composition: 3,510 frames at 30 fps = 117.000s  
Frame policy: scene boundaries are exact integer frames; narration cue starts round down and cue ends round up so no spoken phoneme is excluded. WebVTT retains measured millisecond word timing for subtitle sync.

## Seven-beat master timeline

| Beat | Frame range | Time range | Frames | Visual concept |
|---:|---:|---:|---:|---|
| 01 | F0000–F0422 | 0.000–14.100s | 423 | The scarce resource |
| 02 | F0423–F0969 | 14.100–32.333s | 547 | The trust bottleneck |
| 03 | F0970–F1347 | 32.333–44.933s | 378 | Where Lupine sits |
| 04 | F1348–F2090 | 44.933–69.700s | 743 | Three defensible pillars |
| 05 | F2091–F2556 | 69.700–85.233s | 466 | Proof must say no |
| 06 | F2557–F3133 | 85.233–104.467s | 577 | Compounding value, honest risk |
| 07 | F3134–F3509 | 104.467–117.000s | 376 | Investment thesis + outro |

Transitions are embedded inside these windows: a 12-frame indigo tracer traverses the outgoing scene at F411–422, F958–969, F1336–1347, F2079–2090, F2545–2556, and F3122–3133, followed by a single-frame scene cut. The outgoing scene therefore clears before the incoming scene becomes readable. The paper fade/outro settle completes by F3449. No transition duration is added to the 3,510-frame master.

## Measured phrase cue table

| Cue | Inclusive source-safe frame window | Time window | Caption phrase |
|---:|---:|---:|---|
| 01 | F0000–F0116 | 0.000–3.900s | AI can generate millions of possible materials, simulate them in microseconds, |
| 02 | F0117–F0194 | 3.900–6.500s | and send robots to synthesize them around the clock. |
| 03 | F0217–F0246 | 7.233–8.233s | So what is scarce now? |
| 04 | F0267–F0282 | 8.900–9.433s | Not ideas. |
| 05 | F0304–F0323 | 10.133–10.800s | Not compute. |
| 06 | F0345–F0398 | 11.500–13.300s | The scarce resource is believing the result. |
| 07 | F0423–F0525 | 14.100–17.533s | Google DeepMind reported 380,000 stable crystal predictions. |
| 08 | F0549–F0684 | 18.300–22.833s | By late 2023, only 736 had been independently synthesized. |
| 09 | F0700–F0759 | 23.333–25.333s | That is zero point two percent. |
| 10 | F0759–F0826 | 25.300–27.567s | Every false positive wastes lab weeks. |
| 11 | F0845–F0944 | 28.167–31.500s | Every false negative can bury a climate material we needed yesterday. |
| 12 | F0970–F1073 | 32.333–35.800s | Lupine sits between prediction and synthesis—not replacing generators or |
| 13 | F1073–F1124 | 35.767–37.500s | simulators, but checking their work. |
| 14 | F1146–F1259 | 38.200–42.000s | It measures systematic model error, corrects that error at runtime, and proves |
| 15 | F1259–F1325 | 41.967–44.200s | which claims a laboratory can actually trust. |
| 16 | F1347–F1382 | 44.900–46.100s | The moat has three parts. |
| 17 | F1407–F1516 | 46.900–50.567s | First: a measured error field, anchored by standard observables—not another |
| 18 | F1516–F1592 | 50.533–53.100s | neural net that needs retraining for every material. |
| 19 | F1611–F1744 | 53.700–58.167s | Second: 77 build-locked Lean 4 theorems, with zero unproven shortcuts. |
| 20 | F1774–F1897 | 59.133–63.267s | Third: a LAMMPS runtime overlay that works beside tools like C-H-G net and MACE. |
| 21 | F1920–F1999 | 64.000–66.667s | Today, it adds 15.6 percent overhead. |
| 22 | F2018–F2075 | 67.267–69.200s | Compiled, the target is below one percent. |
| 23 | F2091–F2150 | 69.700–71.700s | And the proof layer is not decorative. |
| 24 | F2177–F2300 | 72.567–76.700s | Lean once rejected a claim that passed statistical filtering, changing 27 |
| 25 | F2300–F2327 | 76.667–77.600s | successes to 26. |
| 26 | F2347–F2456 | 78.233–81.900s | That is the product in miniature: trustworthy infrastructure has to catch its |
| 27 | F2456–F2536 | 81.867–84.567s | own mistakes—and say no when the evidence does not hold. |
| 28 | F2557–F2624 | 85.233–87.500s | Each screening campaign adds measured bias data. |
| 29 | F2647–F2702 | 88.233–90.100s | Each experiment tightens the next prediction. |
| 30 | F2725–F2784 | 90.833–92.833s | Each theorem expands the verified boundary. |
| 31 | F2807–F2889 | 93.567–96.333s | What is proven today is the field for face-centered-cubic metals. |
| 32 | F2915–F3027 | 97.167–100.933s | Extending it to other crystal families—and securing industrial validation—is |
| 33 | F3027–F3052 | 100.900–101.767s | still work ahead. |
| 34 | F3073–F3115 | 102.433–103.867s | That honesty is part of the moat. |
| 35 | F3134–F3196 | 104.467–106.567s | So this is not a bet on one magic material. |
| 36 | F3215–F3318 | 107.167–110.633s | It is a bet on the trust layer that makes discovery more capital-efficient: |
| 37 | F3318–F3426 | 110.600–114.233s | fewer predictions, better defended, reaching the lab before the climate window |
| 38 | F3426–F3436 | 114.200–114.567s | closes. |

## Terminal hold audit

- Last measured word ends at 114.540s; source-safe rounded end is F3437 / 114.567s.
- CTA and canonical outro settle no later than F3450 / 115.000s.
- Frames F3450–F3509 are the untouched end card: exactly 60 frames / 2.000s.
- The complete 115.368s approved final mix remains mounted from 0.000s without trim, time compression, or truncation.
- Review deliverables: `renders/investing-in-the-trust-layer-v3-review-1080p.mp4` and `captions/investing-in-the-trust-layer.vtt`.

## v3 encoded-review verification

- Fresh source render: `renders/investing-in-the-trust-layer-v3-source.mp4`, produced from the checked-in Hyperframes composition after the opening-visibility and transition-collision fixes.
- Director candidate: `renders/investing-in-the-trust-layer-v3-review-1080p.mp4`, H.264/AAC, 1920×1080, 30/1 fps, 117.000s, exactly 3,510 video frames (`evidence/ffprobe-v3.json`).
- Full decode completed without ffmpeg errors (`evidence/full-decode-v3.log`).
- WebVTT validation passed: 38 monotonic, non-overlapping cues; final cue ends at 114.540s (`evidence/vtt-validation-v3.txt`).
- Decoded opening checks at F0000 and F0003 contain the canonical Lupine mark plus trust-layer/proof text (`contact-sheets-v3/contact-sheet-v3-01.jpg`).
- Exact transition samples at F0417, F0963, F1341, and F3126 show only the outgoing readable scene; the amber tracer is constrained to the empty 178px band and crosses no copy (`evidence/directive-keyframes-v3.jpg`).
- The review encode explicitly clones the settled F3449 end card into F3450–F3509. All 60 decoded video frames have one raw-pixel MD5 (`a96c7ffaa51a419aebcce9624626844d`) in `evidence/final-hold-all-60-framemd5-v3.txt` and `evidence/final-hold-all-60-summary-v3.json`; representative PNG identity is recorded in `review-frames-v3/hold-identity.json`.
- Candidate SHA-256: `2be0b12c290973fc74a4b3f7354780358c77dead4e09bf6c4656fc9f5942fb29` (`evidence/sha256-v3.txt`).
- Strict Hyperframes lint, validate, and inspect checks pass with zero errors; animator self-score average is 9.066/10 across all 137 decoded review points (`evidence/lint-v3.log`, `evidence/validate-v3.log`, `evidence/inspect-strict-v3.log`, `review/animator-self-score-v3.csv`).
