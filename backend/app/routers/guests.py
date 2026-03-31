"""
Guest router for managing guests and their event assignments.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.services.file_service import file_service
from app.models.guest import Guest, event_guests
from app.models.event import Event
from app.schemas.guest import (
    GuestCreate, GuestUpdate, GuestResponse, GuestWithEventsResponse,
    EventGuestAssign, EventGuestResponse
)

router = APIRouter()


# Guest CRUD endpoints
@router.post("/guests", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
def create_guest(guest: GuestCreate, db: Session = Depends(get_db)):
    """
    Create a new guest.
    """
    db_guest = Guest(**guest.model_dump())
    db.add(db_guest)
    db.commit()
    db.refresh(db_guest)
    return db_guest


@router.get("/guests", response_model=List[GuestWithEventsResponse])
def list_guests(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all guests with optional search and pagination.
    Search filters by first name, last name, or email.
    """
    query = db.query(Guest)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Guest.first_name.ilike(search_filter)) |
            (Guest.last_name.ilike(search_filter)) |
            (Guest.email.ilike(search_filter))
        )
    
    guests = query.offset(skip).limit(limit).all()
    
    # Add event count to each guest
    result = []
    for guest in guests:
        guest_dict = {
            "id": guest.id,
            "first_name": guest.first_name,
            "last_name": guest.last_name,
            "email": guest.email,
            "phone": guest.phone,
            "street": guest.street,
            "city": guest.city,
            "postal_code": guest.postal_code,
            "country": guest.country,
            "intolerances": guest.intolerances,
            "favorites": guest.favorites,
            "dietary_notes": guest.dietary_notes,
            "image_path": guest.image_path,
            "created_at": guest.created_at,
            "updated_at": guest.updated_at,
            "event_count": len(guest.events)
        }
        result.append(guest_dict)
    
    return result


@router.get("/guests/{guest_id}", response_model=GuestWithEventsResponse)
def get_guest(guest_id: int, db: Session = Depends(get_db)):
    """
    Get a specific guest by ID.
    """
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {guest_id} not found"
        )
    
    return {
        **guest.__dict__,
        "event_count": len(guest.events)
    }


@router.put("/guests/{guest_id}", response_model=GuestResponse)
def update_guest(guest_id: int, guest_update: GuestUpdate, db: Session = Depends(get_db)):
    """
    Update a guest.
    """
    db_guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not db_guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {guest_id} not found"
        )
    
    # Update fields
    update_data = guest_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_guest, field, value)
    
    db.commit()
    db.refresh(db_guest)
    return db_guest


@router.delete("/guests/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guest(guest_id: int, db: Session = Depends(get_db)):
    """
    Delete a guest.
    """
    db_guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not db_guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {guest_id} not found"
        )
    
    # Delete image if exists
    if db_guest.image_path:
        file_service.delete_file(db_guest.image_path, "guests")
    
    db.delete(db_guest)
    db.commit()
    return None


# Guest image endpoints
@router.post("/guests/{guest_id}/image", response_model=GuestResponse)
async def upload_guest_image(
    guest_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a guest with automatic thumbnail generation.
    """
    # Verify guest exists
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {guest_id} not found"
        )
    
    # Delete old image if exists
    if guest.image_path:
        file_service.delete_file(guest.image_path, "guests")
    
    # Save file using file service
    filename, filepath = await file_service.save_upload(
        file=file,
        category="guests",
        create_thumbnail=True
    )
    
    # Update guest record
    guest.image_path = filepath
    db.commit()
    db.refresh(guest)
    return guest


@router.delete("/guests/{guest_id}/image", status_code=status.HTTP_204_NO_CONTENT)
def delete_guest_image(guest_id: int, db: Session = Depends(get_db)):
    """
    Delete a guest's image.
    """
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {guest_id} not found"
        )
    
    if not guest.image_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest has no image"
        )
    
    # Delete image using file service (handles both image and thumbnail)
    file_service.delete_file(guest.image_path, "guests")
    
    # Update guest record
    guest.image_path = None
    db.commit()
    return None


# Event-Guest association endpoints
@router.post("/events/{event_id}/guests", response_model=EventGuestResponse, status_code=status.HTTP_201_CREATED)
def assign_guest_to_event(
    event_id: int,
    assignment: EventGuestAssign,
    db: Session = Depends(get_db)
):
    """
    Assign a guest to an event.
    """
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    # Verify guest exists
    guest = db.query(Guest).filter(Guest.id == assignment.guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {assignment.guest_id} not found"
        )
    
    # Check if already assigned
    if guest in event.guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Guest {guest.first_name} {guest.last_name} is already assigned to this event"
        )
    
    # Add guest to event
    event.guests.append(guest)
    db.commit()
    
    # Get the association record
    result = db.query(event_guests).filter(
        event_guests.c.event_id == event_id,
        event_guests.c.guest_id == assignment.guest_id
    ).first()
    
    return {
        "event_id": event_id,
        "guest_id": assignment.guest_id,
        "guest_name": f"{guest.first_name} {guest.last_name}",
        "created_at": result.created_at
    }


@router.get("/events/{event_id}/guests", response_model=List[GuestResponse])
def list_event_guests(event_id: int, db: Session = Depends(get_db)):
    """
    List all guests assigned to an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    return event.guests


@router.delete("/events/{event_id}/guests/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_guest_from_event(event_id: int, guest_id: int, db: Session = Depends(get_db)):
    """
    Remove a guest from an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {guest_id} not found"
        )
    
    if guest not in event.guests:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest is not assigned to this event"
        )
    
    event.guests.remove(guest)
    db.commit()
    return None


@router.get("/guests/{guest_id}/events", response_model=List[dict])
def list_guest_events(guest_id: int, db: Session = Depends(get_db)):
    """
    List all events a guest is invited to.
    """
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest with id {guest_id} not found"
        )
    
    return [
        {
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "theme": event.theme,
            "event_date": event.event_date,
            "created_at": event.created_at
        }
        for event in guest.events
    ]


# Made with Bob