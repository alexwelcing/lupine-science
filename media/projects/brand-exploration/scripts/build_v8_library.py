#!/usr/bin/env python3
"""Build a standalone HTML library page for the v8 abstract asset corpus."""
from __future__ import annotations

import json
import pathlib
import re

PROJECT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = PROJECT / "assets" / "images" / "v8"
OUT = PROJECT / "renders" / "library_v8.html"


def parse(name: str):
    m = re.match(r"(.+)_(wide|square|quiet)_v8\.jpg", name)
    if not m:
        return None
    motif, variant = m.groups()
    motif = motif.replace("-", " ").title()
    aspect = "1:1" if variant == "square" else "16:9"
    return {
        "filename": f"assets/images/v8/{name}",
        "motif": motif,
        "variant": variant,
        "aspect": aspect,
    }


def main():
    images = sorted([parse(p.name) for p in ASSETS.glob("*.jpg") if parse(p.name)], key=lambda x: (x["motif"], x["variant"]))

    cards = []
    for img in images:
        cards.append(
            f'''<figure class="card" data-aspect="{img['aspect']}">
  <img src="{img['filename']}" alt="{img['motif']} — {img['variant']}">
  <figcaption>
    <strong>{img['motif']}</strong>
    <span>{img['variant']} · {img['aspect']}</span>
  </figcaption>
</figure>'''
        )

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lupine Science — Brand Asset Library (v8)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --paper: #faf9f6; --paper-deep: #f2efe7;
      --ink: #16171d; --ink-soft: #4c4e58; --ink-faint: #6e707a;
      --indigo: #3d4db3; --indigo-deep: #2e3a87; --indigo-wash: rgba(61,77,179,0.08);
      --rule: #e2dfd4; --rule-soft: #ece9e0;
      --serif: "Newsreader", Georgia, serif;
      --mono: "IBM Plex Mono", ui-monospace, monospace;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: var(--serif); background: var(--paper); color: var(--ink);
      font-size: 16px; line-height: 1.6;
      -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
    }}
    header {{
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between; gap: 24px;
      padding: 18px clamp(20px, 5vw, 64px);
      background: rgba(250,249,246,0.92); backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--rule-soft);
    }}
    .brand {{ display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; }}
    .brand b {{ font-weight: 600; font-size: 16px; }}
    .brand span {{ font-family: var(--mono); font-size: 10.5px; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.06em; }}
    main {{ max-width: 1600px; margin: 0 auto; padding: clamp(40px, 8vh, 80px) clamp(20px, 5vw, 64px); }}
    h1 {{ font-size: clamp(32px, 5vw, 56px); font-weight: 400; letter-spacing: -0.02em; margin-bottom: 8px; }}
    h1 em {{ font-style: italic; color: var(--indigo); }}
    .lede {{ color: var(--ink-soft); font-size: 18px; max-width: 75ch; margin-bottom: 40px; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 28px;
    }}
    .card {{
      background: rgba(255,255,255,0.5); border: 1px solid var(--rule); border-radius: 8px;
      overflow: hidden;
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }}
    .card:hover {{ transform: translateY(-3px); box-shadow: 0 18px 42px rgba(22,23,29,0.08); border-color: var(--indigo); }}
    .card img {{ display: block; width: 100%; aspect-ratio: 16/9; object-fit: cover; background: var(--paper-deep); }}
    .card[data-aspect="1:1"] img {{ aspect-ratio: 1/1; }}
    .card figcaption {{
      padding: 14px 16px;
      display: flex; justify-content: space-between; align-items: baseline;
      font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
    }}
    .card figcaption strong {{ font-family: var(--serif); font-size: 15px; font-weight: 500; text-transform: none; letter-spacing: 0; }}
    .card figcaption span {{ color: var(--ink-faint); }}
    .stats {{
      margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--rule);
      font-family: var(--mono); font-size: 12px; color: var(--ink-soft);
    }}
  </style>
</head>
<body>
  <header>
    <a class="brand" href="/" aria-label="Lupine Science">
      <b>Lupine Science</b>
      <span>Brand Asset Library</span>
    </a>
  </header>
  <main>
    <h1>Abstract asset library <em>v8.</em></h1>
    <p class="lede">Twenty-four visually captivating brand textures, strokes, shadows, and geometries. All locked to the warm-paper + indigo palette, with no research anchoring — ready for articles, decks, social cards, and campaigns.</p>
    <div class="grid">
      {"\n".join(cards)}
    </div>
    <p class="stats">{len(images)} assets · 8 motifs · 3 variants each (wide, square, quiet)</p>
  </main>
</body>
</html>
'''
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} with {len(images)} assets")


if __name__ == "__main__":
    main()
