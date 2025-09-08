from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class ItemLine:
    id: str
    type: str  # e.g., "shirt", "pants", "dress", "jacket"
    description: Optional[str] = None
    quantity: int = 1
    price: float = 0.0
    notes: Optional[str] = None


@dataclass
class ClothingItem:
    id: str
    items: Optional[List[ItemLine]] = None  # List of ItemLine objects
    description: Optional[str] = None
    owner: str = ""
    price: float = 0.0
    status: str = "received"
    date_received: Optional[datetime] = None
    date_cleaned: Optional[datetime] = None
    date_delivered: Optional[datetime] = None
    notes: Optional[str] = None
    contact: Optional[str] = None
    date_promised: Optional[datetime] = None
    image: Optional[str] = None  # base64 or data URL
    amount_given: Optional[float] = None  # payment at registration
