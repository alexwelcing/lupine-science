# Proof-pack golden files

These files pin the reviewed PDF byte hash and `pdftotext -layout` output for the representative proof pack.

When an intentional template, content, font, or renderer change alters the PDF:

1. Run `npm run proofpack:update-goldens`.
2. Review the generated PDF in `public/proof-packs/` and both golden-file diffs.
3. Commit the baseline changes with the implementation change.

Do not update the baselines merely to make a failing test pass.
