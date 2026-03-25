"""
Storage router for managing storage items (herbs, spices, etc.).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.storage import StorageItem
from app.models.location import Location
from app.schemas.storage import (
    StorageItemCreate, StorageItemUpdate, StorageItemResponse,
    StorageItemWithLocation, StorageItemQuantityUpdate
)

router = APIRouter()


@router.post("/storage", response_model=StorageItemResponse, status_code=status.HTTP_201_CREATED)
def create_storage_item(item: StorageItemCreate, db: Session = Depends(get_db)):
    """
    Create a new storage item.
    """
    # Verify location exists
    location = db.query(Location).filter(Location.id == item.location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with id {item.location_id} not found"
        )
    
    db_item = StorageItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/storage", response_model=List[StorageItemWithLocation])
def list_storage_items(
    skip: int = 0,
    limit: int = 100,
    location_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all storage items with optional filters and pagination.
    """
    query = db.query(StorageItem).join(Location)
    
    if location_id:
        query = query.filter(StorageItem.location_id == location_id)
    
    if category:
        query = query.filter(StorageItem.category == category)
    
    items = query.offset(skip).limit(limit).all()
    
    # Add location name to response
    result = []
    for item in items:
        item_dict = {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "location_id": item.location_id,
            "expiry_date": item.expiry_date,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "location_name": item.location.name
        }
        result.append(item_dict)
    
    return result


@router.get("/storage/{item_id}", response_model=StorageItemWithLocation)
def get_storage_item(item_id: int, db: Session = Depends(get_db)):
    """
    Get a specific storage item.
    """
    item = db.query(StorageItem).filter(StorageItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Storage item with id {item_id} not found"
        )
    
    return {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "quantity": item.quantity,
        "unit": item.unit,
        "location_id": item.location_id,
        "expiry_date": item.expiry_date,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "location_name": item.location.name
    }


@router.put("/storage/{item_id}", response_model=StorageItemResponse)
def update_storage_item(item_id: int, item_update: StorageItemUpdate, db: Session = Depends(get_db)):
    """
    Update a storage item.
    """
    db_item = db.query(StorageItem).filter(StorageItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Storage item with id {item_id} not found"
        )
    
    # Verify new location exists if provided
    if item_update.location_id:
        location = db.query(Location).filter(Location.id == item_update.location_id).first()
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Location with id {item_update.location_id} not found"
            )
    
    # Update fields
    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/storage/{item_id}/quantity", response_model=StorageItemResponse)
def update_storage_quantity(
    item_id: int,
    quantity_update: StorageItemQuantityUpdate,
    db: Session = Depends(get_db)
):
    """
    Update only the quantity of a storage item.
    Supports set, add, and subtract operations.
    """
    db_item = db.query(StorageItem).filter(StorageItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Storage item with id {item_id} not found"
        )
    
    # Apply quantity operation
    if quantity_update.operation == "set":
        db_item.quantity = quantity_update.quantity
    elif quantity_update.operation == "add":
        db_item.quantity += quantity_update.quantity
    elif quantity_update.operation == "subtract":
        new_quantity = db_item.quantity - quantity_update.quantity
        if new_quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot subtract {quantity_update.quantity} from current quantity {db_item.quantity}"
            )
        db_item.quantity = new_quantity
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/storage/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_storage_item(item_id: int, db: Session = Depends(get_db)):
    """
    Delete a storage item.
    """
    db_item = db.query(StorageItem).filter(StorageItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Storage item with id {item_id} not found"
        )
    
    db.delete(db_item)
    db.commit()
    return None


@router.get("/storage/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    """
    List all unique storage item categories.
    """
    categories = db.query(StorageItem.category).distinct().all()
    return [cat[0] for cat in categories]


@router.get("/storage/expiring", response_model=List[StorageItemWithLocation])
def list_expiring_items(days: int = 7, db: Session = Depends(get_db)):
    """
    List storage items expiring within the specified number of days.
    """
    from datetime import datetime, timedelta
    
    expiry_threshold = datetime.now() + timedelta(days=days)
    
    items = db.query(StorageItem).join(Location).filter(
        StorageItem.expiry_date.isnot(None),
        StorageItem.expiry_date <= expiry_threshold
    ).all()
    
    # Add location name to response
    result = []
    for item in items:
        item_dict = {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "location_id": item.location_id,
            "expiry_date": item.expiry_date,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "location_name": item.location.name
        }
        result.append(item_dict)
    
    return result


# Made with Bob