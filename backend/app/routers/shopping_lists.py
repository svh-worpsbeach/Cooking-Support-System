from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.database import get_db
from app.models.shopping_list import ShoppingList, ShoppingListItem
from app.models.event import Event
from app.models.recipe import Recipe, RecipeIngredient
from app.schemas.shopping_list import (
    ShoppingListCreate,
    ShoppingListUpdate,
    ShoppingListResponse,
    ShoppingListDetailResponse,
    ShoppingListItemCreate,
    ShoppingListItemUpdate,
    ShoppingListItemResponse,
    ShoppingListFromEventCreate,
    ShoppingListFromRecipeCreate,
)

router = APIRouter(prefix="/shopping-lists", tags=["shopping-lists"])


def get_next_saturday() -> date:
    """Get the date of the next Saturday."""
    today = date.today()
    days_ahead = 5 - today.weekday()  # Saturday is 5
    if days_ahead <= 0:  # Target day already happened this week
        days_ahead += 7
    return today + timedelta(days=days_ahead)


@router.get("/", response_model=List[ShoppingListResponse])
def get_shopping_lists(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all shopping lists with pagination."""
    lists = db.query(ShoppingList).offset(skip).limit(limit).all()
    return lists


@router.get("/{list_id}", response_model=ShoppingListDetailResponse)
def get_shopping_list(list_id: int, db: Session = Depends(get_db)):
    """Get a specific shopping list with all items."""
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    return shopping_list


@router.post("/", response_model=ShoppingListDetailResponse, status_code=201)
def create_shopping_list(
    shopping_list: ShoppingListCreate,
    db: Session = Depends(get_db)
):
    """Create a new shopping list manually."""
    db_list = ShoppingList(
        title=shopping_list.title,
        due_date=shopping_list.due_date,
        event_id=shopping_list.event_id,
        recipe_id=shopping_list.recipe_id,
    )
    db.add(db_list)
    db.flush()  # Get the ID
    
    # Add items
    for item_data in shopping_list.items:
        db_item = ShoppingListItem(
            shopping_list_id=db_list.id,
            **item_data.model_dump()
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_list)
    return db_list


@router.post("/from-event/{event_id}", response_model=ShoppingListDetailResponse, status_code=201)
def create_shopping_list_from_event(
    event_id: int,
    data: ShoppingListFromEventCreate,
    db: Session = Depends(get_db)
):
    """Create a shopping list from an event's recipes."""
    # Get event with all courses and recipes
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Determine title and due date
    title = data.title or f"Einkaufsliste für {event.name}"
    due_date = data.due_date or (event.event_date.date() if event.event_date else get_next_saturday())
    
    # Create shopping list
    db_list = ShoppingList(
        title=title,
        due_date=due_date,
        event_id=event_id,
    )
    db.add(db_list)
    db.flush()
    
    # Collect all ingredients from all recipes in all courses
    ingredient_map = {}  # {(name, unit, shop): amount}
    
    for course in event.courses:
        for course_recipe in course.recipes:
            recipe = db.query(Recipe).filter(Recipe.id == course_recipe.recipe_id).first()
            if recipe:
                for ingredient in recipe.ingredients:
                    key = (ingredient.name, ingredient.unit or "", "")  # TODO: Add shop from ingredient master
                    if key in ingredient_map:
                        ingredient_map[key] += ingredient.amount or 0
                    else:
                        ingredient_map[key] = ingredient.amount or 0
    
    # Create shopping list items grouped by shop
    order_index = 0
    for (name, unit, shop), amount in sorted(ingredient_map.items()):
        db_item = ShoppingListItem(
            shopping_list_id=db_list.id,
            name=name,
            amount=amount if amount > 0 else None,
            unit=unit if unit else None,
            shop=shop if shop else None,
            order_index=order_index,
        )
        db.add(db_item)
        order_index += 1
    
    db.commit()
    db.refresh(db_list)
    return db_list


@router.post("/from-recipe/{recipe_id}", response_model=ShoppingListDetailResponse, status_code=201)
def create_shopping_list_from_recipe(
    recipe_id: int,
    data: ShoppingListFromRecipeCreate,
    db: Session = Depends(get_db)
):
    """Create a shopping list from a single recipe."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Determine title and due date
    title = data.title or f"Einkaufsliste für {recipe.name}"
    due_date = data.due_date or get_next_saturday()
    
    # Create shopping list
    db_list = ShoppingList(
        title=title,
        due_date=due_date,
        recipe_id=recipe_id,
    )
    db.add(db_list)
    db.flush()
    
    # Add ingredients with multiplier
    for idx, ingredient in enumerate(recipe.ingredients):
        amount = ingredient.amount * data.servings_multiplier if ingredient.amount else None
        db_item = ShoppingListItem(
            shopping_list_id=db_list.id,
            name=ingredient.name,
            amount=amount,
            unit=ingredient.unit,
            shop=None,  # TODO: Get from ingredient master
            order_index=idx,
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_list)
    return db_list


@router.put("/{list_id}", response_model=ShoppingListDetailResponse)
def update_shopping_list(
    list_id: int,
    shopping_list: ShoppingListUpdate,
    db: Session = Depends(get_db)
):
    """Update a shopping list."""
    db_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    update_data = shopping_list.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_list, field, value)
    
    db.commit()
    db.refresh(db_list)
    return db_list


@router.delete("/{list_id}", status_code=204)
def delete_shopping_list(list_id: int, db: Session = Depends(get_db)):
    """Delete a shopping list."""
    db_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    db.delete(db_list)
    db.commit()
    return None


# Shopping List Item endpoints
@router.post("/{list_id}/items", response_model=ShoppingListItemResponse, status_code=201)
def add_item_to_list(
    list_id: int,
    item: ShoppingListItemCreate,
    db: Session = Depends(get_db)
):
    """Add an item to a shopping list."""
    db_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not db_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    db_item = ShoppingListItem(
        shopping_list_id=list_id,
        **item.model_dump()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{list_id}/items/{item_id}", response_model=ShoppingListItemResponse)
def update_list_item(
    list_id: int,
    item_id: int,
    item: ShoppingListItemUpdate,
    db: Session = Depends(get_db)
):
    """Update a shopping list item."""
    db_item = (
        db.query(ShoppingListItem)
        .filter(
            ShoppingListItem.id == item_id,
            ShoppingListItem.shopping_list_id == list_id
        )
        .first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{list_id}/items/{item_id}", status_code=204)
def delete_list_item(list_id: int, item_id: int, db: Session = Depends(get_db)):
    """Delete a shopping list item."""
    db_item = (
        db.query(ShoppingListItem)
        .filter(
            ShoppingListItem.id == item_id,
            ShoppingListItem.shopping_list_id == list_id
        )
        .first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return None

# Made with Bob