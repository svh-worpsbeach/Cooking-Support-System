from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class IngredientBase(BaseModel):
    """Base schema for ingredient data."""
    name: str = Field(..., min_length=1, max_length=255, description="Ingredient name")
    description: Optional[str] = Field(None, max_length=500, description="Ingredient description")
    default_shop: Optional[str] = Field(None, max_length=100, description="Default shop category")
    default_unit: Optional[str] = Field(None, max_length=50, description="Default unit")


class IngredientCreate(IngredientBase):
    """Schema for creating a new ingredient."""
    pass


class IngredientUpdate(BaseModel):
    """Schema for updating an ingredient."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    default_shop: Optional[str] = Field(None, max_length=100)
    default_unit: Optional[str] = Field(None, max_length=50)


class IngredientResponse(IngredientBase):
    """Schema for ingredient response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Made with Bob