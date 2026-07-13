# Computed typography inventory

Google Chrome computed styles after seeking the paused GSAP timeline; visibility includes ancestor opacity and canvas intersection.

| Selector | Sample | Floor | Computed minimum | Visible nodes | Result |
|---|---:|---:|---:|---:|---|
| `.domain` | 11.2 | 36 px | 36 px | 7 | PASS |
| `.env` | 24.0 | 36 px | 36 px | 4 | PASS |
| `.rail b` | 40.0 | 36 px | 36 px | 3 | PASS |
| `.candidate` | 40.0 | 36 px | 36 px | 6 | PASS |
| `.queue` | 43.0 | 36 px | 36 px | 1 | PASS |
| `.hub` | 58.0 | 36 px | 36 px | 1 | PASS |
| `.spoke` | 58.0 | 36 px | 36 px | 5 | PASS |
| `.stage` | 78.4 | 36 px | 36 px | 3 | PASS |
| `.proof` | 92.8 | 36 px | 36 px | 3 | PASS |
| `.source` | 78.4 | 36 px | 36 px | 1 | PASS |
| `.deck` | 78.4 | 48 px | 48 px | 1 | PASS |
| `.caption-safe` | 78.4 | 48 px | 48 px | 1 | PASS |
| `.outro p` | CSS fixture | 48 px | 48 px | 0 | PASS |
| `.small` | CSS fixture | 36 px | 36 px | 0 | PASS |
| `.outro-cta` | outro sub-composition | 48 px | 72 px | 1 | PASS |
| `.outro-destination` | outro sub-composition | 36 px | 36 px | 1 | PASS |
| `.outro-proof-label` | outro sub-composition | 36 px | 36 px | 1 | PASS |
| `.outro-wordmark` | outro sub-composition | 48 px | 88 px | 1 | PASS |

Overall: PASS (0 failures).
