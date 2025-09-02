from sqlalchemy import Column, DateTime, Float, String
from sqlalchemy.sql import func

from .database import Base


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(String, primary_key=True, index=True)
    description = Column(String, index=True)
    owner = Column(String, index=True)
    price = Column(Float)
    status = Column(String, default="received")
    date_received = Column(DateTime(timezone=True), server_default=func.now())
    date_cleaned = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    date_delivered = Column(DateTime(timezone=True), nullable=True)
    contact = Column(String, nullable=True)
