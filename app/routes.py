import os
import uuid
from datetime import datetime

import yaml
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from . import crud, database

templates = Jinja2Templates(directory="templates")
config_path = "config.yml"
if os.path.exists(config_path):
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
else:
    config = {"storage_suggestions": []}

router = APIRouter()


# --- Items CRUD ---
@router.get("/items")
def list_items(
    status: str = Query(None),
    owner: str = Query(None),
    db: Session = Depends(database.get_db),
):
    """List items, filter by status or owner."""
    if owner:
        items = crud.get_items_by_owner(db, owner)
    else:
        items = crud.get_all_items(db)
    if status:
        items = [i for i in items if i.status == status]
    # Sort by date_received desc
    items = sorted(items, key=lambda i: i.date_received or datetime.min, reverse=True)
    return [crud.item_to_dict(i) for i in items]


@router.post("/items")
def create_item(
    item: dict = Body(...),
    db: Session = Depends(database.get_db),
):
    """Create a new clothing item."""
    item["id"] = str(uuid.uuid4())
    item["date_received"] = item.get("date_received") or datetime.now().isoformat()
    obj = crud.create_item(db, item)
    return crud.item_to_dict(obj)


@router.get("/items/{item_id}")
def get_item(item_id: str, db: Session = Depends(database.get_db)):
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return crud.item_to_dict(item)


@router.patch("/items/{item_id}/status")
def update_status(
    item_id: str, status: str = Body(...), db: Session = Depends(database.get_db)
):
    if status not in ("received", "cleaned", "delivered"):
        raise HTTPException(status_code=400, detail="Statut invalide")
    item = crud.update_item_status(db, item_id, status)
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return crud.item_to_dict(item)


# --- Deadlines ---
@router.get("/items/deadlines")
def get_deadlines(owner: str = Query(None), db: Session = Depends(database.get_db)):
    items = crud.get_items_with_deadlines(db, owner if owner else None)
    now = datetime.now()
    result = []
    for item in items:
        days_left = None
        if item.date_promised:
            days_left = (item.date_promised - now).days
        d = crud.item_to_dict(item)
        d["days_left"] = days_left
        result.append(d)
    return result


# --- Stats ---
@router.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    return crud.get_stats(db)


# --- Storage (export/import/clear) ---
@router.get("/items/export")
def export_items(db: Session = Depends(database.get_db)):
    items = crud.get_all_items(db)
    return JSONResponse(content={"items": [crud.item_to_dict(i) for i in items]})


@router.post("/items/import")
def import_items(data: dict = Body(...), db: Session = Depends(database.get_db)):
    items = data.get("items", [])
    if not isinstance(items, list):
        raise HTTPException(status_code=400, detail="Format d'import invalide")
    crud.clear_items(db)
    for item in items:
        item["id"] = item.get("id") or str(uuid.uuid4())
        crud.create_item(db, item)
    return {"success": True, "count": len(items)}


@router.post("/items/clear")
def clear_items(db: Session = Depends(database.get_db)):
    crud.clear_items(db)
    return {"success": True}
