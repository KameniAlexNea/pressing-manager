from sqlalchemy.orm import Session
from . import models
from datetime import datetime, timedelta
from typing import List, Optional

def get_item(db: Session, item_id: str):
    return db.query(models.ClothingItem).filter(models.ClothingItem.id == item_id).first()

def get_items_by_owner(db: Session, owner: str):
    return db.query(models.ClothingItem).filter(models.ClothingItem.owner == owner.upper()).all()

def get_pending_items(db: Session, days: int):
    cutoff_date = datetime.now() - timedelta(days=days)
    return db.query(models.ClothingItem).filter(
        models.ClothingItem.status != "cleaned",
        models.ClothingItem.date_received < cutoff_date
    ).all()

def create_item(db: Session, item: dict):
    db_item = models.ClothingItem(**item)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item_status(db: Session, item_id: str, status: str, date_field: str = None):
    item = db.query(models.ClothingItem).filter(models.ClothingItem.id == item_id).first()
    if item:
        item.status = status
        if date_field:
            setattr(item, date_field, datetime.now())
        db.commit()
        db.refresh(item)
    return item

def get_stats(db: Session):
    total_items = db.query(models.ClothingItem).count()
    cleaned_items = db.query(models.ClothingItem).filter(models.ClothingItem.status == "cleaned").count()
    delivered_items = db.query(models.ClothingItem).filter(models.ClothingItem.status == "delivered").count()
    pending_items = db.query(models.ClothingItem).filter(models.ClothingItem.status == "received").count()
    total_revenue = db.query(models.ClothingItem).filter(models.ClothingItem.status == "delivered").with_entities(models.ClothingItem.price).all()
    total_revenue = sum(price[0] for price in total_revenue if price[0])
    return {
        "total_items": total_items,
        "cleaned_items": cleaned_items,
        "delivered_items": delivered_items,
        "pending_items": pending_items,
        "total_revenue": total_revenue,
    }
