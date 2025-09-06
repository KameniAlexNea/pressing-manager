from sqlalchemy import Column, DateTime, Float, String, JSON
from sqlalchemy.sql import func

from .database import Base

class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(String, primary_key=True, index=True)
    items = Column(JSON, nullable=True)  # List of ItemLine objects
    description = Column(String, nullable=True, index=True)
    owner = Column(String, index=True)
    price = Column(Float)
    status = Column(String, default="received")
    date_received = Column(DateTime(timezone=True), server_default=func.now())
    date_cleaned = Column(DateTime(timezone=True), nullable=True)
    date_delivered = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    date_promised = Column(DateTime(timezone=True), nullable=True)
    image = Column(String, nullable=True)  # base64 or data URL
    amount_given = Column(Float, nullable=True)  # payment at registration