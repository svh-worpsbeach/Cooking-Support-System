"""
Recipe router for managing recipes and related entities.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional

from app.database import get_db
from app.services.file_service import file_service
from app.models.recipe import (
    Recipe, RecipeCategory, RecipeIngredient, RecipeStep, RecipeImage,
    StepIngredientRef, StepStorageRef
)
from app.schemas.recipe import (
    RecipeCreate, RecipeUpdate, RecipeResponse, RecipeDetailResponse,
    RecipeIngredientCreate, RecipeIngredientUpdate, RecipeIngredientResponse,
    RecipeStepCreate, RecipeStepUpdate, RecipeStepResponse,
    RecipeImageCreate, RecipeImageResponse
)

router = APIRouter()


@router.post("/recipes", response_model=RecipeDetailResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    """
    Create a new recipe with categories, ingredients, and steps.
    """
    # Create recipe
    db_recipe = Recipe(
        name=recipe.name,
        description=recipe.description
    )
    db.add(db_recipe)
    db.flush()  # Get recipe ID without committing
    
    # Add categories
    for category_name in recipe.categories:
        db_category = RecipeCategory(
            recipe_id=db_recipe.id,
            category_name=category_name
        )
        db.add(db_category)
    
    # Add ingredients
    ingredient_map = {}  # Map order_index to ingredient ID for step references
    for idx, ingredient in enumerate(recipe.ingredients):
        db_ingredient = RecipeIngredient(
            recipe_id=db_recipe.id,
            name=ingredient.name,
            description=ingredient.description,
            amount=ingredient.amount,
            unit=ingredient.unit,
            order_index=ingredient.order_index
        )
        db.add(db_ingredient)
        db.flush()
        ingredient_map[idx] = db_ingredient.id
    
    # Add steps with references
    for step in recipe.steps:
        db_step = RecipeStep(
            recipe_id=db_recipe.id,
            step_number=step.step_number,
            content=step.content
        )
        db.add(db_step)
        db.flush()
        
        # Add ingredient references
        for ingredient_id in step.ingredient_ids:
            db_ref = StepIngredientRef(
                step_id=db_step.id,
                ingredient_id=ingredient_id
            )
            db.add(db_ref)
        
        # Add storage references
        for storage_id in step.storage_item_ids:
            db_ref = StepStorageRef(
                step_id=db_step.id,
                storage_item_id=storage_id
            )
            db.add(db_ref)
    
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.get("/recipes", response_model=List[RecipeResponse])
def list_recipes(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    categories: Optional[List[str]] = Query(None, description="Filter by multiple categories"),
    search: Optional[str] = Query(None, description="Search in recipe name and description"),
    ingredients: Optional[List[str]] = Query(None, description="Filter by ingredients"),
    allow_substitutes: bool = Query(False, description="Allow ingredient substitutes in search"),
    sort_by: Optional[str] = Query("name_asc", description="Sort by: name_asc, name_desc, category, created_desc"),
    db: Session = Depends(get_db)
):
    """
    List all recipes with advanced filtering, search, and sorting.
    
    Parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - category: Filter by single category (legacy support)
    - categories: Filter by multiple categories (OR logic)
    - search: Search in recipe name and description (fuzzy match)
    - ingredients: Filter by ingredient names (AND logic)
    - allow_substitutes: If True, also search for common ingredient substitutes
    - sort_by: Sorting option (name_asc, name_desc, category, created_desc)
    """
    query = db.query(Recipe).distinct()
    
    # Category filter (support both single and multiple)
    category_list = []
    if category:
        category_list.append(category)
    if categories:
        category_list.extend(categories)
    
    if category_list:
        query = query.join(RecipeCategory).filter(
            RecipeCategory.category_name.in_(category_list)
        )
    
    # Search filter (fuzzy match in name and description)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Recipe.name.ilike(search_pattern),
                Recipe.description.ilike(search_pattern)
            )
        )
    
    # Ingredient filter
    if ingredients:
        # For each ingredient, join and filter
        for ingredient_name in ingredients:
            ingredient_pattern = f"%{ingredient_name}%"
            
            if allow_substitutes:
                # Define common substitutes (can be extended)
                substitutes_map = {
                    'butter': ['margarine', 'öl', 'oil'],
                    'margarine': ['butter', 'öl', 'oil'],
                    'milch': ['sahne', 'cream', 'kokosmilch', 'coconut milk'],
                    'milk': ['cream', 'coconut milk', 'sahne'],
                    'zucker': ['honig', 'honey', 'agavendicksaft', 'stevia'],
                    'sugar': ['honey', 'agave', 'stevia'],
                    'mehl': ['stärke', 'flour', 'starch'],
                    'flour': ['starch', 'mehl'],
                }
                
                # Get substitutes for this ingredient
                ingredient_lower = ingredient_name.lower()
                search_terms = [ingredient_pattern]
                for key, subs in substitutes_map.items():
                    if key in ingredient_lower:
                        search_terms.extend([f"%{sub}%" for sub in subs])
                
                # Create OR condition for ingredient and its substitutes
                ingredient_conditions = [
                    RecipeIngredient.name.ilike(pattern) for pattern in search_terms
                ]
                query = query.join(RecipeIngredient).filter(
                    or_(*ingredient_conditions)
                )
            else:
                # Exact ingredient match
                query = query.join(RecipeIngredient).filter(
                    RecipeIngredient.name.ilike(ingredient_pattern)
                )
    
    # Sorting
    if sort_by == "name_asc":
        query = query.order_by(Recipe.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Recipe.name.desc())
    elif sort_by == "category":
        # Sort by category name, then recipe name
        query = query.join(RecipeCategory).order_by(
            RecipeCategory.category_name.asc(),
            Recipe.name.asc()
        )
    elif sort_by == "created_desc":
        query = query.order_by(Recipe.created_at.desc())
    else:
        # Default to name ascending
        query = query.order_by(Recipe.name.asc())
    
    recipes = query.offset(skip).limit(limit).all()
    return recipes


@router.get("/recipes/{recipe_id}", response_model=RecipeDetailResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Get a specific recipe with all details.
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    return recipe


@router.put("/recipes/{recipe_id}", response_model=RecipeResponse)
def update_recipe(recipe_id: int, recipe_update: RecipeUpdate, db: Session = Depends(get_db)):
    """
    Update a recipe's basic information.
    """
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    # Update fields
    update_data = recipe_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_recipe, field, value)
    
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.delete("/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Delete a recipe and all related data including images.
    """
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    # Delete associated images from filesystem using file service
    for image in db_recipe.images:
        file_service.delete_file(image.filepath, "recipes")
    
    db.delete(db_recipe)
    db.commit()
    return None


