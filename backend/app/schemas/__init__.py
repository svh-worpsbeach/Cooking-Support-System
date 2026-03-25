"""
Pydantic schemas for request/response validation.

This module exports all schema classes for use in FastAPI endpoints.
"""

# Location schemas
from .location import (
    LocationBase,
    LocationCreate,
    LocationUpdate,
    LocationResponse,
)

# Recipe schemas
from .recipe import (
    RecipeCategoryBase,
    RecipeCategoryCreate,
    RecipeCategoryResponse,
    RecipeIngredientBase,
    RecipeIngredientCreate,
    RecipeIngredientUpdate,
    RecipeIngredientResponse,
    RecipeStepBase,
    RecipeStepCreate,
    RecipeStepUpdate,
    RecipeStepResponse,
    RecipeImageBase,
    RecipeImageCreate,
    RecipeImageResponse,
    RecipeBase,
    RecipeCreate,
    RecipeUpdate,
    RecipeResponse,
    RecipeDetailResponse,
    StepIngredientRefCreate,
    StepIngredientRefResponse,
    StepStorageRefCreate,
    StepStorageRefResponse,
)

# Event schemas
from .event import (
    EventParticipantBase,
    EventParticipantCreate,
    EventParticipantUpdate,
    EventParticipantResponse,
    CourseRecipeCreate,
    CourseRecipeResponse,
    EventCourseBase,
    EventCourseCreate,
    EventCourseUpdate,
    EventCourseResponse,
    EventCourseDetailResponse,
    ShoppingListItemBase,
    ShoppingListItemCreate,
    ShoppingListItemUpdate,
    ShoppingListItemResponse,
    ShoppingListBase,
    ShoppingListCreate,
    ShoppingListResponse,
    ShoppingListDetailResponse,
    EventBase,
    EventCreate,
    EventUpdate,
    EventResponse,
    EventDetailResponse,
)

# Tool schemas
from .tool import (
    CookingToolBase,
    CookingToolCreate,
    CookingToolUpdate,
    CookingToolResponse,
    CookingToolWithLocation,
    ToolWishlistBase,
    ToolWishlistCreate,
    ToolWishlistUpdate,
    ToolWishlistResponse,
)

# Storage schemas
from .storage import (
    StorageItemBase,
    StorageItemCreate,
    StorageItemUpdate,
    StorageItemResponse,
    StorageItemWithLocation,
    StorageItemQuantityUpdate,
)

__all__ = [
    # Location
    "LocationBase",
    "LocationCreate",
    "LocationUpdate",
    "LocationResponse",
    # Recipe
    "RecipeCategoryBase",
    "RecipeCategoryCreate",
    "RecipeCategoryResponse",
    "RecipeIngredientBase",
    "RecipeIngredientCreate",
    "RecipeIngredientUpdate",
    "RecipeIngredientResponse",
    "RecipeStepBase",
    "RecipeStepCreate",
    "RecipeStepUpdate",
    "RecipeStepResponse",
    "RecipeImageBase",
    "RecipeImageCreate",
    "RecipeImageResponse",
    "RecipeBase",
    "RecipeCreate",
    "RecipeUpdate",
    "RecipeResponse",
    "RecipeDetailResponse",
    "StepIngredientRefCreate",
    "StepIngredientRefResponse",
    "StepStorageRefCreate",
    "StepStorageRefResponse",
    # Event
    "EventParticipantBase",
    "EventParticipantCreate",
    "EventParticipantUpdate",
    "EventParticipantResponse",
    "CourseRecipeCreate",
    "CourseRecipeResponse",
    "EventCourseBase",
    "EventCourseCreate",
    "EventCourseUpdate",
    "EventCourseResponse",
    "EventCourseDetailResponse",
    "ShoppingListItemBase",
    "ShoppingListItemCreate",
    "ShoppingListItemUpdate",
    "ShoppingListItemResponse",
    "ShoppingListBase",
    "ShoppingListCreate",
    "ShoppingListResponse",
    "ShoppingListDetailResponse",
    "EventBase",
    "EventCreate",
    "EventUpdate",
    "EventResponse",
    "EventDetailResponse",
    # Tool
    "CookingToolBase",
    "CookingToolCreate",
    "CookingToolUpdate",
    "CookingToolResponse",
    "CookingToolWithLocation",
    "ToolWishlistBase",
    "ToolWishlistCreate",
    "ToolWishlistUpdate",
    "ToolWishlistResponse",
    # Storage
    "StorageItemBase",
    "StorageItemCreate",
    "StorageItemUpdate",
    "StorageItemResponse",
    "StorageItemWithLocation",
    "StorageItemQuantityUpdate",
]

# Made with Bob