# Venture deck verification

The current verification record is [`validation-report.md`](validation-report.md) (2026-11-11).

The July 2026 end-to-end verification log that used to live here documented a superseded build of the deck: its slide text, source footers and validator output no longer describe the deck, and several of the figures it checked for have since been retired (see `docs/messaging-canon.md` and lupine.science/corrections/). It remains in git history.

To verify the current deck:

```sh
npm run venture:build
npm run venture:validate
node media/projects/venture-deck/build-standalone.mjs
node media/projects/venture-deck/validate-standalone.mjs
```
