# Five Materials v3 — independent Fable review

Reviewed: 2026-07-13
Reviewer role: Fable (`reviewer`)
Animator card: `t_b001d1d3`
Candidate: `renders/five-materials-v3-review-1080p.mp4`
SHA-256: `c07824bf7c33b3c033152d3a7f85a4cabf34d447a7dc389514fa9fd3e98784f5`

## Decision

**REVISE — visual frame gate passes, but the canonical publication-evidence persistence gate fails.**

The 66-frame independent scorecard is at `evidence/reviewer-independent-scorecard-v3.tsv`. All 66 decoded samples pass the ten binary criteria with a minimum score of 9/10. No blank, identity-only, low-opacity focal, collision, clipping, ghosting, or below-7 frame was found.

## Independent verification

- Master SHA-256 matches the handoff exactly.
- ffprobe: H.264 1920×1080 at 30 fps, 2772 frames; AAC audio; 92.437333 s.
- Independent full-stream decode: PASS.
- Package integrity verifier: PASS (`frames=66`, `sheets=6`, manifest hash binding correct).
- Raw HyperFrames evidence reads 0 errors / 0 warnings / 0 findings for lint, validate, and strict inspect.
- Caption evidence records 19 monotonic, non-overlapping cues and no misspellings after documented domain exceptions.
- All six contact sheets and all 66 full-resolution decoded JPEGs were inspected.

## Exact-risk findings

- 0.100 s — PASS 9/10: substantive opening title card; not blank or identity-only.
- 48.000 s — PASS 10/10: body copy and lower rail are unobscured; no wipe/rule/card occlusion.
- 49.700 s — PASS 10/10: principal headline is fully opaque and crisp; no ghosting and no `≈50×`/chart collision.
- 75.000 s — PASS 10/10: formula/body copy and candidate diagram remain separated and legible.
- 80.000 s — PASS 10/10: formula/body copy and candidate diagram remain separated and legible.
- 84.000 s — PASS 10/10: candidate C is fully opaque; its box is distinct from the horizontal rule and spatially separated from `REFUSED`.
- 92.200 s — PASS 9/10: final end card is complete, fully opaque, stable, and collision-free.

## Blocking persistence finding

The playbook requires the package to be committed on the reviewed branch, and the directive says a kanban/local path without repository persistence fails evidence. On branch `article-videos/t_b001d1d3`, `git ls-files` confirms:

- tracked: `index.html`, `captions/five-materials.en.vtt`;
- **not tracked:** `renders/five-materials-v3-review-1080p.mp4`;
- **not tracked:** `review-frames-v3/manifest.tsv` and decoded review set;
- **not tracked:** `evidence/lint-v3.json` and the v3 evidence package.

The worktree also has modified source plus untracked v3 artifacts. Therefore the repository is not yet the durable source of truth required by `docs/video-review-playbook.md` lines 9–11 and 67–69, and `reviews/p0-unblock-directive.md` §1 lines 17–23.

## Re-entry requirement

Persist the exact reviewed candidate and evidence on `article-videos/t_b001d1d3` without changing the master bytes (SHA-256 must remain `c07824bf7c33b3c033152d3a7f85a4cabf34d447a7dc389514fa9fd3e98784f5`). Then request a repository-presence recheck. If any candidate byte or decoded frame changes, a full 66-frame re-review is required.
