"""Brand Asset Library — FastAPI application."""
from __future__ import annotations

import pathlib
from contextlib import asynccontextmanager

from fastapi import FastAPI, Form, Query, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, FileSystemLoader

from . import db

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS_ROOT = ROOT / "assets" / "images"

jinja_env = Environment(loader=FileSystemLoader(ROOT / "app" / "templates"))


def render_template(name: str, context: dict) -> str:
    template = jinja_env.get_template(name)
    return template.render(**context)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    db.sync_assets()
    yield


app = FastAPI(title="Lupine Brand Asset Library", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=ROOT / "app" / "static"), name="static")
app.mount("/raw", StaticFiles(directory=ASSETS_ROOT), name="raw")


def _row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "filename": row["filename"],
        "path": row["path"],
        "version": row["version"],
        "motif": row["motif"],
        "variant": row["variant"],
        "aspect": row["aspect"],
        "width": row["width"],
        "height": row["height"],
        "size_bytes": row["size_bytes"],
        "prompt": row["prompt"] or "",
        "favorite": bool(row["favorite"]),
        "rating": row["rating"],
        "notes": row["notes"] or "",
        "tags": row["tags"].split(", ") if row["tags"] else [],
        "url": f"/raw/{row['path']}",
    }


@app.get("/", response_class=HTMLResponse)
def gallery(
    request: Request,
    q: str = "",
    version: str | None = None,
    motif: str | None = None,
    variant: str | None = None,
    aspect: str | None = None,
    favorite: bool | None = None,
    tag: str | None = None,
    sort: str = "newest",
):
    assets = db.list_assets(q, version, motif, variant, aspect, favorite, tag, sort)
    rows = [_row_to_dict(r) for r in assets]
    stats = db.stats()
    filter_values = {
        "versions": stats["versions"],
        "motifs": stats["motifs"],
        "variants": stats["variants"],
        "aspects": ["1:1", "16:9"],
        "tags": sorted({t for r in rows for t in r["tags"]}),
    }
    html = render_template(
        "gallery.html",
        {
            "request": request,
            "assets": rows,
            "stats": stats,
            "filters": filter_values,
            "query": {
                "q": q,
                "version": version or "",
                "motif": motif or "",
                "variant": variant or "",
                "aspect": aspect or "",
                "favorite": "1" if favorite else ("0" if favorite is False else ""),
                "tag": tag or "",
                "sort": sort,
            },
        },
    )
    return HTMLResponse(html)


@app.get("/asset/{asset_id}", response_class=HTMLResponse)
def detail(request: Request, asset_id: str):
    row = db.get_asset(asset_id)
    if not row:
        return HTMLResponse("Not found", status_code=404)
    asset = _row_to_dict(row)
    html = render_template("detail.html", {"request": request, "asset": asset})
    return HTMLResponse(html)


@app.get("/api/assets")
def api_assets(
    q: str = "",
    version: str | None = None,
    motif: str | None = None,
    variant: str | None = None,
    aspect: str | None = None,
    favorite: bool | None = None,
    tag: str | None = None,
    sort: str = "newest",
):
    rows = db.list_assets(q, version, motif, variant, aspect, favorite, tag, sort)
    return {"assets": [_row_to_dict(r) for r in rows]}


@app.post("/api/assets/{asset_id}/favorite")
def api_favorite(asset_id: str, favorite: bool = Form(...)):
    db.update_asset(asset_id, favorite=favorite)
    return {"ok": True}


@app.post("/api/assets/{asset_id}/rate")
def api_rate(asset_id: str, rating: int = Form(...)):
    db.update_asset(asset_id, rating=rating)
    return {"ok": True}


@app.post("/api/assets/{asset_id}/notes")
def api_notes(asset_id: str, notes: str = Form(...)):
    db.update_asset(asset_id, notes=notes)
    return {"ok": True}


@app.post("/api/assets/{asset_id}/tags")
def api_add_tag(asset_id: str, tag: str = Form(...)):
    db.add_tag(asset_id, tag)
    return {"ok": True}


@app.get("/api/stats")
def api_stats():
    return db.stats()


@app.get("/download/{asset_id}")
def download(asset_id: str):
    row = db.get_asset(asset_id)
    if not row:
        return JSONResponse({"error": "not found"}, status_code=404)
    path = ASSETS_ROOT / row["path"]
    return FileResponse(path, filename=row["filename"], media_type="image/jpeg")


@app.get("/health")
def health():
    return {"status": "ok", "assets": db.stats()["total"]}
