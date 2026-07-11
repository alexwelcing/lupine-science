# Article video file naming and versioning

This convention is the source of truth for article-video render artifacts.

## Canonical identifiers

Each video has one stable `<slug>` copied exactly from its article URL. Slugs use lowercase ASCII letters, numbers, and single hyphens only; do not use spaces, underscores, dates, or revision labels such as `final`.

Example: the article at `/articles/cement-concrete-and-the-weight-of-the-built-world/` uses `cement-concrete-and-the-weight-of-the-built-world`.

## Published file name

Name every versioned MP4:

```text
<slug>-v<major>.<minor>.mp4
```

Example:

```text
cement-concrete-and-the-weight-of-the-built-world-v1.0.mp4
```

Use unpadded decimal version numbers in the file name. Do not overwrite an existing versioned MP4; increment the version and write a new file.

## Render directory

Store renders by slug and zero-padded major version:

```text
renders/<slug>/vNN/
```

`NN` is the two-digit major version (`v01`, `v02`, and so on). Minor revisions for that major live together in the same directory.

```text
renders/
└── cement-concrete-and-the-weight-of-the-built-world/
    ├── CHANGELOG.md
    ├── v01/
    │   ├── cement-concrete-and-the-weight-of-the-built-world-v1.0.mp4
    │   └── cement-concrete-and-the-weight-of-the-built-world-v1.1.mp4
    └── v02/
        └── cement-concrete-and-the-weight-of-the-built-world-v2.0.mp4
```

Optional sidecars use the same versioned stem, for example `...-v1.1.vtt`, `...-v1.1-poster.jpg`, and `...-v1.1-review.json`.

## When to increment

- Increment **minor** for a correction that preserves the approved story and duration envelope: copy fixes, caption corrections, audio-level adjustments, encoding changes, or small timing/visual polish. Example: `v1.0` to `v1.1`.
- Increment **major** for a materially new editorial cut: changed narration or structure, replaced argument/evidence, substantial scene redesign, new aspect ratio as a separate master, or a re-cut requiring renewed director approval. Reset minor to zero. Example: `v1.3` to `v2.0`.
- Start the first reviewable render at `v1.0`. Exploratory outputs that are not reviewable remain scratch artifacts and must not use canonical version names.

A re-encode for web delivery is normally a minor version when it replaces the delivery master. If multiple delivery variants must coexist, add a controlled suffix after the versioned stem (for example `-web-720p`), while retaining the canonical version in the name.

## Changelog

Every video has exactly one append-only changelog at:

```text
renders/<slug>/CHANGELOG.md
```

Copy `templates/video-changelog-template.md` when creating a video. Add the newest release entry first. Each entry records:

- version and ISO date;
- status (`review`, `approved`, `published`, or `superseded`);
- output file path;
- concise changes since the preceding version;
- verification performed;
- approver or review reference when applicable.

Never delete old entries or rename released files. Mark a bad release as superseded and issue the next version.

## Publication

Versioned files under `renders/` are production records. A publishing step may copy the approved render to a stable website URL such as `public/videos/<slug>.mp4`; that unversioned copy is an alias, not the production record. Its changelog entry must identify the exact version that was published.

## Release checklist

1. Confirm the slug matches the article URL.
2. Choose the next version from `renders/<slug>/CHANGELOG.md`.
3. Render to the matching `vNN/` directory with the canonical file name.
4. Run media and editorial QA; do not overwrite prior output.
5. Add a changelog entry, newest first.
6. After approval, copy the selected version to the stable publication alias and mark it `published` in the changelog.
