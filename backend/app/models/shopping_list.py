from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    due_date = Column(Date, nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    items = relationship("ShoppingListItem", back_populates="shopping_list", cascade="all, delete-orphan")
    event = relationship("Event", back_populates="shopping_lists")
    recipe = relationship("Recipe", back_populates="shopping_lists")


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    id = Column(Integer, primary_key=True, index=True)
    shopping_list_id = Column(Integer, ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    shop = Column(String, nullable=True)  # Category/shop for sorting
    checked = Column(Integer, default=0)  # 0 = unchecked, 1 = checked
    order_index = Column(Integer, default=0)

    # Relationships
    shopping_list = relationship("ShoppingList", back_populates="items")

# Made with Bob
