#!/usr/bin/env python3
"""Build static article pages from Markdown sources in articles/."""
import re
import markdown
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = ROOT / "articles"
PUBLIC_DIR = ROOT / "public"

MARK_SVG = """<svg viewBox="100 44 312 440" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="bb" x1="190" y1="74" x2="324" y2="356" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#88a7d8"/><stop offset=".35" stop-color="#475b9c"/><stop offset=".78" stop-color="#102f47"/><stop offset="1" stop-color="#071a2a"/>
    </linearGradient>
    <linearGradient id="bl" x1="150" y1="330" x2="360" y2="470" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7f907c"/><stop offset="1" stop-color="#4c653d"/>
    </linearGradient>
    <radialGradient id="bc" cx="48%" cy="30%" r="68%">
      <stop offset="0" stop-color="#fffdf3"/><stop offset=".7" stop-color="#f1e8c9"/><stop offset="1" stop-color="#d4c58f"/>
    </radialGradient>
  </defs>
  <g fill="none" stroke="#4c653d" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
    <path d="M256 148 C252 224 258 312 254 448"/><path d="M252 402 C222 372 178 354 124 348"/><path d="M260 402 C290 372 334 354 388 348"/>
  </g>
  <g fill="url(#bl)" opacity=".96">
    <ellipse cx="139" cy="348" rx="18" ry="62" transform="rotate(-78 139 348)"/><ellipse cx="167" cy="384" rx="18" ry="62" transform="rotate(-48 167 384)"/><ellipse cx="214" cy="410" rx="17" ry="58" transform="rotate(-20 214 410)"/><ellipse cx="373" cy="348" rx="18" ry="62" transform="rotate(78 373 348)"/><ellipse cx="345" cy="384" rx="18" ry="62" transform="rotate(48 345 384)"/><ellipse cx="298" cy="410" rx="17" ry="58" transform="rotate(20 298 410)"/>
  </g>
  <g fill="none" stroke="#fef8f5" stroke-width="5" stroke-linecap="round" opacity=".66">
    <path d="M132 348 C170 356 205 373 236 405"/><path d="M380 348 C342 356 307 373 276 405"/>
  </g>
  <g fill="url(#bb)" stroke="#fef8f5" stroke-width="5" stroke-linejoin="round">
    <ellipse cx="256" cy="86" rx="22" ry="34"/><ellipse cx="232" cy="122" rx="23" ry="35" transform="rotate(-24 232 122)"/><ellipse cx="280" cy="122" rx="23" ry="35" transform="rotate(24 280 122)"/><ellipse cx="256" cy="150" rx="30" ry="40"/><ellipse cx="211" cy="182" rx="26" ry="38" transform="rotate(-34 211 182)"/><ellipse cx="301" cy="182" rx="26" ry="38" transform="rotate(34 301 182)"/><ellipse cx="256" cy="216" rx="37" ry="48"/><ellipse cx="204" cy="256" rx="30" ry="43" transform="rotate(-42 204 256)"/><ellipse cx="308" cy="256" rx="30" ry="43" transform="rotate(42 308 256)"/><ellipse cx="256" cy="306" rx="40" ry="52"/>
  </g>
  <g fill="url(#bc)">
    <path d="M244 142 C251 124 261 124 268 142 C262 136 250 136 244 142Z"/><path d="M244 207 C252 186 263 186 271 207 C263 199 252 199 244 207Z"/><path d="M242 296 C252 272 265 272 274 296 C264 286 252 286 242 296Z"/>
  </g>
</svg>"""


HERO_FIGURE = '''<figure class="article-hero" aria-labelledby="hero-caption">
  <video autoplay loop muted playsinline poster="hero.jpg" aria-label="MOF discovery flywheel: formalize, simulate, synthesize, feedback.">
    <source src="hero.mp4" type="video/mp4">
    <img src="hero.jpg" alt="MOF discovery flywheel: formalize, simulate, synthesize, feedback.">
  </video>
  <figcaption id="hero-caption">The formalized discovery loop: define makeability rules, simulate candidates, synthesize the certified ones, and feed the results back into stronger rules.</figcaption>
</figure>'''


def format_body_html(body_html: str, slug: str) -> str:
    # Markdown footnotes extension emits <div class="footnote">; map to site CSS.
    body_html = body_html.replace('<div class="footnote">', '<div class="footnotes">')

    # The first blockquote is the article metadata block; use a more semantic div.
    first_blockquote_open = body_html.find('<blockquote>')
    first_blockquote_close = body_html.find('</blockquote>')
    if first_blockquote_open != -1 and first_blockquote_close != -1:
        body_html = (
            body_html[:first_blockquote_open]
            + '<div class="article-meta">'
            + body_html[first_blockquote_open + len('<blockquote>'):first_blockquote_close]
            + '</div>'
            + body_html[first_blockquote_close + len('</blockquote>'):]
        )

    # Insert hero figure directly after the article title.
    h1_close = body_html.find('</h1>')
    if h1_close != -1:
        body_html = body_html[:h1_close + len('</h1>')] + '\n' + HERO_FIGURE + body_html[h1_close + len('</h1>'):]

    return body_html


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s-]+", "-", s).strip("-")
    return s


def extract_metadata(body: str) -> dict:
    meta = {"type": "article"}
    for line in body.splitlines():
        if line.startswith("> **Date:**"):
            meta["date"] = line.replace("> **Date:**", "").strip()
        elif line.startswith("> **Type:**"):
            meta["type"] = line.replace("> **Type:**", "").strip().lower().replace(" ", "-")
        elif line.startswith("> **Scope:**"):
            meta["scope"] = line.replace("> **Scope:**", "").strip()
        elif line.startswith("> **Description:**"):
            meta["description"] = line.replace("> **Description:**", "").strip()
        elif line.startswith("> **Audience:**"):
            meta["audience"] = line.replace("> **Audience:**", "").strip()
        elif line.startswith("> **Status:**"):
            meta["status"] = line.replace("> **Status:**", "").strip()
    return meta


