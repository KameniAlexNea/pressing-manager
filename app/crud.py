import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import firebase_admin
from firebase_admin import firestore

# Initialize Firebase if not already done
try:
    firebase_admin.get_app()
except ValueError:
    # Firebase not initialized, try to initialize it
    json_path = os.path.join(
        os.path.dirname(__file__), "..", "pressing-manager-35903.json"
    )
    if os.path.exists(json_path):
        from firebase_admin import credentials

        cred = credentials.Certificate(json_path)
        firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()


def get_item(item_id: str) -> Optional[Dict[str, Any]]:
    """Get a single item by ID from Firestore"""
    try:
        doc_ref = db.collection("clothing_items").document(item_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None
    except Exception as e:
        print(f"Error getting item {item_id}: {e}")
        return None


def get_items_by_owner(owner: str) -> List[Dict[str, Any]]:
    """Get all items by owner from Firestore"""
    try:
        docs = (
            db.collection("clothing_items").where("owner", "==", owner.upper()).stream()
        )
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        print(f"Error getting items for owner {owner}: {e}")
        return []


def get_pending_items(days: int) -> List[Dict[str, Any]]:
    """Get pending items older than specified days from Firestore"""
    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        docs = (
            db.collection("clothing_items")
            .where("status", "!=", "cleaned")
            .where("date_received", "<", cutoff_date)
            .stream()
        )
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        print(f"Error getting pending items: {e}")
        return []


def create_item(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create a new item in Firestore"""
    try:
        doc_ref = db.collection("clothing_items").document(item["id"])
        doc_ref.set(item)
        return item
    except Exception as e:
        print(f"Error creating item: {e}")
        return None


def get_items_with_deadlines(owner: str = None) -> List[Dict[str, Any]]:
    """Get items with deadlines from Firestore"""
    try:
        query = db.collection("clothing_items").where("date_promised", "!=", None)

        if owner:
            query = query.where("owner", "==", owner.upper())

        docs = query.order_by("date_promised").stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        print(f"Error getting items with deadlines: {e}")
        return []


def update_item_status(
    item_id: str, status: str, date_field: str = None
) -> Optional[Dict[str, Any]]:
    """Update item status in Firestore"""
    try:
        doc_ref = db.collection("clothing_items").document(item_id)
        update_data = {"status": status}

        if date_field:
            update_data[date_field] = datetime.now()

        doc_ref.update(update_data)

        # Get updated document
        updated_doc = doc_ref.get()
        if updated_doc.exists:
            return updated_doc.to_dict()
        return None
    except Exception as e:
        print(f"Error updating item {item_id}: {e}")
        return None


def get_stats() -> Dict[str, Any]:
    """Get statistics from Firestore"""
    try:
        # Get all documents
        docs = db.collection("clothing_items").stream()
        items = [doc.to_dict() for doc in docs]

        total_items = len(items)
        cleaned_items = len([item for item in items if item.get("status") == "cleaned"])
        delivered_items = len(
            [item for item in items if item.get("status") == "delivered"]
        )
        pending_items = len(
            [item for item in items if item.get("status") == "received"]
        )

        total_revenue = sum(
            item.get("price", 0) for item in items if item.get("status") == "delivered"
        )

        return {
            "total_items": total_items,
            "cleaned_items": cleaned_items,
            "delivered_items": delivered_items,
            "pending_items": pending_items,
            "total_revenue": total_revenue,
        }
    except Exception as e:
        print(f"Error getting stats: {e}")
        return {
            "total_items": 0,
            "cleaned_items": 0,
            "delivered_items": 0,
            "pending_items": 0,
            "total_revenue": 0,
        }


def item_to_dict(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert Firestore item to dict format (already in dict format)"""
    if not item:
        return {}
    return item


def clear_items() -> bool:
    """Clear all items from Firestore (WARNING: This deletes all data!)"""
    try:
        # Get all documents
        docs = db.collection("clothing_items").stream()

        # Delete in batches
        batch = db.batch()
        count = 0

        for doc in docs:
            batch.delete(doc.reference)
            count += 1

            # Commit every 10 deletions
            if count % 10 == 0:
                batch.commit()
                batch = db.batch()

        # Commit remaining deletions
        if count % 10 != 0:
            batch.commit()

        print(f"Deleted {count} items from Firestore")
        return True
    except Exception as e:
        print(f"Error clearing items: {e}")
        return False


def get_all_items() -> List[Dict[str, Any]]:
    """Get all items from Firestore"""
    try:
        docs = db.collection("clothing_items").stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        print(f"Error getting all items: {e}")
        return []


def update_items_list(
    item_id: str, items_list: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """Update the items list for a specific item in Firestore"""
    try:
        doc_ref = db.collection("clothing_items").document(item_id)
        doc_ref.update({"items": items_list, "updated_at": datetime.now()})

        # Get updated document
        updated_doc = doc_ref.get()
        if updated_doc.exists:
            return updated_doc.to_dict()
        return None
    except Exception as e:
        print(f"Error updating items list for {item_id}: {e}")
        return None
