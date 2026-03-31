from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Location(Base):
    """
    Location model for storing physical locations where tools and storage items are kept.
    Examples: Kitchen, Pantry, Garage, etc.
    """
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(1000), nullable=True)
    image_path = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tools = relationship("CookingTool", back_populates="location", cascade="all, delete-orphan")
    storage_items = relationship("StorageItem", back_populates="location", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Location(id={self.id}, name='{self.name}')>"

# Made with Bob
