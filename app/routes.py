import os
import uuid
from datetime import datetime, timedelta

import yaml
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from . import crud, database

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# Load configuration
config_path = "config.yml"
if os.path.exists(config_path):
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
else:
    config = {"storage_suggestions": []}


@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/register", response_class=HTMLResponse)
async def register_form(request: Request):
    default_days = config.get("default_promised_days", 7)
    default_date = datetime.now() + timedelta(days=default_days)
    default_date_str = default_date.strftime("%Y-%m-%dT%H:%M")
    now_str = datetime.now().strftime("%Y-%m-%dT%H:%M")
    return templates.TemplateResponse("register.html", {"request": request, "default_date": default_date_str, "default_days": default_days, "now_date": now_str})


@router.post("/register")
async def register_item(
    request: Request,
    description: str = Form(...),
    owner: str = Form(...),
    price: float = Form(...),
    notes: str = Form(""),
    date_received: str = Form(""),
    contact: str = Form(""),
    date_promised: str = Form(""),
    db: Session = Depends(database.get_db),
):
    owner = owner.upper()
    if date_received:
        try:
            date_received = datetime.fromisoformat(date_received)
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide")
    else:
        date_received = datetime.now()

    date_promised_parsed = None
    if date_promised:
        try:
            date_promised_parsed = datetime.fromisoformat(date_promised)
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date promise invalide")
    else:
        # Set default if not provided
        default_days = config.get("default_promised_days", 7)
        date_promised_parsed = datetime.now() + timedelta(days=default_days)

    item_data = {
        "id": str(uuid.uuid4()),
        "description": description,
        "owner": owner,
        "price": price,
        "status": "received",
        "date_received": date_received,
        "notes": notes or None,
        "contact": contact or None,
        "date_promised": date_promised_parsed,
    }
    crud.create_item(db, item_data)
    return templates.TemplateResponse(
        "register_success.html", {"request": request, "code": item_data["id"]}
    )


@router.get("/item", response_class=HTMLResponse)
async def item_form(request: Request):
    return templates.TemplateResponse("item.html", {"request": request})


