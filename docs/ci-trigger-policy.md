# CI trigger policy

The August 2026 CI-noise audit made `CI` run on pull requests and pushes to `main` only. Previously every same-repository pull request produced both a branch-push run and a pull-request run for the same head SHA, which in turn launched duplicate `workflow_run` deployment gates.

`Lupine Science CI / Cloudflare Pages` now admits only successful `main` pushes and successful, same-repository, human-authored pull requests. Fork and bot pull requests still receive uncredentialed CI, but do not run Lighthouse/deploy jobs with repository deployment credentials. Production remains protected by the release-certification and named-owner environment gates.
