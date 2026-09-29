# Savings Stack v1 — data & reproduction pack

Released 2026-07-21 alongside the booklet *The Savings Stack* (lupine.science).
Full scientific detail: library.lupine.science, group `savings-stack`.

## Contents

- `savings-techniques-synthesis-2026-07-21.md` — the synthesis chapter: seven
  savings layers, the measured union-anchor economics, the theorem commons.
- Seven subdomain digests: `savings-surrogate-neb.md`,
  `savings-active-learning.md`, `savings-delta-multifidelity.md`,
  `savings-abstention-economics.md`, `savings-dft-systems.md`,
  `savings-electronic-surrogates.md`, `savings-path-sampling-algorithms.md`.
- Two backdrop pieces: `supercomputing-atomistic-history.md`,
  `research-compute-resourcing.md`.
- `z1-union-anchor-economics.json` — machine-readable union-anchor record
  (558 naive vs 154 union anchors across 29 analyzable paths; 72.4% fewer
  evaluations, 3.62×), with `.sha256` sidecar.
- `z1-union-anchor-economics.md` — the durable analysis note (method,
  reconciliation of the retracted 624/132 figures, scaling table).
- `union_anchor_economics.py` — the reproducible analysis script.
- `citation-verification-2026-07-21.md` — identifier audit: 115/115 arXiv,
  48/48 DOI verified.
- `MANIFEST.sha256` — sha256 of every file in the pack.

## License

Structured data in this pack is released under the Open Data Commons Open
Database License 1.0 (ODbL-1.0, https://opendatacommons.org/licenses/odbl/1-0/),
mirroring `LICENSE-DATA.md` in the source repository. Prose chapters are
covered by the repository's content license; the analysis script by its code
license. Third-party literature cited inside the digests retains its original
notices and licenses.

## Reproducing the record

From a checkout of `lupine-rhizo` (or with the inputs from the GCS buckets
named in the script), recompute the union-anchor record byte-for-byte:

    python3 union_anchor_economics.py \
      --local /path/to/inputs \
      --out z1-union-anchor-economics.json \
      --recorded-at "2026-07-21T04:05:14.724456+00:00"

The pinned `--recorded-at` reproduces this pack's JSON exactly;
`sha256sum -c z1-union-anchor-economics.json.sha256` then verifies OK.
Omitting the flag stamps the current time (new runs, new hash, same math).