@router.post("/item")
async def get_item(
    request: Request, code: str = Form(...), db: Session = Depends(database.get_db)
):
    item = crud.get_item(db, code)
    if item:
        item_dict = {
            "id": item.id,
            "description": item.description,
            "owner": item.owner,
            "price": item.price,
            "status": item.status,
            "date_received": (
                item.date_received.isoformat() if item.date_received else None
            ),
            "date_cleaned": (
                item.date_cleaned.isoformat() if item.date_cleaned else None
            ),
            "notes": item.notes,
            "date_delivered": (
                item.date_delivered.isoformat() if item.date_delivered else None
            ),
            "contact": item.contact,
            "date_promised": (
                item.date_promised.isoformat() if item.date_promised else None
            ),
        }
        return templates.TemplateResponse(
            "item_details.html", {"request": request, "item": item_dict}
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")


@router.get("/item/{code}/clean")
async def clean_item(
    request: Request, code: str, db: Session = Depends(database.get_db)
):
    item = crud.update_item_status(db, code, "cleaned", "date_cleaned")
    if item:
        return templates.TemplateResponse(
            "message.html",
            {
                "request": request,
                "message": "Article marqué comme nettoyé",
                "back_url": "/",
            },
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")


@router.get("/item/{code}/deliver")
async def deliver_item(
    request: Request, code: str, db: Session = Depends(database.get_db)
):
    item = crud.update_item_status(db, code, "delivered", "date_delivered")
    if item:
        return templates.TemplateResponse(
            "message.html",
            {
                "request": request,
                "message": "Article marqué comme livré",
                "back_url": "/",
            },
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")


@router.get("/item/{code}/storage")
async def suggest_storage(
    request: Request, code: str, db: Session = Depends(database.get_db)
):
    item = crud.get_item(db, code)
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    if item.status != "cleaned":
        raise HTTPException(status_code=400, detail="Article pas encore nettoyé")

    desc = item.description.lower()
    suggestion = None
    for sug in config.get("storage_suggestions", []):
        if any(keyword in desc for keyword in sug["keywords"]):
            suggestion = sug["suggestion"]
            break
    if suggestion is None:
        if config.get("storage_suggestions"):
            suggestion = config["storage_suggestions"][-1]["suggestion"]
        else:
            suggestion = "Stockage par défaut"

    return templates.TemplateResponse(
        "storage.html", {"request": request, "suggestion": suggestion, "code": code}
    )


@router.get("/pending", response_class=HTMLResponse)
async def pending_form(request: Request):
    return templates.TemplateResponse("pending.html", {"request": request})


@router.post("/pending")
async def get_pending_items(
    request: Request, days: int = Form(...), db: Session = Depends(database.get_db)
):
    items = crud.get_pending_items(db, days)
    items_list = []
    for item in items:
        items_list.append(
            {
                "id": item.id,
                "description": item.description,
                "owner": item.owner,
                "price": item.price,
                "status": item.status,
                "date_received": (
                    item.date_received.isoformat() if item.date_received else None
                ),
                "date_cleaned": (
                    item.date_cleaned.isoformat() if item.date_cleaned else None
                ),
                "notes": item.notes,
                "date_delivered": (
                    item.date_delivered.isoformat() if item.date_delivered else None
                ),
                "contact": item.contact,
                "date_promised": (
                    item.date_promised.isoformat() if item.date_promised else None
                ),
            }
        )
    return templates.TemplateResponse(
        "pending_list.html", {"request": request, "pending_items": items_list}
    )


@router.get("/owner", response_class=HTMLResponse)
async def owner_form(request: Request):
    return templates.TemplateResponse("owner.html", {"request": request})


@router.post("/owner")
async def get_items_by_owner(
    request: Request, owner: str = Form(...), db: Session = Depends(database.get_db)
):
    items = crud.get_items_by_owner(db, owner)
    items_list = []
    for item in items:
        items_list.append(
            {
                "id": item.id,
                "description": item.description,
                "owner": item.owner,
                "price": item.price,
                "status": item.status,
                "date_received": (
                    item.date_received.isoformat() if item.date_received else None
                ),
                "date_cleaned": (
                    item.date_cleaned.isoformat() if item.date_cleaned else None
                ),
                "notes": item.notes,
                "date_delivered": (
                    item.date_delivered.isoformat() if item.date_delivered else None
                ),
                "contact": item.contact,
                "date_promised": (
                    item.date_promised.isoformat() if item.date_promised else None
                ),
            }
        )
    return templates.TemplateResponse(
        "owner_list.html",
        {"request": request, "items": items_list, "owner": owner.upper()},
    )


@router.get("/stats", response_class=HTMLResponse)
async def stats_page(request: Request, db: Session = Depends(database.get_db)):
    stats = crud.get_stats(db)
    return templates.TemplateResponse(
        "stats.html", {"request": request, "stats": stats}
    )


@router.get("/deadlines", response_class=HTMLResponse)
async def deadlines_form(request: Request):
    return templates.TemplateResponse("deadlines.html", {"request": request})


@router.post("/deadlines")
async def get_deadlines(
    request: Request, owner: str = Form(""), db: Session = Depends(database.get_db)
):
    items = crud.get_items_with_deadlines(db, owner if owner else None)
    items_list = []
    now = datetime.now()
    for item in items:
        days_left = None
        if item.date_promised:
            days_left = (item.date_promised - now).days
        items_list.append(
            {
                "id": item.id,
                "description": item.description,
                "owner": item.owner,
                "price": item.price,
                "status": item.status,
                "date_received": (
                    item.date_received.isoformat() if item.date_received else None
                ),
                "date_cleaned": (
                    item.date_cleaned.isoformat() if item.date_cleaned else None
                ),
                "notes": item.notes,
                "date_delivered": (
                    item.date_delivered.isoformat() if item.date_delivered else None
                ),
                "contact": item.contact,
                "date_promised": (
                    item.date_promised.isoformat() if item.date_promised else None
                ),
                "days_left": days_left,
            }
        )
    return templates.TemplateResponse(
        "deadlines_list.html", {"request": request, "items": items_list, "owner": owner.upper() if owner else None}
    )


@router.get("/item/{code}")
async def view_item(
    request: Request, code: str, db: Session = Depends(database.get_db)
):
    item = crud.get_item(db, code)
    if item:
        item_dict = {
            "id": item.id,
            "description": item.description,
            "owner": item.owner,
            "price": item.price,
            "status": item.status,
            "date_received": (
                item.date_received.isoformat() if item.date_received else None
            ),
            "date_cleaned": (
                item.date_cleaned.isoformat() if item.date_cleaned else None
            ),
            "notes": item.notes,
            "date_delivered": (
                item.date_delivered.isoformat() if item.date_delivered else None
            ),
            "contact": item.contact,
            "date_promised": (
                item.date_promised.isoformat() if item.date_promised else None
            ),
        }
        return templates.TemplateResponse(
            "item_details.html", {"request": request, "item": item_dict}
        )
    raise HTTPException(status_code=404, detail="Article non trouvé")
