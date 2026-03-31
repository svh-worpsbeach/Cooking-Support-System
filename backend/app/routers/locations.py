"""
Location router for managing physical locations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.file_service import file_service
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate, LocationResponse

router = APIRouter()


@router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    """
    Create a new location.
    """
    # Check if location with same name already exists
    existing = db.query(Location).filter(Location.name == location.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Location with name '{location.name}' already exists"
        )
    
    db_location = Location(**location.model_dump())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


@router.get("/locations", response_model=List[LocationResponse])
def list_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all locations with pagination.
    """
    locations = db.query(Location).offset(skip).limit(limit).all()
    return locations


@router.get("/locations/{location_id}", response_model=LocationResponse)
def get_location(location_id: int, db: Session = Depends(get_db)):
    """
    Get a specific location by ID.
    """
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with id {location_id} not found"
        )
    return location


@router.put("/locations/{location_id}", response_model=LocationResponse)
def update_location(location_id: int, location_update: LocationUpdate, db: Session = Depends(get_db)):
    """
    Update a location.
    """
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with id {location_id} not found"
        )
    
    # Check if new name conflicts with existing location
    if location_update.name and location_update.name != db_location.name:
        existing = db.query(Location).filter(Location.name == location_update.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Location with name '{location_update.name}' already exists"
            )
    
    # Update fields
    update_data = location_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_location, field, value)
    
    db.commit()
    db.refresh(db_location)
    return db_location


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    """
    Delete a location.
    """
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with id {location_id} not found"
        )
    
    # Delete image if exists
    if db_location.image_path:
        file_service.delete_file(db_location.image_path, "locations")
    
    db.delete(db_location)
    db.commit()
    return None


@router.post("/locations/{location_id}/image", response_model=LocationResponse)
async def upload_location_image(
    location_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a location with automatic thumbnail generation.
    """
    # Verify location exists
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with id {location_id} not found"
        )
    
    # Delete old image if exists
    if location.image_path:
        file_service.delete_file(location.image_path, "locations")
    
    # Save file using file service
    filename, filepath = await file_service.save_upload(
        file=file,
        category="locations",
        create_thumbnail=True
    )
    
    # Update location record
    location.image_path = filepath
    db.commit()
    db.refresh(location)
    return location


@router.delete("/locations/{location_id}/image", status_code=status.HTTP_204_NO_CONTENT)
def delete_location_image(location_id: int, db: Session = Depends(get_db)):
    """
    Delete a location's image.
    """
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with id {location_id} not found"
        )
    
    if not location.image_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location has no image"
        )
    
    # Delete image using file service (handles both image and thumbnail)
    file_service.delete_file(location.image_path, "locations")
    
    # Update location record
    location.image_path = None
    db.commit()
    return None


# Made with Bob