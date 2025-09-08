import os
import uuid
from datetime import datetime

import yaml
from fastapi import APIRouter, Body, Depends, Header, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates

from . import crud
from .firebase_admin import verify_firebase_token

templates = Jinja2Templates(directory="templates")
config_path = "config.yml"
if os.path.exists(config_path):
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
else:
    config = {"storage_suggestions": []}

router = APIRouter()


# --- Auth Dependency ---
def get_current_user(authorization: str = Header(None)):
    """Verify Firebase token from Authorization header and return user info."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Extract token from "Bearer <token>"
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization[7:]  # Remove "Bearer "
    decoded = verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    return {
        "uid": decoded["uid"],
        "email": decoded.get("email"),
        "name": decoded.get("name"),
    }


# --- Auth Routes ---
@router.post("/login")
def login(data: dict = Body(...)):
    """Verify Firebase ID token and return user info."""
    id_token = data.get("idToken")
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing idToken")
    decoded = verify_firebase_token(id_token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    # You can add logic here to create a user in your DB if needed
    return {
        "uid": decoded["uid"],
        "email": decoded.get("email"),
        "name": decoded.get("name"),
        "token": id_token,
    }


# --- Items CRUD ---
@router.get("/items")
def list_items(
    status: str = Query(None),
    owner: str = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """List items, filter by status or owner."""
    if owner:
        items = crud.get_items_by_owner(owner)
    else:
        items = crud.get_all_items()
    if status:
        items = [i for i in items if i.get("status") == status]
    # Sort by date_received desc
    items = sorted(
        items, key=lambda i: i.get("date_received") or datetime.min, reverse=True
    )
    return items


@router.post("/items")
def create_item(
    item: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Create a new clothing item."""
    item["id"] = str(uuid.uuid4())
    item["date_received"] = item.get("date_received") or datetime.now().isoformat()
    obj = crud.create_item(item)
    return obj


@router.get("/items/{item_id}")
def get_item(
    item_id: str,
    current_user: dict = Depends(get_current_user),
):
    item = crud.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return item


@router.patch("/items/{item_id}/status")
def update_status(
    item_id: str,
    status: str = Body(...),
    current_user: dict = Depends(get_current_user),
):
    if status not in ("received", "cleaned", "delivered"):
        raise HTTPException(status_code=400, detail="Statut invalide")
    item = crud.update_item_status(item_id, status)
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return item


# --- Deadlines ---
@router.get("/items/deadlines")
def get_deadlines(
    owner: str = Query(None),
    current_user: dict = Depends(get_current_user),
):
    items = crud.get_items_with_deadlines(owner if owner else None)
    now = datetime.now()
    result = []
    for item in items:
        days_left = None
        if item.get("date_promised"):
            promised_date = datetime.fromisoformat(item["date_promised"])
            days_left = (promised_date - now).days
        d = item.copy()
        d["days_left"] = days_left
        result.append(d)
    return result


# --- Stats ---
@router.get("/stats")
def get_stats(
    current_user: dict = Depends(get_current_user),
):
    return crud.get_stats()


# --- Storage (export/import/clear) ---
@router.get("/items/export")
def export_items(
    current_user: dict = Depends(get_current_user),
):
    items = crud.get_all_items()
    return JSONResponse(content={"items": items})


@router.post("/items/import")
def import_items(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    items = data.get("items", [])
    if not isinstance(items, list):
        raise HTTPException(status_code=400, detail="Format d'import invalide")
    crud.clear_items()
    for item in items:
        item["id"] = item.get("id") or str(uuid.uuid4())
        crud.create_item(item)
    return {"success": True, "count": len(items)}


@router.post("/items/clear")
def clear_items(
    current_user: dict = Depends(get_current_user),
):
    crud.clear_items()
    return {"success": True}
