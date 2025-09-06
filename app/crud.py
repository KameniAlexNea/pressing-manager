from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from . import models


def get_item(db: Session, item_id: str):
    return (
        db.query(models.ClothingItem).filter(models.ClothingItem.id == item_id).first()
    )


def get_items_by_owner(db: Session, owner: str):
    return (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.owner == owner.upper())
        .all()
    )


def get_pending_items(db: Session, days: int):
    cutoff_date = datetime.now() - timedelta(days=days)
    return (
        db.query(models.ClothingItem)
        .filter(
            models.ClothingItem.status != "cleaned",
            models.ClothingItem.date_received < cutoff_date,
        )
        .all()
    )


def create_item(db: Session, item: dict):
    db_item = models.ClothingItem(**item)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_items_with_deadlines(db: Session, owner: str = None):
    query = db.query(models.ClothingItem).filter(
        models.ClothingItem.date_promised.isnot(None)
    )
    if owner:
        query = query.filter(models.ClothingItem.owner == owner.upper())
    return query.order_by(models.ClothingItem.date_promised).all()


def update_item_status(db: Session, item_id: str, status: str, date_field: str = None):
    item = (
        db.query(models.ClothingItem).filter(models.ClothingItem.id == item_id).first()
    )
    if item:
        item.status = status
        if date_field:
            setattr(item, date_field, datetime.now())
        db.commit()
        db.refresh(item)
    return item


def get_stats(db: Session):
    total_items = db.query(models.ClothingItem).count()
    cleaned_items = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.status == "cleaned")
        .count()
    )
    delivered_items = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.status == "delivered")
        .count()
    )
    pending_items = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.status == "received")
        .count()
    )
    total_revenue = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.status == "delivered")
        .with_entities(models.ClothingItem.price)
        .all()
    )
    total_revenue = sum(price[0] for price in total_revenue if price[0])
    return {
        "total_items": total_items,
        "cleaned_items": cleaned_items,
        "delivered_items": delivered_items,
        "pending_items": pending_items,
        "total_revenue": total_revenue,
    }


def item_to_dict(item):
    if not item:
        return None
    return {
        "id": item.id,
        "items": item.items,
        "description": item.description,
        "owner": item.owner,
        "price": item.price,
        "status": item.status,
        "date_received": item.date_received.isoformat() if item.date_received else None,
        "date_cleaned": item.date_cleaned.isoformat() if item.date_cleaned else None,
        "date_delivered": (
            item.date_delivered.isoformat() if item.date_delivered else None
        ),
        "notes": item.notes,
        "contact": item.contact,
        "date_promised": item.date_promised.isoformat() if item.date_promised else None,
        "image": getattr(item, "image", None),
        "amount_given": getattr(item, "amount_given", None),
    }
