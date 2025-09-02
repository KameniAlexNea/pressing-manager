from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uuid
import sqlite3
from datetime import datetime, timedelta
import yaml
import os

app = FastAPI(title="Gestion Pressing", description="Service de gestion pour pressing")
DB_PATH = "pressing.db"
TABLE_NAME = "clothing_items"

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")


class ClothingItem(BaseModel):
    id: str = None
    description: str
    owner: str
    price: float
    status: str = "received"
    date_received: str = None
    date_cleaned: str = None
    notes: str = None
    date_delivered: str = None


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        f"""CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                    id TEXT PRIMARY KEY,
                    description TEXT,
                    owner TEXT,
                    price REAL,
                    status TEXT,
                    date_received TEXT,
                    date_cleaned TEXT,
                    notes TEXT,
                    date_delivered TEXT
                 )"""
    )
    # Add new columns if they don't exist
    try:
        c.execute(f"ALTER TABLE {TABLE_NAME} ADD COLUMN notes TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    try:
        c.execute(f"ALTER TABLE {TABLE_NAME} ADD COLUMN date_delivered TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    conn.commit()
    conn.close()


init_db()

# Load configuration
config_path = "config.yml"
if os.path.exists(config_path):
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
else:
    config = {"storage_suggestions": []}


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/register", response_class=HTMLResponse)
async def register_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


@app.post("/register")
async def register_item(
    request: Request,
    description: str = Form(...),
    owner: str = Form(...),
    price: float = Form(...),
    notes: str = Form(""),
    date_received: str = Form(""),
):
    owner = owner.upper()  # Uppercase the owner name
    if date_received:
        try:
            date_received = datetime.fromisoformat(date_received).isoformat()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide")
    else:
        date_received = datetime.now().isoformat()

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    item_id = str(uuid.uuid4())
    c.execute(
        f"""INSERT INTO {TABLE_NAME} (id, description, owner, price, status, date_received, notes, date_delivered)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            item_id,
            description,
            owner,
            price,
            "received",
            date_received,
            notes,
            None,
        ),
    )
    conn.commit()
    conn.close()
    return templates.TemplateResponse(
        "register_success.html", {"request": request, "code": item_id}
    )


@app.get("/item", response_class=HTMLResponse)
async def item_form(request: Request):
    return templates.TemplateResponse("item.html", {"request": request})


@app.post("/item")
async def get_item(request: Request, code: str = Form(...)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(f"SELECT * FROM {TABLE_NAME} WHERE id = ?", (code,))
    row = c.fetchone()
    conn.close()
    if row:
        item = {
            "id": row[0],
            "description": row[1],
            "owner": row[2],
            "price": row[3],
            "status": row[4],
            "date_received": row[5],
            "date_cleaned": row[6],
            "notes": row[7],
            "date_delivered": row[8],
        }
        return templates.TemplateResponse(
            "item_details.html", {"request": request, "item": item}
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")


@app.get("/item/{code}/clean")
async def clean_item(request: Request, code: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    date_cleaned = datetime.now().isoformat()
    c.execute(
        f"UPDATE {TABLE_NAME} SET status = ?, date_cleaned = ? WHERE id = ?",
        ("cleaned", date_cleaned, code),
    )
    conn.commit()
    conn.close()
    if c.rowcount > 0:
        return templates.TemplateResponse(
            "message.html",
            {
                "request": request,
                "message": "Article marqué comme nettoyé",
                "back_url": "/",
            },
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")


@app.get("/item/{code}/deliver")
async def deliver_item(request: Request, code: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    date_delivered = datetime.now().isoformat()
    c.execute(
        f"UPDATE {TABLE_NAME} SET status = ?, date_delivered = ? WHERE id = ?",
        ("delivered", date_delivered, code),
    )
    conn.commit()
    conn.close()
    if c.rowcount > 0:
        return templates.TemplateResponse(
            "message.html",
            {
                "request": request,
                "message": "Article marqué comme livré",
                "back_url": "/",
            },
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")


@app.get("/item/{code}/storage")
async def suggest_storage(request: Request, code: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(f"SELECT description, status FROM {TABLE_NAME} WHERE id = ?", (code,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    description, status = row
    if status != "cleaned":
        raise HTTPException(status_code=400, detail="Article pas encore nettoyé")

    # Suggestions basées sur la configuration
    desc = description.lower()
    suggestion = None
    for item in config.get("storage_suggestions", []):
        if any(keyword in desc for keyword in item["keywords"]):
            suggestion = item["suggestion"]
            break
    if suggestion is None:
        # Utiliser la suggestion par défaut (dernière entrée avec keywords vide)
        if config.get("storage_suggestions"):
            suggestion = config["storage_suggestions"][-1]["suggestion"]
        else:
            suggestion = "Stockage par défaut"

    return templates.TemplateResponse(
        "storage.html", {"request": request, "suggestion": suggestion, "code": code}
    )


@app.get("/pending", response_class=HTMLResponse)
async def pending_form(request: Request):
    return templates.TemplateResponse("pending.html", {"request": request})


@app.post("/pending")
async def get_pending_items(request: Request, days: int = Form(...)):
    cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        f"SELECT * FROM {TABLE_NAME} WHERE status != ? AND date_received < ?",
        ("cleaned", cutoff_date),
    )
    rows = c.fetchall()
    conn.close()
    items = []
    for row in rows:
        items.append(
            {
                "id": row[0],
                "description": row[1],
                "owner": row[2],
                "price": row[3],
                "status": row[4],
                "date_received": row[5],
                "date_cleaned": row[6],
                "notes": row[7],
                "date_delivered": row[8],
            }
        )
    return templates.TemplateResponse(
        "pending_list.html", {"request": request, "pending_items": items}
    )


@app.get("/owner", response_class=HTMLResponse)
async def owner_form(request: Request):
    return templates.TemplateResponse("owner.html", {"request": request})


@app.post("/owner")
async def get_items_by_owner(request: Request, owner: str = Form(...)):
    owner = owner.upper()  # Uppercase for case-insensitive search
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(f"SELECT * FROM {TABLE_NAME} WHERE owner = ?", (owner,))
    rows = c.fetchall()
    conn.close()
    items = []
    for row in rows:
        items.append(
            {
                "id": row[0],
                "description": row[1],
                "owner": row[2],
                "price": row[3],
                "status": row[4],
                "date_received": row[5],
                "date_cleaned": row[6],
                "notes": row[7],
                "date_delivered": row[8],
            }
        )
    return templates.TemplateResponse(
        "owner_list.html", {"request": request, "items": items, "owner": owner}
    )


@app.get("/stats", response_class=HTMLResponse)
async def stats_page(request: Request):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Total items
    c.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}")
    total_items = c.fetchone()[0]
    # Cleaned items
    c.execute(f"SELECT COUNT(*) FROM {TABLE_NAME} WHERE status = 'cleaned'")
    cleaned_items = c.fetchone()[0]
    # Delivered items
    c.execute(f"SELECT COUNT(*) FROM {TABLE_NAME} WHERE status = 'delivered'")
    delivered_items = c.fetchone()[0]
    # Pending items
    c.execute(f"SELECT COUNT(*) FROM {TABLE_NAME} WHERE status = 'received'")
    pending_items = c.fetchone()[0]
    # Total revenue (sum of prices for delivered items)
    c.execute(f"SELECT SUM(price) FROM {TABLE_NAME} WHERE status = 'delivered'")
    total_revenue = c.fetchone()[0] or 0
    conn.close()
    stats = {
        "total_items": total_items,
        "cleaned_items": cleaned_items,
        "delivered_items": delivered_items,
        "pending_items": pending_items,
        "total_revenue": total_revenue,
    }
    return templates.TemplateResponse(
        "stats.html", {"request": request, "stats": stats}
    )


@app.get("/item/{code}")
async def view_item(request: Request, code: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(f"SELECT * FROM {TABLE_NAME} WHERE id = ?", (code,))
    row = c.fetchone()
    conn.close()
    if row:
        item = {
            "id": row[0],
            "description": row[1],
            "owner": row[2],
            "price": row[3],
            "status": row[4],
            "date_received": row[5],
            "date_cleaned": row[6],
            "notes": row[7],
            "date_delivered": row[8],
        }
        return templates.TemplateResponse(
            "item_details.html", {"request": request, "item": item}
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")
