from pydantic import BaseModel, Field, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional


# Guest Schemas
class GuestBase(BaseModel):
    """Base schema for Guest."""
    first_name: str = Field(..., min_length=1, max_length=100, description="Guest first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Guest last name")
    email: Optional[EmailStr] = Field(None, description="Guest email address")
    phone: Optional[str] = Field(None, max_length=50, description="Guest phone number")
    
    # Address
    street: Optional[str] = Field(None, max_length=255, description="Street address")
    city: Optional[str] = Field(None, max_length=100, description="City")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    
    # Dietary preferences
    intolerances: Optional[str] = Field(None, max_length=1000, description="Food intolerances (comma-separated)")
    favorites: Optional[str] = Field(None, max_length=1000, description="Favorite foods (comma-separated)")
    dietary_notes: Optional[str] = Field(None, max_length=2000, description="Additional dietary notes")
    
    # Image
    image_path: Optional[str] = Field(None, description="Path to guest image")


class GuestCreate(GuestBase):
    """Schema for creating a guest."""
    pass


class GuestUpdate(BaseModel):
    """Schema for updating a guest."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    
    # Address
    street: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    
    # Dietary preferences
    intolerances: Optional[str] = Field(None, max_length=1000)
    favorites: Optional[str] = Field(None, max_length=1000)
    dietary_notes: Optional[str] = Field(None, max_length=2000)
    
    # Image
    image_path: Optional[str] = None


class GuestResponse(GuestBase):
    """Schema for guest response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class GuestWithEventsResponse(GuestResponse):
    """Schema for guest response with event count."""
    event_count: int = Field(0, description="Number of events this guest is invited to")

    model_config = ConfigDict(from_attributes=True)


# Event-Guest Association Schemas
class EventGuestAssign(BaseModel):
    """Schema for assigning a guest to an event."""
    guest_id: int = Field(..., description="Guest ID to assign to event")


class EventGuestResponse(BaseModel):
    """Schema for event-guest association response."""
    event_id: int
    guest_id: int
    guest_name: str = Field(..., description="Full name of the guest")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Made with Bob