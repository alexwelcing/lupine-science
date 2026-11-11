# Lupine Science — media workspace

Production sources for Lupine Science media: images, films, narration,
booklets and share cards. It is separate from the deploy root (`public/`) so
that iteration and large binaries do not bloat the site.

## Rules

- Commit only sources and assets that a published page uses, under neutral
  names. Raw generations, exploration galleries and review exhaust stay out of
  this public repository.
- No local machine paths, host names, credential locations or agent rosters
  in committed files.
- Narration and on-screen text follow `docs/messaging-canon.md`. AI-generated
  imagery and synthetic narration are disclosed on the pages that use them.
- Deliver finals to `public/` only when ready for the site.

## Layout

```
media/
├── README.md
├── og/            share-card source (scripts/build-og-image.mjs)
├── booklets/      booklet sources
└── projects/      per-project sources (article visuals, films, venture deck)
```
