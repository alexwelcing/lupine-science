# Scientific source policy for proof packs

Proof packs are evidence bundles, not promotional collateral. Every scientific or quantitative claim must trace to a bibliography entry that is independently inspectable.

## Admissible source classes

1. **Peer-reviewed literature.** Journal or refereed conference papers with a DOI. A DOI is required in the manifest and is normalized to `https://doi.org/...`.
2. **Government and intergovernmental agencies.** Primary reports, datasets, standards, or regulations published by an agency on an approved official domain (for example, `epa.gov`, `nist.gov`, `energy.gov`, `ipcc.ch`, `unep.org`, `who.int`, or `iea.org`).
3. **Recognized research institutions.** Primary research outputs, datasets, or technical reports on an approved institutional domain (for example, `nrel.gov`, `ornl.gov`, `anl.gov`, `pnnl.gov`, `lbl.gov`, `usgs.gov`, `cern.ch`, or `rsc.org`).

The validator's domain allowlists are deliberately narrow and live in `scripts/validate-proofpack.mjs`. Adding a domain is a policy change and requires review; redirects, mirrors, aggregators, and URL shorteners do not inherit credibility from the underlying work.

## Rejected sources

- Lupine Science pages, repositories, ledgers, documents, staff-authored material, or other self-citations. Internal artifacts may appear under methodology or audit links, but never as bibliography evidence for a scientific claim.
- Company marketing, press releases, trade-group advocacy, analyst estimates, news articles, blogs, social posts, AI-generated summaries, and citation aggregators when used as scientific evidence.
- A paper title or journal name without an inspectable DOI.

## Exceptions

A source outside the three admissible classes may be recorded only as `type: "exception"`. It must include a concrete `exceptionJustification` explaining why no admissible primary source can support the limited claim and what the source is used for. The validator always emits a warning for an exception, even when justified, so publication review cannot silently bless it. Exceptions cannot override the self-citation ban.

Examples of potentially defensible exceptions are a standards body's normative specification or a vendor datasheet used only to document that vendor's stated product specification. "Useful background," convenience, or recency is not sufficient.

## Review contract

- Zero validator errors is required before publishing a proof pack.
- Every warning must be reviewed and documented in the pull request or publication record.
- Validation is structural and policy-based; it does not prove that a cited source supports the claim. Reviewers must still check claim-to-source fit, dates, versions, and quoted values.
