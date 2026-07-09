:root {
      --paper: #faf9f6; --paper-deep: #f2efe7;
      --ink: #16171d; --ink-soft: #4c4e58; --ink-faint: #6e707a;
      --indigo: #3d4db3; --indigo-deep: #2e3a87; --indigo-wash: rgba(61,77,179,0.08);
      --rule: #e2dfd4; --rule-soft: #ece9e0;
      --serif: "Newsreader", Georgia, serif;
      --mono: "IBM Plex Mono", ui-monospace, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--serif); background: var(--paper); color: var(--ink);
      font-size: 16px; line-height: 1.6;
      -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
    }
    header {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between; gap: 24px;
      padding: 18px clamp(20px, 5vw, 64px);
      background: rgba(250,249,246,0.92); backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--rule-soft);
    }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; }
    .brand b { font-weight: 600; font-size: 16px; }
    .brand span { font-family: var(--mono); font-size: 10.5px; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.06em; }
    .nav a {
      font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em;
      color: var(--ink-soft); text-decoration: none; margin-left: 20px;
    }
    .nav a:hover { color: var(--indigo); }
    main { max-width: 1600px; margin: 0 auto; padding: clamp(40px, 8vh, 80px) clamp(20px, 5vw, 64px); }
    h1 { font-size: clamp(32px, 5vw, 56px); font-weight: 400; letter-spacing: -0.02em; margin-bottom: 8px; }
    h1 em { font-style: italic; color: var(--indigo); }
    .lede { color: var(--ink-soft); font-size: 18px; max-width: 75ch; margin-bottom: 40px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    .card {
      background: rgba(255,255,255,0.5); border: 1px solid var(--rule); border-radius: 8px;
      overflow: hidden;
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 18px 42px rgba(22,23,29,0.08); border-color: var(--indigo); }
    .card img { display: block; width: 100%; aspect-ratio: 16/9; object-fit: cover; background: var(--paper-deep); }
    .card[data-aspect="1:1"] img { aspect-ratio: 1/1; }
    .card figcaption {
      padding: 14px 16px;
      display: flex; justify-content: space-between; align-items: baseline;
      font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .card figcaption strong { font-family: var(--serif); font-size: 15px; font-weight: 500; text-transform: none; letter-spacing: 0; }
    .card figcaption span { color: var(--ink-faint); }
    .stats {
      margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--rule);
      font-family: var(--mono); font-size: 12px; color: var(--ink-soft);
    }
  </style>
</head>
<body>
  <header>
    <a class="brand" href="/" aria-label="Lupine Science">
      <b>Lupine Science</b>
      <span>Brand Assets</span>
    </a>
    <nav class="nav">
      <a href="/">Home</a>
      <a href="/articles/">Articles</a>
      <a href="https://lupine.science">lupine.science</a>
    </nav>
  </header>
  <main>
    <h1>Brand <em>assets.</em></h1>
    <p class="lede">{len(images)} generated stills: research motifs, abstract textures, and standalone iconography. Right-click or long-press any image to save it.</p>
    <div class="grid">
      {"\n".join(cards)}
    </div>
    <p class="stats">{len(images)} assets · {len(set(img['version'] for img in images))} versions · {len(set(img['motif'] for img in images))} motifs</p>
  </main>
</body>
</html>
'''
    OUT.write_text(html, encoding="utf-8")
    print(f"Published {len(images)} assets to {OUT}")


if __name__ == "__main__":
    main()
