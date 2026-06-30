# Lupine Science — Media Workspace

This directory is the production home for all Lupine Science media: video, image, audio, and copy. It is separate from the deploy root (`public/`) so that creative iteration and large binaries do not bloat the site repository.

## How to work here

1. **Start a project** with the Hermes `lupine-media-director` skill.
2. **Write the brief** in `projects/<slug>/brief.md`.
3. **Approve the treatment** in `projects/<slug>/treatment.md`.
4. **Lock the plan** in `projects/<slug>/storyboard.yaml`.
5. **Generate assets** using the skill's MiniMax client and local tools.
6. **Assemble and review** rough cuts in `projects/<slug>/renders/`.
7. **Deliver** finals to `public/` only when ready for the site.

## Directory layout

```
media/
├── README.md
└── projects/
    └── launch-video/
        ├── brief.md
        ├── treatment.md
        ├── storyboard.yaml
        ├── assets/
        │   ├── images/
        │   ├── video/
        │   ├── narration/
        │   └── music/
        └── renders/
```

## Skill

The `lupine-media-director` Hermes skill lives at `~/.hermes/skills/lupine-media-director/` and defines the director persona, workflow, brand constants, quality rubric, and helper scripts.
