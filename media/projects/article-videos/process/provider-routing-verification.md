# Sol–Fable provider routing verification

Verified: 2026-07-10T13:39:46-04:00

## Result

All required routes are live and returned successful model inference through the profile configured for that role.

| Role | Hermes profile | Provider | Model | OAuth credential | Smoke response | Session |
|---|---|---|---|---|---|---|
| Rapid iteration / animator | `animator` | `openai-codex` | `gpt-5.6-sol` | one `device_code` OAuth credential | `SOL_ANIMATOR_ROUTE_OK` | `20260710_133856_bed7f4` |
| High-bar art direction | `artdirector` | `anthropic` | `claude-fable-5` | one OAuth `ANTHROPIC_TOKEN` credential | `FABLE_ARTDIRECTOR_ROUTE_OK` | `20260710_133915_43d0dc` |
| High-bar gate review | `reviewer` | `anthropic` | `claude-fable-5` | one OAuth `ANTHROPIC_TOKEN` credential | `FABLE_REVIEWER_ROUTE_OK` | `20260710_133934_2a3ffc` |

No credential values were printed or recorded.

## Commands used

```sh
hermes profile show animator
hermes profile show artdirector
hermes profile show reviewer
hermes -p animator auth list openai-codex
hermes -p artdirector auth list anthropic
hermes -p reviewer auth list anthropic
hermes -p animator chat -Q -t safe -q '...SOL_ANIMATOR_ROUTE_OK...'
hermes -p artdirector chat -Q -t safe -q '...FABLE_ARTDIRECTOR_ROUTE_OK...'
hermes -p reviewer chat -Q -t safe -q '...FABLE_REVIEWER_ROUTE_OK...'
```

## Routing contract

- Assign rapid prototyping, implementation, deterministic motion, test construction, and detailed-spec clearing to `animator` / Sol.
- Assign concept bar-setting and visual-requirement refinement to `artdirector` / Fable.
- Assign independent acceptance review and the final `APPROVE` / `REVISE` verdict to `reviewer` / Fable.
- The `director` owns scope, resolves deadlock, and may stop or override the loop with a written rationale.

## Recheck procedure

Before a consequential challenge loop, run the three exact-token smoke tests again. A route passes only when profile inspection names the expected provider/model, `auth list` reports an OAuth credential, the query exits 0, and the expected token is returned. Do not continue on a fallback model silently; record and resolve the route mismatch first.
