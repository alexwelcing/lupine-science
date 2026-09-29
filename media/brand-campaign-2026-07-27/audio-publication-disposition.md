# Campaign film audio publication disposition

Implementation task: `t_11f2838e` (reviewed proposal: `t_480f288e`)

Decision: **QUARANTINED — NEEDS VERIFICATION**

The ten MP4s formerly under `public/videos/campaign-2026-07-27/` now live with their render and QA evidence under `media/brand-campaign-2026-07-27/quarantine/`. They remain uncleared for publication, with no inferred narration timelines or approval. This task did not add VTT files, delete media, publish, or deploy.

## Reviewed evidence and unresolved conflict

- `media/brand-campaign-2026-07-27/quarantine/video-manifest.json` records the five originals as editorially rejected and superseded by immutable QA-attempt replacements.
- `media/brand-campaign-2026-07-27/final-acceptance-manifest.json` is retained as provenance for an earlier acceptance record covering the five replacements.
- `media/brand-campaign-2026-07-27/qa/video-qa-evidence.json` records all five replacements as failed, not wiring-eligible, and permanently excluded from wiring.

The acceptance and exclusion records conflict. This proposal does not resolve that conflict by inference. It preserves `needs-verification` and fails closed.

## Exact disposition

| File | Role | State | Action |
|---|---|---|---|
| `01-z1-union-verdict.mp4` | superseded original | needs-verification | quarantined |
| `01-z1-union-verdict-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantined |
| `02-savings-stack.mp4` | superseded original | needs-verification | quarantined |
| `02-savings-stack-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantined |
| `03-trust-layer.mp4` | superseded original | needs-verification | quarantined |
| `03-trust-layer-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantined |
| `04-order-of-effort.mp4` | superseded original | needs-verification | quarantined |
| `04-order-of-effort-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantined |
| `05-materials-for-society.mp4` | superseded original | needs-verification | quarantined |
| `05-materials-for-society-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantined |

The machine-readable contract at `audio-publication-disposition.json` binds every file and evidence source by SHA-256.

## Delivery result

The deployable `public/` tree contains none of these ten films. Their exact bytes, SHA-256 records, historical acceptance record, later exclusion record, probe report, contact sheets, and renderer output references remain repository-relative and recoverable in the non-public evidence archive. Publication intent remains `needs-verification`.
