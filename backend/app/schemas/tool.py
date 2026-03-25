from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional


# Cooking Tool Schemas
class CookingToolBase(BaseModel):
    """Base schema for CookingTool."""
    name: str = Field(..., min_length=1, max_length=255, description="Tool name")
    description: Optional[str] = Field(None, description="Tool description")
    storage_location: Optional[str] = Field(None, max_length=255, description="Specific storage location within the location")


class CookingToolCreate(CookingToolBase):
    """Schema for creating a cooking tool."""
    location_id: int = Field(..., description="Location ID where the tool is stored")


class CookingToolUpdate(BaseModel):
    """Schema for updating a cooking tool."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    location_id: Optional[int] = None
    storage_location: Optional[str] = Field(None, max_length=255)


class CookingToolResponse(CookingToolBase):
    """Schema for cooking tool response."""
    id: int
    location_id: int
    image_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CookingToolWithLocation(CookingToolResponse):
    """Schema for cooking tool response with location details."""
    location_name: str = Field(..., description="Name of the location where tool is stored")

    model_config = ConfigDict(from_attributes=True)


# Tool Wishlist Schemas
class ToolWishlistBase(BaseModel):
    """Base schema for ToolWishlist."""
    name: str = Field(..., min_length=1, max_length=255, description="Tool name")
    description: Optional[str] = Field(None, description="Tool description")
    url: Optional[str] = Field(None, description="Product page URL")
    estimated_price: Optional[float] = Field(None, ge=0, description="Estimated price")
    priority: int = Field(3, ge=1, le=5, description="Priority level (1=highest, 5=lowest)")

    @field_validator('url')
    @classmethod
    def validate_url(cls, url: Optional[str]) -> Optional[str]:
        """Validate URL format if provided."""
        if url and not (url.startswith('http://') or url.startswith('https://')):
            raise ValueError("URL must start with http:// or https://")
        return url


class ToolWishlistCreate(ToolWishlistBase):
    """Schema for creating a tool wishlist item."""
    pass


class ToolWishlistUpdate(BaseModel):
    """Schema for updating a tool wishlist item."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    url: Optional[str] = None
    estimated_price: Optional[float] = Field(None, ge=0)
    priority: Optional[int] = Field(None, ge=1, le=5)

    @field_validator('url')
    @classmethod
    def validate_url(cls, url: Optional[str]) -> Optional[str]:
        """Validate URL format if provided."""
        if url and not (url.startswith('http://') or url.startswith('https://')):
            raise ValueError("URL must start with http:// or https://")
        return url


class ToolWishlistResponse(ToolWishlistBase):
    """Schema for tool wishlist response."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Made with Bob