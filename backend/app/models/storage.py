from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class StorageItem(Base):
    """
    Storage item model for storing herbs, spices, and cooking supplies.
    """
    __tablename__ = "storage_items"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)  # e.g., "herb", "spice", "flavor", "oil", "vinegar"
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # e.g., "g", "ml", "pieces", "tsp", "tbsp"
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    location = relationship("Location", back_populates="storage_items")
    step_refs = relationship("StepStorageRef", back_populates="storage_item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<StorageItem(id={self.id}, name='{self.name}', quantity={self.quantity} {self.unit})>"

# Made with Bob