def build_page(title: str, description: str, slug: str, body_html: str, fmt: str = "article") -> str:
    url = f"https://lupine.science/articles/{slug}/"
    og_image = f"https://lupine.science/articles/{slug}/hero.jpg"
    body_class = f"format-{fmt}"
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — Lupine Science</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="index,follow">
  <meta property="og:title" content="{title} — Lupine Science">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{og_image}">
  <meta name="twitter:image" content="{og_image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#faf9f6">
  <link rel="icon" type="image/svg+xml" href="/lupine-science-mark.svg">
  <link rel="icon" type="image/png" href="/lupine-science-icon.png">
  <link rel="apple-touch-icon" href="/lupine-science-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/articles/styles.css">
</head>
<body class="{body_class}">
  <a class="skip" href="#article">Skip to article</a>
  <header class="site-header">
    <a class="mark" href="/" aria-label="Lupine Science">
      {MARK_SVG}
      <span><b>Lupine Science</b> <span class="tld">the trust layer for AI-designed matter</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="https://library.lupine.science">Library</a>
      <a href="https://lupi.live">LUPI</a>
    </nav>
  </header>
  <main id="article" class="article-shell">
    <article class="article">
      {body_html}
    </article>
  </main>
  <footer class="site-footer">
    <p>Lupine Science · founder Alex Welcing · <a href="mailto:alex@lupinesci.com">alex@lupinesci.com</a></p>
  </footer>
</body>
</html>
"""


def build_index(articles: list[dict]) -> str:
    cards = []
    for art in articles:
        cards.append(
            f'''<li>
  <a class="article-card" href="/articles/{art['slug']}/" aria-label="{art['title']}. Dated {art['date']}.">
    <img class="card-thumb" src="/articles/{art['slug']}/hero.jpg" alt="">
    <h2>{art['title']}</h2>
    <p>{art['description']}</p>
    <span class="meta">{art['date']} · {art['audience']}</span>
  </a>
</li>'''
        )
    cards_html = "\n".join(cards) if cards else '<li class="article-card"><p>No articles yet.</p></li>'
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Articles — Lupine Science</title>
  <meta name="description" content="Articles, prospectuses, and research notes from Lupine Science on formalized materials discovery.">
  <meta name="robots" content="index,follow">
  <meta property="og:title" content="Articles — Lupine Science">
  <meta property="og:description" content="Articles, prospectuses, and research notes from Lupine Science on formalized materials discovery.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://lupine.science/articles/">
  <meta property="og:image" content="https://lupine.science/og-lupine-science.jpg">
  <meta name="twitter:image" content="https://lupine.science/og-lupine-science.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#faf9f6">
  <link rel="icon" type="image/svg+xml" href="/lupine-science-mark.svg">
  <link rel="icon" type="image/png" href="/lupine-science-icon.png">
  <link rel="apple-touch-icon" href="/lupine-science-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/articles/styles.css">
</head>
<body>
  <a class="skip" href="#index">Skip to articles</a>
  <header class="site-header">
    <a class="mark" href="/" aria-label="Lupine Science">
      {MARK_SVG}
      <span><b>Lupine Science</b> <span class="tld">the trust layer for AI-designed matter</span></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="https://library.lupine.science">Library</a>
      <a href="https://lupi.live">LUPI</a>
    </nav>
  </header>
  <main id="index" class="article-index">
    <h1>Articles</h1>
    <p class="lede">Research notes, prospectuses, and formalization roadmaps for trustworthy materials discovery.</p>
    <ul class="article-list">
      {cards_html}
    </ul>
  </main>
  <footer class="site-footer">
    <p>Lupine Science · founder Alex Welcing · <a href="mailto:alex@lupinesci.com">alex@lupinesci.com</a></p>
  </footer>
</body>
</html>
"""


def main():
    md = markdown.Markdown(extensions=["footnotes", "fenced_code", "tables"])
    if not ARTICLES_DIR.exists():
        print("No articles/ directory found; nothing to build.")
        return

    articles = []
    for source in sorted(ARTICLES_DIR.glob("*.md")):
        raw = source.read_text(encoding="utf-8")
        slug = source.stem
        md.reset()
        body_html = format_body_html(md.convert(raw), slug)
        title_match = re.search(r"<h1>(.*?)</h1>", body_html)
        title = title_match.group(1) if title_match else slug.replace("-", " ").title()
        meta = extract_metadata(raw)
        description = meta.get("description") or meta.get("scope") or f"A Lupine Science article: {title}"
        date = meta.get("date") or ""
        audience = meta.get("audience") or ""

        out_dir = PUBLIC_DIR / "articles" / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(
            build_page(title, description, slug, body_html, fmt=meta.get("type", "article")),
            encoding="utf-8",
        )
        articles.append({
            "slug": slug,
            "title": title,
            "description": description,
            "date": date,
            "audience": audience,
        })
        print(f"Built /articles/{slug}/ from {source.name}")

    # Sort newest first (date descending)
    articles.sort(key=lambda a: a["date"], reverse=True)
    (PUBLIC_DIR / "articles" / "index.html").write_text(
        build_index(articles),
        encoding="utf-8",
    )
    print("Built /articles/index.html")


if __name__ == "__main__":
    main()
