from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Ingredient(Base):
    """
    Master ingredient catalog for consistent ingredient naming and shop assignment.
    """
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(String(500), nullable=True)
    default_shop = Column(String(100), nullable=True)  # Default shop category (e.g., "Supermarkt", "Bäcker")
    default_unit = Column(String(50), nullable=True)  # Default unit (e.g., "g", "ml", "Stück")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Ingredient(id={self.id}, name='{self.name}', shop='{self.default_shop}')>"

# Made with Bob