#!/usr/bin/env python3
"""Generate artwork for the MOF formalization prospectus article."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PNG = os.path.join(ROOT, "public", "og-mof-formalization.png")
OUT_SVG = os.path.join(ROOT, "public", "articles", "from-fantasy-frameworks-to-makeable-materials", "hero.svg")

# Palette
PAPER = (250, 249, 246)
PAPER_DEEP = (242, 239, 231)
INK = (22, 23, 29)
INDIGO = (61, 77, 179)
INDIGO_LIGHT = (119, 132, 209)
OCHRE = (168, 119, 43)
OCHRE_LIGHT = (210, 172, 105)

def hex_to_rgb(hexstr):
    hexstr = hexstr.lstrip('#')
    return tuple(int(hexstr[i:i+2], 16) for i in (0, 2, 4))

def add_alpha(color, alpha):
    return color + (alpha,)

def draw_gradient_background(draw, size, c1, c2):
    w, h = size
    for y in range(h):
        t = y / h
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

def draw_soft_vignette(img):
    w, h = img.size
    overlay = Image.new('RGBA', (w, h), (255, 255, 255, 0))
    odraw = ImageDraw.Draw(overlay)
    for i in range(max(w, h) // 2, 0, -4):
        alpha = int(18 * (i / (max(w, h) // 2)))
        odraw.ellipse([w//2 - i, h//2 - i, w//2 + i, h//2 + i], outline=(0,0,0,alpha))
    img.paste(overlay, (0,0), overlay)

def draw_lattice(draw, cx, cy, scale):
    """Draw a stylized cubic/MOF lattice centered at cx,cy."""
    # 8 corners of a cube, projected
    pts3d = [
        (-1,-1,-1), (1,-1,-1), (1,1,-1), (-1,1,-1),
        (-1,-1, 1), (1,-1, 1), (1,1, 1), (-1,1, 1),
    ]
    edges = [
        (0,1),(1,2),(2,3),(3,0),
        (4,5),(5,6),(6,7),(7,4),
        (0,4),(1,5),(2,6),(3,7),
    ]
    projected = []
    for x,y,z in pts3d:
        px = cx + scale * (x - 0.45*y)
        py = cy + scale * (z - 0.35*y)
        projected.append((px, py))
    # edges
    for a,b in edges:
        draw.line([projected[a], projected[b]], fill=add_alpha(INDIGO, 120), width=3)
    # nodes
    for i, (px, py) in enumerate(projected):
        color = OCHRE if i % 2 else INDIGO
        r = 10
        draw.ellipse([px-r, py-r, px+r, py+r], fill=color, outline=PAPER, width=2)
    # inner connecting diagonals for MOF feel
    for a,b in [(0,6),(1,7),(2,4),(3,5)]:
        draw.line([projected[a], projected[b]], fill=add_alpha(INDIGO_LIGHT, 70), width=2)

def draw_certificate_badge(draw, cx, cy, radius):
    # Outer ring
    draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], outline=OCHRE, width=6)
    draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], outline=add_alpha(PAPER, 200), width=2)
    # Ribbon tails
    ribbon = [
        (cx - radius*0.4, cy + radius*0.85),
        (cx - radius*0.6, cy + radius*1.35),
        (cx, cy + radius*1.05),
        (cx + radius*0.6, cy + radius*1.35),
        (cx + radius*0.4, cy + radius*0.85),
    ]
    draw.polygon(ribbon, fill=OCHRE, outline=PAPER, width=2)
    # Inner fill
    draw.ellipse([cx-radius*0.78, cy-radius*0.78, cx+radius*0.78, cy+radius*0.78], fill=add_alpha(PAPER, 230))
    # Checkmark
    draw.line([
        (cx - radius*0.32, cy + radius*0.05),
        (cx - radius*0.08, cy + radius*0.32),
        (cx + radius*0.38, cy - radius*0.22),
    ], fill=INDIGO, width=10, joint='curve')

def generate_og_png():
    W, H = 1200, 630
    img = Image.new('RGBA', (W, H), PAPER)
    draw = ImageDraw.Draw(img)
    draw_gradient_background(draw, (W,H), PAPER, PAPER_DEEP)

    # Decorative corner accents
    draw.polygon([(0,0), (W*0.35,0), (0,H*0.28)], fill=add_alpha(INDIGO, 18))
    draw.polygon([(W,0), (W,H*0.22), (W*0.65,0)], fill=add_alpha(OCHRE, 14))

    # Lattice + badge composition in upper half so lower text is readable
    draw_lattice(draw, W//2 - 40, 185, 140)
    draw_certificate_badge(draw, W//2 + 170, 175, 78)

    # Text in lower safe band
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 52)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 28)
        brand_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except Exception:
        title_font = ImageFont.load_default()
        subtitle_font = brand_font = title_font

    title = "From Fantasy Frameworks"
    title2 = "to Makeable Materials"
    draw.text((W*0.08, H*0.68), title, font=title_font, fill=INK)
    draw.text((W*0.08, H*0.80), title2, font=title_font, fill=INK)
    draw.text((W*0.08, H*0.90), "A Lupine Science prospectus", font=subtitle_font, fill=INDIGO)
    draw.text((W*0.82, H*0.94), "lupine.science", font=brand_font, fill=OCHRE, anchor="rb")

    # Subtle noise
    noise = Image.effect_noise((W//2, H//2), 12).convert('L').resize((W,H))
    noise = Image.merge('RGBA', [noise, noise, noise, noise.point(lambda x: int(x*0.04))])
    img = Image.alpha_composite(img, noise)

    img.convert('RGB').save(OUT_PNG, 'PNG', optimize=True)
    print(f"Wrote {OUT_PNG}")


def generate_hero_svg():
    svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#faf9f6"/>
    </radialGradient>
    <linearGradient id="indigoGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3d4db3"/>
      <stop offset="100%" stop-color="#2e3a87"/>
    </linearGradient>
    <linearGradient id="ochreGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a8772b"/>
      <stop offset="100%" stop-color="#7d571e"/>
    </linearGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <marker id="arrowIndigo" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#3d4db3"/>
    </marker>
    <marker id="arrowOchre" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#a8772b"/>
    </marker>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>

  <!-- Left: stylized MOF unit cell -->
  <g transform="translate(260, 450)" filter="url(#softGlow)">
    <g stroke="#3d4db3" stroke-width="5" stroke-linecap="round" opacity="0.9">
      <line x1="-100" y1="-120" x2="100" y2="-120"/>
      <line x1="100" y1="-120" x2="150" y2="0"/>
      <line x1="150" y1="0" x2="-50" y2="0"/>
      <line x1="-50" y1="0" x2="-100" y2="-120"/>
      <line x1="-100" y1="120" x2="100" y2="120"/>
      <line x1="100" y1="120" x2="150" y2="0"/>
      <line x1="150" y1="0" x2="-50" y2="0"/>
      <line x1="-50" y1="0" x2="-100" y2="120"/>
      <line x1="-100" y1="-120" x2="-100" y2="120"/>
      <line x1="100" y1="-120" x2="100" y2="120"/>
    </g>
    <g stroke="#a8772b" stroke-width="4" stroke-linecap="round" opacity="0.85">
      <line x1="-20" y1="-60" x2="70" y2="60"/>
      <line x1="20" y1="-60" x2="-70" y2="60"/>
    </g>
    <g>
      <circle cx="-100" cy="-120" r="14" fill="url(#indigoGrad)"/>
      <circle cx="100" cy="-120" r="14" fill="url(#ochreGrad)"/>
      <circle cx="150" cy="0" r="14" fill="url(#indigoGrad)"/>
      <circle cx="-50" cy="0" r="14" fill="url(#ochreGrad)"/>
      <circle cx="-100" cy="120" r="14" fill="url(#ochreGrad)"/>
      <circle cx="100" cy="120" r="14" fill="url(#indigoGrad)"/>
    </g>
  </g>

  <!-- Center: generate–test–learn flywheel -->
  <g transform="translate(800, 430)">
    <ellipse cx="0" cy="0" rx="220" ry="220" fill="none" stroke="#e2dfd4" stroke-width="2"/>
    <path d="M 160,-110 A 210,210 0 1,1 -120,140" fill="none" stroke="#3d4db3" stroke-width="10" stroke-linecap="round" marker-end="url(#arrowIndigo)"/>
    <path d="M -120,140 A 210,210 0 0,1 160,-110" fill="none" stroke="#a8772b" stroke-width="10" stroke-linecap="round" marker-end="url(#arrowOchre)" opacity="0.85"/>

    <g font-family="'IBM Plex Mono', monospace" font-size="22" font-weight="600" text-anchor="middle" fill="#16171d">
      <text x="0" y="-175">FORMALIZE</text>
      <text x="190" y="15">SIMULATE</text>
      <text x="0" y="205">SYNTHESIZE</text>
      <text x="-190" y="15">FEEDBACK</text>
    </g>
    <circle cx="0" cy="0" r="55" fill="#faf9f6" stroke="#3d4db3" stroke-width="4"/>
    <path d="M -22,5 L -8,22 L 28,-18" fill="none" stroke="#3d4db3" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Right: certificate / theorem icon -->
  <g transform="translate(1340, 450)" filter="url(#softGlow)">
    <rect x="-90" y="-120" width="180" height="240" rx="10" fill="#ffffff" stroke="#a8772b" stroke-width="6"/>
    <rect x="-72" y="-96" width="144" height="14" rx="4" fill="#3d4db3" opacity="0.18"/>
    <rect x="-72" y="-68" width="110" height="10" rx="3" fill="#3d4db3" opacity="0.12"/>
    <rect x="-72" y="-46" width="130" height="10" rx="3" fill="#3d4db3" opacity="0.12"/>
    <rect x="-72" y="-24" width="90" height="10" rx="3" fill="#3d4db3" opacity="0.12"/>
    <circle cx="0" cy="55" r="48" fill="none" stroke="#a8772b" stroke-width="6"/>
    <path d="M -18,50 L -6,64 L 24,36" fill="none" stroke="#3d4db3" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Brackets suggesting theorem -->
    <path d="M -120,-90 L -110,-90 L -110,90 L -120,90" fill="none" stroke="#16171d" stroke-width="4"/>
    <path d="M 120,-90 L 110,-90 L 110,90 L 120,90" fill="none" stroke="#16171d" stroke-width="4"/>
  </g>

  <!-- Decorative dot field -->
  <g fill="#3d4db3" opacity="0.12">
    <circle cx="140" cy="160" r="5"/>
    <circle cx="170" cy="190" r="3"/>
    <circle cx="120" cy="220" r="4"/>
    <circle cx="1460" cy="700" r="5"/>
    <circle cx="1500" cy="730" r="3"/>
    <circle cx="1430" cy="760" r="4"/>
  </g>
</svg>'''
    os.makedirs(os.path.dirname(OUT_SVG), exist_ok=True)
    with open(OUT_SVG, 'w') as f:
        f.write(svg)
    print(f"Wrote {OUT_SVG}")

if __name__ == "__main__":
    generate_og_png()
    generate_hero_svg()
