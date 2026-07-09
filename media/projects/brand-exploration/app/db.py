"""SQLite persistence for the brand asset library."""
from __future__ import annotations

import json
import pathlib
import sqlite3
from datetime import datetime, timezone
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "app" / "library.db"
ASSETS_ROOT = ROOT / "assets" / "images"

SCHEMA = """
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    version TEXT NOT NULL,
    motif TEXT NOT NULL,
    variant TEXT NOT NULL,
    aspect TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    prompt TEXT,
    favorite INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    UNIQUE(asset_id, tag)
);

CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(
    id UNINDEXED,
    motif,
    variant,
    prompt,
    notes
);
"""


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    conn = get_db()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


def _aspect(variant: str) -> str:
    return "1:1" if variant == "square" else "16:9"


def _extract_meta(rel: pathlib.Path) -> dict[str, Any] | None:
    """Parse assets/images/{version}/{motif}_{variant}_{version}.jpg."""
    version = rel.parent.name
    name = rel.stem
    parts = name.rsplit("_", 2)
    if len(parts) != 3 or not parts[0] or not parts[1]:
        return None
    motif, variant, _ = parts
    return {
        "id": str(rel.with_suffix("")).replace("/", "_"),
        "filename": rel.name,
        "path": str(rel),
        "version": version,
        "motif": motif.replace("-", " ").title(),
        "variant": variant,
        "aspect": _aspect(variant),
    }


def _image_size(full: pathlib.Path) -> tuple[int, int] | None:
    try:
        from PIL import Image
        with Image.open(full) as im:
            return im.size
    except Exception:
        return None


def _prompt_for(version: str, motif_id: str) -> str:
    story = ROOT / f"storyboard_{version}.yaml"
    if not story.exists():
        story = ROOT / "storyboard.yaml"
    try:
        import yaml
        data = yaml.safe_load(story.read_text())
        if data.get("version") != version:
            return ""
        for m in data.get("motifs", []):
            if m["id"] == motif_id:
                return m.get("base", "")
        return data.get("style_suffix", "")
    except Exception:
        return ""


