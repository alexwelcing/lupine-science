# Campaign film audio publication disposition

Task: `t_480f288e`

Decision: **QUARANTINE PROPOSED — NEEDS VERIFICATION**

The ten MP4s under `public/videos/campaign-2026-07-27/` are not cleared for publication by this task. They have no same-basename narration VTT files and therefore fail the recursive audio release gate closed. This task does not add VTT files, delete media, publish, or deploy.

## Reviewed evidence and unresolved conflict

- `public/videos/campaign-2026-07-27/video-manifest.json` records the five originals as editorially rejected and superseded by immutable QA-attempt replacements.
- `media/brand-campaign-2026-07-27/final-acceptance-manifest.json` is retained as provenance for an earlier acceptance record covering the five replacements.
- `media/brand-campaign-2026-07-27/qa/video-qa-evidence.json` records all five replacements as failed, not wiring-eligible, and permanently excluded from wiring.

The acceptance and exclusion records conflict. This proposal does not resolve that conflict by inference. It preserves `needs-verification` and fails closed.

## Exact disposition

| File | Role | State | Proposed action |
|---|---|---|---|
| `01-z1-union-verdict.mp4` | superseded original | needs-verification | quarantine |
| `01-z1-union-verdict-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantine |
| `02-savings-stack.mp4` | superseded original | needs-verification | quarantine |
| `02-savings-stack-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantine |
| `03-trust-layer.mp4` | superseded original | needs-verification | quarantine |
| `03-trust-layer-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantine |
| `04-order-of-effort.mp4` | superseded original | needs-verification | quarantine |
| `04-order-of-effort-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantine |
| `05-materials-for-society.mp4` | superseded original | needs-verification | quarantine |
| `05-materials-for-society-qa-attempt-1.mp4` | QA replacement with conflicting review records | needs-verification | quarantine |

The machine-readable contract at `audio-publication-disposition.json` binds every file and evidence source by SHA-256.

## Delivery-gate proposal

A separate feature branch and PR should remove these ten MP4s from the deployable `public/` tree or move them to a non-public evidence archive, preserve the source and QA records, rerun the repository-owned recursive audio gate, and release the strict all-PASS closure task only after required CI and reviewer-agent checks are green. No deletion or deployment is authorized here.