# Recipe Ingredient endpoints
@router.post("/recipes/{recipe_id}/ingredients", response_model=RecipeIngredientResponse, status_code=status.HTTP_201_CREATED)
def add_ingredient(recipe_id: int, ingredient: RecipeIngredientCreate, db: Session = Depends(get_db)):
    """
    Add an ingredient to a recipe.
    """
    # Verify recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    db_ingredient = RecipeIngredient(
        recipe_id=recipe_id,
        **ingredient.model_dump()
    )
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


@router.put("/recipes/{recipe_id}/ingredients/{ingredient_id}", response_model=RecipeIngredientResponse)
def update_ingredient(
    recipe_id: int,
    ingredient_id: int,
    ingredient_update: RecipeIngredientUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a recipe ingredient.
    """
    db_ingredient = db.query(RecipeIngredient).filter(
        RecipeIngredient.id == ingredient_id,
        RecipeIngredient.recipe_id == recipe_id
    ).first()
    
    if not db_ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient with id {ingredient_id} not found in recipe {recipe_id}"
        )
    
    update_data = ingredient_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ingredient, field, value)
    
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


@router.delete("/recipes/{recipe_id}/ingredients/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(recipe_id: int, ingredient_id: int, db: Session = Depends(get_db)):
    """
    Delete a recipe ingredient.
    """
    db_ingredient = db.query(RecipeIngredient).filter(
        RecipeIngredient.id == ingredient_id,
        RecipeIngredient.recipe_id == recipe_id
    ).first()
    
    if not db_ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient with id {ingredient_id} not found in recipe {recipe_id}"
        )
    
    db.delete(db_ingredient)
    db.commit()
    return None


# Recipe Step endpoints
@router.post("/recipes/{recipe_id}/steps", response_model=RecipeStepResponse, status_code=status.HTTP_201_CREATED)
def add_step(recipe_id: int, step: RecipeStepCreate, db: Session = Depends(get_db)):
    """
    Add a step to a recipe.
    """
    # Verify recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    db_step = RecipeStep(
        recipe_id=recipe_id,
        step_number=step.step_number,
        content=step.content,
        step_image_id=step.step_image_id
    )
    db.add(db_step)
    db.flush()
    
    # Add ingredient references
    for ingredient_id in step.ingredient_ids:
        db_ref = StepIngredientRef(
            step_id=db_step.id,
            ingredient_id=ingredient_id
        )
        db.add(db_ref)
    
    # Add storage references
    for storage_id in step.storage_item_ids:
        db_ref = StepStorageRef(
            step_id=db_step.id,
            storage_item_id=storage_id
        )
        db.add(db_ref)
    
    db.commit()
    db.refresh(db_step)
    return db_step


@router.put("/recipes/{recipe_id}/steps/{step_id}", response_model=RecipeStepResponse)
def update_step(
    recipe_id: int,
    step_id: int,
    step_update: RecipeStepUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a recipe step.
    """
    db_step = db.query(RecipeStep).filter(
        RecipeStep.id == step_id,
        RecipeStep.recipe_id == recipe_id
    ).first()
    
    if not db_step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Step with id {step_id} not found in recipe {recipe_id}"
        )
    
    # Update basic fields
    update_data = step_update.model_dump(exclude_unset=True, exclude={'ingredient_ids', 'storage_item_ids'})
    
    # Validate step_image_id if provided
    if 'step_image_id' in update_data and update_data['step_image_id'] is not None:
        image = db.query(RecipeImage).filter(
            RecipeImage.id == update_data['step_image_id'],
            RecipeImage.recipe_id == recipe_id
        ).first()
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Image with id {update_data['step_image_id']} not found in recipe {recipe_id}"
            )
    
    for field, value in update_data.items():
        setattr(db_step, field, value)
    
    # Update ingredient references if provided
    if step_update.ingredient_ids is not None:
        # Remove old references
        db.query(StepIngredientRef).filter(StepIngredientRef.step_id == step_id).delete()
        # Add new references
        for ingredient_id in step_update.ingredient_ids:
            db_ref = StepIngredientRef(
                step_id=step_id,
                ingredient_id=ingredient_id
            )
            db.add(db_ref)
    
    # Update storage references if provided
    if step_update.storage_item_ids is not None:
        # Remove old references
        db.query(StepStorageRef).filter(StepStorageRef.step_id == step_id).delete()
        # Add new references
        for storage_id in step_update.storage_item_ids:
            db_ref = StepStorageRef(
                step_id=step_id,
                storage_item_id=storage_id
            )
            db.add(db_ref)
    
    db.commit()
    db.refresh(db_step)
    return db_step