def sync_assets() -> int:
    conn = get_db()
    existing = {row["id"] for row in conn.execute("SELECT id FROM assets")}
    seen: set[str] = set()
    inserted = 0

    for full in ASSETS_ROOT.rglob("*.jpg"):
        rel = full.relative_to(ASSETS_ROOT)
        meta = _extract_meta(rel)
        if not meta:
            continue
        seen.add(meta["id"])
        size = _image_size(full)
        width, height = size if size else (None, None)
        size_bytes = full.stat().st_size
        motif_id = meta["filename"].split("_", 1)[0]
        prompt = _prompt_for(meta["version"], motif_id)

        conn.execute(
            """
            INSERT INTO assets (id, filename, path, version, motif, variant, aspect,
                                width, height, size_bytes, prompt, created_at)
            VALUES (:id, :filename, :path, :version, :motif, :variant, :aspect,
                    :width, :height, :size_bytes, :prompt, :created_at)
            ON CONFLICT(id) DO UPDATE SET
                width=excluded.width,
                height=excluded.height,
                size_bytes=excluded.size_bytes,
                prompt=excluded.prompt
            """,
            {
                **meta,
                "width": width,
                "height": height,
                "size_bytes": size_bytes,
                "prompt": prompt,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        if meta["id"] not in existing:
            inserted += 1
            for tag in (meta["version"], meta["variant"], meta["aspect"], motif_id):
                conn.execute(
                    "INSERT OR IGNORE INTO tags (asset_id, tag) VALUES (?, ?)",
                    (meta["id"], tag),
                )

    # Remove missing
    missing = existing - seen
    for aid in missing:
        conn.execute("DELETE FROM assets WHERE id = ?", (aid,))

    # Rebuild search index
    conn.execute("DROP TABLE IF EXISTS search")
    conn.execute("CREATE VIRTUAL TABLE search USING fts5(id UNINDEXED, motif, variant, prompt, notes)")
    for row in conn.execute("SELECT id, motif, variant, prompt, notes FROM assets"):
        conn.execute(
            "INSERT INTO search (id, motif, variant, prompt, notes) VALUES (?, ?, ?, ?, ?)",
            (row["id"], row["motif"], row["variant"], row["prompt"], row["notes"]),
        )

    conn.commit()
    conn.close()
    return inserted


def list_assets(
    q: str = "",
    version: str | None = None,
    motif: str | None = None,
    variant: str | None = None,
    aspect: str | None = None,
    favorite: bool | None = None,
    tag: str | None = None,
    sort: str = "newest",
    limit: int = 200,
) -> list[sqlite3.Row]:
    conn = get_db()
    where = ["1=1"]
    params: list[Any] = []

    if q:
        where.append("a.id IN (SELECT id FROM search WHERE search MATCH ?)")
        params.append(q)
    if version:
        where.append("a.version = ?")
        params.append(version)
    if motif:
        where.append("a.motif = ?")
        params.append(motif)
    if variant:
        where.append("a.variant = ?")
        params.append(variant)
    if aspect:
        where.append("a.aspect = ?")
        params.append(aspect)
    if favorite is not None:
        where.append("a.favorite = ?")
        params.append(1 if favorite else 0)
    if tag:
        where.append(
            "a.id IN (SELECT asset_id FROM tags WHERE tag = ?)"
        )
        params.append(tag)

    order = {
        "newest": "a.created_at DESC",
        "oldest": "a.created_at ASC",
        "rating": "a.rating DESC, a.created_at DESC",
        "motif": "a.motif, a.version, a.variant",
        "size": "a.size_bytes DESC",
    }.get(sort, "a.created_at DESC")

    sql = f"""
        SELECT a.*, GROUP_CONCAT(t.tag, ', ') AS tags
        FROM assets a
        LEFT JOIN tags t ON t.asset_id = a.id
        WHERE {' AND '.join(where)}
        GROUP BY a.id
        ORDER BY {order}
        LIMIT ?
    """
    params.append(limit)
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return rows


def get_asset(asset_id: str) -> sqlite3.Row | None:
    conn = get_db()
    row = conn.execute(
        """SELECT a.*, GROUP_CONCAT(t.tag, ', ') AS tags
           FROM assets a LEFT JOIN tags t ON t.asset_id = a.id
           WHERE a.id = ? GROUP BY a.id""",
        (asset_id,),
    ).fetchone()
    conn.close()
    return row


def update_asset(asset_id: str, favorite: bool | None = None, rating: int | None = None, notes: str | None = None) -> None:
    conn = get_db()
    if favorite is not None:
        conn.execute("UPDATE assets SET favorite = ? WHERE id = ?", (1 if favorite else 0, asset_id))
    if rating is not None:
        conn.execute("UPDATE assets SET rating = ? WHERE id = ?", (max(0, min(5, rating)), asset_id))
    if notes is not None:
        conn.execute("UPDATE assets SET notes = ? WHERE id = ?", (notes, asset_id))
    # Rebuild search index to incorporate updated notes
    conn.execute("DROP TABLE IF EXISTS search")
    conn.execute("CREATE VIRTUAL TABLE search USING fts5(id UNINDEXED, motif, variant, prompt, notes)")
    for row in conn.execute("SELECT id, motif, variant, prompt, notes FROM assets"):
        conn.execute(
            "INSERT INTO search (id, motif, variant, prompt, notes) VALUES (?, ?, ?, ?, ?)",
            (row["id"], row["motif"], row["variant"], row["prompt"], row["notes"]),
        )
    conn.commit()
    conn.close()


def add_tag(asset_id: str, tag: str) -> None:
    conn = get_db()
    conn.execute("INSERT OR IGNORE INTO tags (asset_id, tag) VALUES (?, ?)", (asset_id, tag.strip().lower()))
    conn.commit()
    conn.close()


def distinct_values(column: str) -> list[str]:
    conn = get_db()
    rows = conn.execute(f"SELECT DISTINCT {column} FROM assets ORDER BY {column}").fetchall()
    conn.close()
    return [r[0] for r in rows if r[0]]


def stats() -> dict[str, Any]:
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM assets").fetchone()[0]
    fav = conn.execute("SELECT COUNT(*) FROM assets WHERE favorite = 1").fetchone()[0]
    versions = distinct_values("version")
    motifs = distinct_values("motif")
    variants = distinct_values("variant")
    conn.close()
    return {"total": total, "favorites": fav, "versions": versions, "motifs": motifs, "variants": variants}
