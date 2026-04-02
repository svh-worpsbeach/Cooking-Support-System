from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import Optional, List


# Shopping List Item Schemas
class ShoppingListItemBase(BaseModel):
    """Base schema for ShoppingListItem."""
    name: str = Field(..., min_length=1, max_length=255, description="Item name")
    amount: Optional[float] = Field(None, gt=0, description="Item amount")
    unit: Optional[str] = Field(None, max_length=50, description="Unit of measurement")
    shop: Optional[str] = Field(None, max_length=100, description="Shop category")
    checked: int = Field(0, ge=0, le=1, description="0 = unchecked, 1 = checked")
    order_index: int = Field(0, ge=0, description="Order index for sorting")


class ShoppingListItemCreate(ShoppingListItemBase):
    """Schema for creating a shopping list item."""
    pass


class ShoppingListItemUpdate(BaseModel):
    """Schema for updating a shopping list item."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=50)
    shop: Optional[str] = Field(None, max_length=100)
    checked: Optional[int] = Field(None, ge=0, le=1)
    order_index: Optional[int] = Field(None, ge=0)


class ShoppingListItemResponse(ShoppingListItemBase):
    """Schema for shopping list item response."""
    id: int
    shopping_list_id: int

    model_config = ConfigDict(from_attributes=True)


# Shopping List Schemas
class ShoppingListBase(BaseModel):
    """Base schema for ShoppingList."""
    title: str = Field(..., min_length=1, max_length=255, description="Shopping list title")
    due_date: date = Field(..., description="Due date for shopping")


class ShoppingListCreate(ShoppingListBase):
    """Schema for creating a shopping list."""
    event_id: Optional[int] = Field(None, description="Associated event ID")
    recipe_id: Optional[int] = Field(None, description="Associated recipe ID")
    items: List[ShoppingListItemCreate] = Field(default_factory=list, description="Shopping list items")


class ShoppingListUpdate(BaseModel):
    """Schema for updating a shopping list."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    due_date: Optional[date] = None
    event_id: Optional[int] = None
    recipe_id: Optional[int] = None


class ShoppingListResponse(ShoppingListBase):
    """Schema for shopping list response."""
    id: int
    event_id: Optional[int] = None
    recipe_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ShoppingListDetailResponse(ShoppingListResponse):
    """Schema for detailed shopping list response with items."""
    items: List[ShoppingListItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# Schema for creating shopping list from event
class ShoppingListFromEventCreate(BaseModel):
    """Schema for creating a shopping list from an event."""
    title: Optional[str] = Field(None, description="Custom title (defaults to event name)")
    due_date: Optional[date] = Field(None, description="Custom due date (defaults to event date)")


# Schema for creating shopping list from recipe
class ShoppingListFromRecipeCreate(BaseModel):
    """Schema for creating a shopping list from a recipe."""
    title: Optional[str] = Field(None, description="Custom title (defaults to recipe name)")
    due_date: Optional[date] = Field(None, description="Custom due date (defaults to next Saturday)")
    servings_multiplier: float = Field(1.0, gt=0, description="Multiplier for ingredient amounts")

# Made with Bob