@router.delete("/recipes/{recipe_id}/steps/{step_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_step(recipe_id: int, step_id: int, db: Session = Depends(get_db)):
    """
    Delete a recipe step.
    """
    db_step = db.query(RecipeStep).filter(
        RecipeStep.id == step_id,
        RecipeStep.recipe_id == recipe_id
    ).first()
    
    if not db_step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Step with id {step_id} not found in recipe {recipe_id}"
        )
    
    db.delete(db_step)
    db.commit()
    return None


# Recipe Image endpoints
@router.post("/recipes/{recipe_id}/images", response_model=RecipeImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    recipe_id: int,
    file: UploadFile = File(...),
    is_process_image: bool = Form(False),
    order_index: int = Form(0),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a recipe with automatic thumbnail generation.
    """
    # Verify recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    # Save file using file service
    filename, filepath = await file_service.save_upload(
        file=file,
        category="recipes",
        create_thumbnail=True
    )
    
    # Create database record
    db_image = RecipeImage(
        recipe_id=recipe_id,
        filename=filename,
        filepath=filepath,
        is_process_image=is_process_image,
        order_index=order_index
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


@router.delete("/recipes/{recipe_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(recipe_id: int, image_id: int, db: Session = Depends(get_db)):
    """
    Delete a recipe image and its thumbnail.
    """
    db_image = db.query(RecipeImage).filter(
        RecipeImage.id == image_id,
        RecipeImage.recipe_id == recipe_id
    ).first()
    
    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image with id {image_id} not found in recipe {recipe_id}"
        )
    
    # Delete file using file service (handles both image and thumbnail)
    file_service.delete_file(db_image.filepath, "recipes")
    
    db.delete(db_image)
    db.commit()
    return None


@router.put("/recipes/{recipe_id}/title-image", response_model=RecipeResponse)
def set_title_image(
    recipe_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    """
    Set the title image for a recipe.
    """
    # Verify recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    # Verify image exists and belongs to recipe
    image = db.query(RecipeImage).filter(
        RecipeImage.id == image_id,
        RecipeImage.recipe_id == recipe_id
    ).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image with id {image_id} not found in recipe {recipe_id}"
        )
    
    # Update title image
    recipe.title_image_id = image_id
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/recipes/{recipe_id}/images/{image_id}/url")
def get_image_url(recipe_id: int, image_id: int, thumbnail: bool = False, db: Session = Depends(get_db)):
    """
    Get the URL for a recipe image or its thumbnail.
    """
    db_image = db.query(RecipeImage).filter(
        RecipeImage.id == image_id,
        RecipeImage.recipe_id == recipe_id
    ).first()
    
    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Image with id {image_id} not found in recipe {recipe_id}"
        )
    
    if thumbnail:
        url = file_service.get_thumbnail_url(db_image.filepath)
        if not url:
            # Fallback to original image if thumbnail doesn't exist
            url = file_service.get_file_url(db_image.filepath)
    else:
        url = file_service.get_file_url(db_image.filepath)
    
    return {"url": url, "filename": db_image.filename}

@router.get("/recipes/categories/cloud")
def get_category_cloud(db: Session = Depends(get_db)):
    """
    Get category cloud with recipe counts.
    
    Returns a list of categories with their recipe counts for creating a tag cloud.
    """
    # Query to get category counts
    category_counts = db.query(
        RecipeCategory.category_name,
        func.count(RecipeCategory.recipe_id).label('count')
    ).group_by(RecipeCategory.category_name).all()
    
    # Format response
    cloud = [
        {
            "category": cat_name,
            "count": count
        }
        for cat_name, count in category_counts
    ]
    
    # Sort by count descending
    cloud.sort(key=lambda x: x['count'], reverse=True)
    
    return {"categories": cloud}


@router.get("/recipes/ingredients/substitutes")
def get_ingredient_substitutes():
    """
    Get common ingredient substitutes mapping.
    
    Returns a dictionary of ingredients and their possible substitutes.
    """
    substitutes = {
        'butter': ['margarine', 'öl', 'oil', 'kokosöl', 'coconut oil'],
        'margarine': ['butter', 'öl', 'oil'],
        'milch': ['sahne', 'cream', 'kokosmilch', 'coconut milk', 'mandelmilch', 'almond milk'],
        'milk': ['cream', 'coconut milk', 'almond milk', 'sahne'],
        'sahne': ['milch', 'milk', 'kokosmilch', 'coconut milk'],
        'cream': ['milk', 'coconut milk', 'milch'],
        'zucker': ['honig', 'honey', 'agavendicksaft', 'agave syrup', 'stevia', 'ahornsirup', 'maple syrup'],
        'sugar': ['honey', 'agave syrup', 'stevia', 'maple syrup'],
        'honig': ['zucker', 'sugar', 'agavendicksaft', 'agave syrup'],
        'honey': ['sugar', 'agave syrup', 'zucker'],
        'mehl': ['stärke', 'flour', 'starch', 'mandelmehl', 'almond flour'],
        'flour': ['starch', 'almond flour', 'mehl', 'stärke'],
        'weizenmehl': ['dinkelmehl', 'spelt flour', 'mandelmehl', 'almond flour'],
        'wheat flour': ['spelt flour', 'almond flour', 'dinkelmehl'],
        'öl': ['butter', 'margarine', 'oil'],
        'oil': ['butter', 'margarine', 'öl'],
        'olivenöl': ['rapsöl', 'sonnenblumenöl', 'olive oil', 'rapeseed oil', 'sunflower oil'],
        'olive oil': ['rapeseed oil', 'sunflower oil', 'olivenöl'],
        'eier': ['apfelmus', 'banane', 'eggs', 'applesauce', 'banana', 'leinsamen', 'flax seeds'],
        'eggs': ['applesauce', 'banana', 'flax seeds', 'apfelmus', 'banane'],
        'salz': ['meersalz', 'kräutersalz', 'salt', 'sea salt', 'herb salt'],
        'salt': ['sea salt', 'herb salt', 'salz', 'meersalz'],
    }
    
    return {"substitutes": substitutes}


# Made with Bob