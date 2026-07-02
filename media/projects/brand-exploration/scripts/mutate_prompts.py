#!/usr/bin/env python3
"""Generate the next prompt loop from a gallery shortlist JSON export.

Usage:
  1. In renders/gallery.html, click "Copy shortlist JSON" and save it to shortlist.json.
  2. python3 scripts/mutate_prompts.py shortlist.json > storyboard_next.yaml
  3. Review, then generate the next batch with MiniMax.
"""
import json
import pathlib
import random
import sys

PROJECT = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_STORYBOARD = PROJECT / "storyboard.yaml"

MODIFIERS = {
    "closer": "extreme close-up, the ribbon fills the frame, luminous indigo core against warm paper",
    "wider": "very wide framing, the motif sits small in a vast paper field, overwhelming negative space",
    "darker-ink": "deeper ink #16171d shadows, higher contrast, dramatic chiaroscuro",
    "more-paper": "almost entirely warm empty paper, only a whisper of the motif in one corner",
    "with-lattice": "a faint crystalline atomic lattice emerging behind the main motif",
    "with-glyphs": "tiny digital glyphs and pixel fragments dissolving around the edges",
    "motion-blur": "gentle horizontal motion blur, cinematic streak, dynamic energy",
    "double-exposure": "two overlapping translucent motifs, ghostly layered indigo forms",
    "vertical": "vertical composition, the ribbon rises from bottom to top like a column",
    "noir": "only ink and indigo, no warm paper, high-contrast duotone",
}


def next_prompts(shortlist_path: pathlib.Path):
    data = json.loads(shortlist_path.read_text())
    if not data:
        print("# Empty shortlist — no mutations generated.", file=sys.stderr)
        return []

    # Weight by average score.
    weighted = []
    for item in data:
        r = item.get("rating", {})
        avg = (r.get("palette", 3) + r.get("composition", 3) + r.get("onbrand", 3) + r.get("hero", 3)) / 4
        weighted.append((avg, item))
    weighted.sort(key=lambda x: x[0], reverse=True)

    # Take top 60% as parents.
    n_parents = max(1, len(weighted) * 6 // 10)
    parents = [item for _, item in weighted[:n_parents]]

    next_batch = []
    seen = set()
    for item in parents:
        base = item.get("prompt", "").split(";")[0].strip()
        motif_id = item.get("motif_id", "exploration")
        variant_id = item.get("variant_id", "parent")
        # generate 2 children per parent
        for _ in range(2):
            mod_key, mod = random.choice(list(MODIFIERS.items()))
            prompt = f"{base}; {mod}"
            if prompt in seen:
                continue
            seen.add(prompt)
            next_batch.append({
                "motif_id": motif_id,
                "parent_variant": variant_id,
                "modifier": mod_key,
                "aspect": item.get("aspect", "16:9"),
                "prompt": prompt,
                "status": "pending",
            })
    return next_batch


def main():
    shortlist = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else PROJECT / "shortlist.json"
    batch = next_prompts(shortlist)
    if not batch:
        return

    print("# Next-generation prompts derived from gallery shortlist")
    print("# Copy these into storyboard.yaml scenes and regenerate with MiniMax.\n")
    print("next_batch:")
    for item in batch:
        print(f"  - motif_id: {item['motif_id']}")
        print(f"    parent_variant: {item['parent_variant']}")
        print(f"    modifier: {item['modifier']}")
        print(f"    aspect: \"{item['aspect']}\"")
        print(f"    prompt: |\n      {item['prompt']}")
        print(f"    status: pending")


if __name__ == "__main__":
    main()
