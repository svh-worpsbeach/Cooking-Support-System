from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


# Location Schemas
class LocationBase(BaseModel):
    """Base schema for Location."""
    name: str = Field(..., min_length=1, max_length=255, description="Location name")
    description: Optional[str] = Field(None, description="Location description")


class LocationCreate(LocationBase):
    """Schema for creating a location."""
    pass


class LocationUpdate(BaseModel):
    """Schema for updating a location."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class LocationResponse(LocationBase):
    """Schema for location response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Made with Bob