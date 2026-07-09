# Lupine Brand Asset Library

A small, real application for managing, searching, filtering, and reviewing the brand image corpus.

## Stack

- **FastAPI** + **Uvicorn** for the web server
- **SQLite** + **FTS5** for search
- **Jinja2** templates + vanilla JS
- No build step, no frontend framework lock-in

## Features

- Full-text search across motif, variant, prompt, and notes
- Filter by version, motif, variant, aspect, tag, or favorite
- Sort by newest, oldest, rating, motif, or file size
- Favorite, rate (0–5), and add private notes to each asset
- Per-asset detail page with prompt, tags, dimensions, and file size
- One-click download and copy-path
- JSON API at `/api/assets` and `/api/stats`
- Auto-syncs with `assets/images/` on startup

## Run locally

```bash
cd media/projects/brand-exploration
python3 -m venv .venv-assets
.venv-assets/bin/pip install -r app/requirements.txt
.venv-assets/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8787
```

Then open `http://localhost:8787/`.

## Run on the tailnet

The app is currently served at:

```
http://aledev.taild6f8cb.ts.net:8787/
```

To keep it running as a background task from this repo:

```bash
.venv-assets/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8787
```

## Add new assets

Drop new `.jpg` files into `assets/images/{version}/` using the naming convention `{motif}_{variant}_{version}.jpg`, then restart the app. The startup sync will pick them up.

## File layout

```
app/
  main.py            FastAPI routes
  db.py              SQLite schema + sync + queries
  templates/
    base.html        Brand shell
    gallery.html     Searchable grid
    detail.html      Single-asset view
  static/
    app.js           Favorites, ratings, notes, copy-path
README.md            This file
requirements.txt     Python dependencies
```
