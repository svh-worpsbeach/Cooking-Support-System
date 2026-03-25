from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Recipe(Base):
    """
    Recipe model for storing recipe information.
    """
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    preparation_time = Column(String(50), nullable=False, default="0:00", server_default="0:00")
    cooking_time = Column(String(50), nullable=False, default="0:00", server_default="0:00")
    title_image_id = Column(Integer, nullable=True)  # No FK to avoid circular dependency
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    categories = relationship("RecipeCategory", back_populates="recipe", cascade="all, delete-orphan")
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    steps = relationship("RecipeStep", back_populates="recipe", cascade="all, delete-orphan")
    images = relationship("RecipeImage", back_populates="recipe", foreign_keys="RecipeImage.recipe_id", cascade="all, delete-orphan")
    # Note: title_image relationship removed to avoid circular FK dependency with DB2

    def __repr__(self):
        return f"<Recipe(id={self.id}, name='{self.name}')>"


class RecipeCategory(Base):
    """
    Recipe category model for categorizing recipes.
    """
    __tablename__ = "recipe_categories"

    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    category_name = Column(String(100), nullable=False)

    # Relationships
    recipe = relationship("Recipe", back_populates="categories")

    def __repr__(self):
        return f"<RecipeCategory(id={self.id}, category='{self.category_name}')>"


class RecipeIngredient(Base):
    """
    Recipe ingredient model for storing ingredients of a recipe.
    """
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    amount = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    # Relationships
    recipe = relationship("Recipe", back_populates="ingredients")
    step_refs = relationship("StepIngredientRef", back_populates="ingredient", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RecipeIngredient(id={self.id}, name='{self.name}', amount={self.amount} {self.unit})>"


class RecipeStep(Base):
    """
    Recipe step model for storing cooking steps.
    """
    __tablename__ = "recipe_steps"

    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    step_image_id = Column(Integer, nullable=True)  # No FK to avoid circular dependency
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    recipe = relationship("Recipe", back_populates="steps")
    # Note: step_image relationship removed to avoid circular FK dependency with DB2
    ingredient_refs = relationship("StepIngredientRef", back_populates="step", cascade="all, delete-orphan")
    storage_refs = relationship("StepStorageRef", back_populates="step", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RecipeStep(id={self.id}, step_number={self.step_number})>"


class RecipeImage(Base):
    """
    Recipe image model for storing recipe images.
    """
    __tablename__ = "recipe_images"

    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    is_process_image = Column(Boolean, default=False)
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    recipe = relationship("Recipe", back_populates="images", foreign_keys=[recipe_id])

    def __repr__(self):
        return f"<RecipeImage(id={self.id}, filename='{self.filename}')>"


class StepIngredientRef(Base):
    """
    Reference table linking recipe steps to ingredients.
    """
    __tablename__ = "step_ingredient_refs"

    id = Column(Integer, primary_key=True)
    step_id = Column(Integer, ForeignKey("recipe_steps.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("recipe_ingredients.id"), nullable=False)

    # Relationships
    step = relationship("RecipeStep", back_populates="ingredient_refs")
    ingredient = relationship("RecipeIngredient", back_populates="step_refs")

    def __repr__(self):
        return f"<StepIngredientRef(step_id={self.step_id}, ingredient_id={self.ingredient_id})>"


class StepStorageRef(Base):
    """
    Reference table linking recipe steps to storage items.
    """
    __tablename__ = "step_storage_refs"

    id = Column(Integer, primary_key=True)
    step_id = Column(Integer, ForeignKey("recipe_steps.id"), nullable=False)
    storage_item_id = Column(Integer, ForeignKey("storage_items.id"), nullable=False)

    # Relationships
    step = relationship("RecipeStep", back_populates="storage_refs")
    storage_item = relationship("StorageItem", back_populates="step_refs")

    def __repr__(self):
        return f"<StepStorageRef(step_id={self.step_id}, storage_item_id={self.storage_item_id})>"

# Made with Bob
