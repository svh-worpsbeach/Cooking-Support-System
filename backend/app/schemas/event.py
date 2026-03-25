from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List


# Event Participant Schemas
class EventParticipantBase(BaseModel):
    """Base schema for EventParticipant."""
    name: str = Field(..., min_length=1, max_length=255, description="Participant name")
    dietary_restrictions: Optional[str] = Field(None, description="Dietary restrictions or preferences")


class EventParticipantCreate(EventParticipantBase):
    """Schema for creating an event participant."""
    pass


class EventParticipantUpdate(BaseModel):
    """Schema for updating an event participant."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    dietary_restrictions: Optional[str] = None


class EventParticipantResponse(EventParticipantBase):
    """Schema for event participant response."""
    id: int
    event_id: int

    model_config = ConfigDict(from_attributes=True)


# Course Recipe Schemas
class CourseRecipeCreate(BaseModel):
    """Schema for creating a course recipe."""
    recipe_id: int = Field(..., description="Recipe ID")


class CourseRecipeResponse(CourseRecipeCreate):
    """Schema for course recipe response."""
    id: int
    course_id: int

    model_config = ConfigDict(from_attributes=True)


# Event Course Schemas
class EventCourseBase(BaseModel):
    """Base schema for EventCourse."""
    course_number: int = Field(..., ge=1, description="Course number in sequence")
    course_name: str = Field(..., min_length=1, max_length=255, description="Course name")


class EventCourseCreate(EventCourseBase):
    """Schema for creating an event course."""
    recipe_ids: List[int] = Field(default_factory=list, description="Recipe IDs for this course")


class EventCourseUpdate(BaseModel):
    """Schema for updating an event course."""
    course_number: Optional[int] = Field(None, ge=1)
    course_name: Optional[str] = Field(None, min_length=1, max_length=255)
    recipe_ids: Optional[List[int]] = None


class EventCourseResponse(EventCourseBase):
    """Schema for event course response."""
    id: int
    event_id: int

    model_config = ConfigDict(from_attributes=True)


class EventCourseDetailResponse(EventCourseResponse):
    """Schema for detailed event course response with recipes."""
    recipes: List[CourseRecipeResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# Shopping List Item Schemas
class ShoppingListItemBase(BaseModel):
    """Base schema for ShoppingListItem."""
    item_name: str = Field(..., min_length=1, max_length=255, description="Item name")
    quantity: float = Field(..., gt=0, description="Item quantity")
    unit: str = Field(..., min_length=1, max_length=50, description="Unit of measurement")
    is_purchased: bool = Field(False, description="Whether item has been purchased")
    source: Optional[str] = Field(None, max_length=50, description="Source of item (recipe, manual, storage)")


class ShoppingListItemCreate(ShoppingListItemBase):
    """Schema for creating a shopping list item."""
    pass


class ShoppingListItemUpdate(BaseModel):
    """Schema for updating a shopping list item."""
    item_name: Optional[str] = Field(None, min_length=1, max_length=255)
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    is_purchased: Optional[bool] = None
    source: Optional[str] = Field(None, max_length=50)


class ShoppingListItemResponse(ShoppingListItemBase):
    """Schema for shopping list item response."""
    id: int
    shopping_list_id: int

    model_config = ConfigDict(from_attributes=True)


# Shopping List Schemas
class ShoppingListBase(BaseModel):
    """Base schema for ShoppingList."""
    pass


class ShoppingListCreate(ShoppingListBase):
    """Schema for creating a shopping list."""
    items: List[ShoppingListItemCreate] = Field(default_factory=list, description="Shopping list items")


class ShoppingListResponse(ShoppingListBase):
    """Schema for shopping list response."""
    id: int
    event_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ShoppingListDetailResponse(ShoppingListResponse):
    """Schema for detailed shopping list response with items."""
    items: List[ShoppingListItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# Event Schemas
class EventBase(BaseModel):
    """Base schema for Event."""
    name: str = Field(..., min_length=1, max_length=255, description="Event name")
    description: Optional[str] = Field(None, description="Event description")
    theme: Optional[str] = Field(None, max_length=255, description="Event theme")
    event_date: Optional[datetime] = Field(None, description="Event date and time")


class EventCreate(EventBase):
    """Schema for creating an event."""
    participants: List[EventParticipantCreate] = Field(default_factory=list, description="Event participants")
    courses: List[EventCourseCreate] = Field(default_factory=list, description="Event courses")

    @field_validator('courses')
    @classmethod
    def validate_course_numbers(cls, courses: List[EventCourseCreate]) -> List[EventCourseCreate]:
        """Validate that course numbers are sequential starting from 1."""
        if courses:
            course_numbers = [course.course_number for course in courses]
            expected = list(range(1, len(courses) + 1))
            if sorted(course_numbers) != expected:
                raise ValueError("Course numbers must be sequential starting from 1")
        return courses


class EventUpdate(BaseModel):
    """Schema for updating an event."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    theme: Optional[str] = Field(None, max_length=255)
    event_date: Optional[datetime] = None


class EventResponse(EventBase):
    """Schema for event response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EventDetailResponse(EventResponse):
    """Schema for detailed event response with all related data."""
    participants: List[EventParticipantResponse] = Field(default_factory=list)
    courses: List[EventCourseDetailResponse] = Field(default_factory=list)
    shopping_list: Optional[ShoppingListDetailResponse] = None

    model_config = ConfigDict(from_attributes=True)


# Made with Bob