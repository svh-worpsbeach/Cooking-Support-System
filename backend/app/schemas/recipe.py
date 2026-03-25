from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List


# Recipe Category Schemas
class RecipeCategoryBase(BaseModel):
    """Base schema for RecipeCategory."""
    category_name: str = Field(..., min_length=1, max_length=255, description="Category name")


class RecipeCategoryCreate(RecipeCategoryBase):
    """Schema for creating a recipe category."""
    pass


class RecipeCategoryResponse(RecipeCategoryBase):
    """Schema for recipe category response."""
    id: int
    recipe_id: int

    model_config = ConfigDict(from_attributes=True)


# Recipe Ingredient Schemas
class RecipeIngredientBase(BaseModel):
    """Base schema for RecipeIngredient."""
    name: str = Field(..., min_length=1, max_length=255, description="Ingredient name")
    description: Optional[str] = Field(None, description="Ingredient description")
    amount: float = Field(..., gt=0, description="Ingredient amount")
    unit: str = Field(..., min_length=1, max_length=50, description="Unit of measurement")
    order_index: int = Field(0, ge=0, description="Order index for display")


class RecipeIngredientCreate(RecipeIngredientBase):
    """Schema for creating a recipe ingredient."""
    pass


class RecipeIngredientUpdate(BaseModel):
    """Schema for updating a recipe ingredient."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    order_index: Optional[int] = Field(None, ge=0)


class RecipeIngredientResponse(RecipeIngredientBase):
    """Schema for recipe ingredient response."""
    id: int
    recipe_id: int

    model_config = ConfigDict(from_attributes=True)


# Recipe Step Schemas
class RecipeStepBase(BaseModel):
    """Base schema for RecipeStep."""
    step_number: int = Field(..., ge=1, description="Step number in sequence")
    content: str = Field(..., min_length=1, description="Step instructions")
    step_image_id: Optional[int] = Field(None, description="Optional image ID for this step")


class RecipeStepCreate(RecipeStepBase):
    """Schema for creating a recipe step."""
    ingredient_ids: List[int] = Field(default_factory=list, description="Referenced ingredient IDs")
    storage_item_ids: List[int] = Field(default_factory=list, description="Referenced storage item IDs")


class RecipeStepUpdate(BaseModel):
    """Schema for updating a recipe step."""
    step_number: Optional[int] = Field(None, ge=1)
    content: Optional[str] = Field(None, min_length=1)
    step_image_id: Optional[int] = None
    ingredient_ids: Optional[List[int]] = None
    storage_item_ids: Optional[List[int]] = None


class RecipeStepResponse(RecipeStepBase):
    """Schema for recipe step response."""
    id: int
    recipe_id: int
    step_image_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Recipe Image Schemas
class RecipeImageBase(BaseModel):
    """Base schema for RecipeImage."""
    filename: str = Field(..., min_length=1, max_length=255, description="Image filename")
    filepath: str = Field(..., min_length=1, description="Image file path")
    is_process_image: bool = Field(False, description="Whether this is a process image")
    order_index: int = Field(0, ge=0, description="Order index for display")


class RecipeImageCreate(RecipeImageBase):
    """Schema for creating a recipe image."""
    pass


class RecipeImageResponse(RecipeImageBase):
    """Schema for recipe image response."""
    id: int
    recipe_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Recipe Schemas
class RecipeBase(BaseModel):
    """Base schema for Recipe."""
    name: str = Field(..., min_length=1, max_length=255, description="Recipe name")
    description: Optional[str] = Field(None, description="Recipe description")


class RecipeCreate(RecipeBase):
    """Schema for creating a recipe."""
    categories: List[str] = Field(default_factory=list, description="Recipe categories")
    ingredients: List[RecipeIngredientCreate] = Field(default_factory=list, description="Recipe ingredients")
    steps: List[RecipeStepCreate] = Field(default_factory=list, description="Recipe steps")

    @field_validator('steps')
    @classmethod
    def validate_step_numbers(cls, steps: List[RecipeStepCreate]) -> List[RecipeStepCreate]:
        """Validate that step numbers are sequential starting from 1."""
        if steps:
            step_numbers = [step.step_number for step in steps]
            expected = list(range(1, len(steps) + 1))
            if sorted(step_numbers) != expected:
                raise ValueError("Step numbers must be sequential starting from 1")
        return steps


class RecipeUpdate(BaseModel):
    """Schema for updating a recipe."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    title_image_id: Optional[int] = None


class RecipeResponse(RecipeBase):
    """Schema for recipe response."""
    id: int
    title_image_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RecipeDetailResponse(RecipeResponse):
    """Schema for detailed recipe response with all related data."""
    categories: List[RecipeCategoryResponse] = Field(default_factory=list)
    ingredients: List[RecipeIngredientResponse] = Field(default_factory=list)
    steps: List[RecipeStepResponse] = Field(default_factory=list)
    images: List[RecipeImageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# Step Reference Schemas
class StepIngredientRefCreate(BaseModel):
    """Schema for creating a step-ingredient reference."""
    step_id: int = Field(..., description="Step ID")
    ingredient_id: int = Field(..., description="Ingredient ID")


class StepIngredientRefResponse(StepIngredientRefCreate):
    """Schema for step-ingredient reference response."""
    id: int

    model_config = ConfigDict(from_attributes=True)


class StepStorageRefCreate(BaseModel):
    """Schema for creating a step-storage reference."""
    step_id: int = Field(..., description="Step ID")
    storage_item_id: int = Field(..., description="Storage item ID")


class StepStorageRefResponse(StepStorageRefCreate):
    """Schema for step-storage reference response."""
    id: int

    model_config = ConfigDict(from_attributes=True)


# Made with Bob