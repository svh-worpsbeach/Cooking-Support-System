from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional


# Storage Item Schemas
class StorageItemBase(BaseModel):
    """Base schema for StorageItem."""
    name: str = Field(..., min_length=1, max_length=255, description="Item name")
    category: str = Field(..., min_length=1, max_length=100, description="Item category (herb, spice, flavor, oil, vinegar, etc.)")
    quantity: float = Field(..., gt=0, description="Item quantity")
    unit: str = Field(..., min_length=1, max_length=50, description="Unit of measurement (g, ml, pieces, tsp, tbsp, etc.)")
    expiry_date: Optional[datetime] = Field(None, description="Expiry date")

    @field_validator('category')
    @classmethod
    def validate_category(cls, category: str) -> str:
        """Validate and normalize category."""
        valid_categories = ['herb', 'spice', 'flavor', 'oil', 'vinegar', 'sauce', 'condiment', 'baking', 'other']
        category_lower = category.lower()
        if category_lower not in valid_categories:
            # Allow custom categories but provide a warning in logs
            pass
        return category

    @field_validator('unit')
    @classmethod
    def validate_unit(cls, unit: str) -> str:
        """Validate unit of measurement."""
        valid_units = ['g', 'kg', 'ml', 'l', 'pieces', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'pinch', 'dash']
        unit_lower = unit.lower()
        if unit_lower not in valid_units:
            # Allow custom units but provide a warning in logs
            pass
        return unit


class StorageItemCreate(StorageItemBase):
    """Schema for creating a storage item."""
    location_id: int = Field(..., description="Location ID where the item is stored")


class StorageItemUpdate(BaseModel):
    """Schema for updating a storage item."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    location_id: Optional[int] = None
    expiry_date: Optional[datetime] = None

    @field_validator('category')
    @classmethod
    def validate_category(cls, category: Optional[str]) -> Optional[str]:
        """Validate and normalize category."""
        if category is None:
            return None
        valid_categories = ['herb', 'spice', 'flavor', 'oil', 'vinegar', 'sauce', 'condiment', 'baking', 'other']
        category_lower = category.lower()
        if category_lower not in valid_categories:
            # Allow custom categories but provide a warning in logs
            pass
        return category

    @field_validator('unit')
    @classmethod
    def validate_unit(cls, unit: Optional[str]) -> Optional[str]:
        """Validate unit of measurement."""
        if unit is None:
            return None
        valid_units = ['g', 'kg', 'ml', 'l', 'pieces', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'pinch', 'dash']
        unit_lower = unit.lower()
        if unit_lower not in valid_units:
            # Allow custom units but provide a warning in logs
            pass
        return unit


class StorageItemResponse(StorageItemBase):
    """Schema for storage item response."""
    id: int
    location_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StorageItemWithLocation(StorageItemResponse):
    """Schema for storage item response with location details."""
    location_name: str = Field(..., description="Name of the location where item is stored")

    model_config = ConfigDict(from_attributes=True)


class StorageItemQuantityUpdate(BaseModel):
    """Schema for updating only the quantity of a storage item."""
    quantity: float = Field(..., gt=0, description="New quantity")
    operation: str = Field(..., pattern="^(set|add|subtract)$", description="Operation type: set, add, or subtract")

    @field_validator('operation')
    @classmethod
    def validate_operation(cls, operation: str) -> str:
        """Validate operation type."""
        valid_operations = ['set', 'add', 'subtract']
        if operation not in valid_operations:
            raise ValueError(f"Operation must be one of: {', '.join(valid_operations)}")
        return operation


# Made with Bob