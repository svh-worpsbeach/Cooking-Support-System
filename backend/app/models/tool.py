from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CookingTool(Base):
    """
    Cooking tool model for storing cooking tools and equipment.
    """
    __tablename__ = "cooking_tools"

    id = Column(Integer, primary_key=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)
    storage_location = Column(String(255), nullable=True)  # Specific location within the location (e.g., "Top shelf", "Drawer 2")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    location = relationship("Location", back_populates="tools")

    def __repr__(self):
        return f"<CookingTool(id={self.id}, name='{self.name}')>"


class ToolWishlist(Base):
    """
    Tool wishlist model for storing desired tools not yet purchased.
    """
    __tablename__ = "tool_wishlist"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)  # Link to product page
    estimated_price = Column(Float, nullable=True)
    priority = Column(Integer, default=3)  # 1 (highest) to 5 (lowest)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ToolWishlist(id={self.id}, name='{self.name}', priority={self.priority})>"

# Made with Bob
