"""
Event router for managing cooking events and related entities.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.event import (
    Event, EventParticipant, EventCourse, CourseRecipe,
    ShoppingList, ShoppingListItem
)
from app.schemas.event import (
    EventCreate, EventUpdate, EventResponse, EventDetailResponse,
    EventParticipantCreate, EventParticipantUpdate, EventParticipantResponse,
    EventCourseCreate, EventCourseUpdate, EventCourseResponse,
    ShoppingListCreate, ShoppingListResponse, ShoppingListDetailResponse,
    ShoppingListItemCreate, ShoppingListItemUpdate, ShoppingListItemResponse
)

router = APIRouter()


@router.post("/events", response_model=EventDetailResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """
    Create a new event with participants and courses.
    """
    # Create event
    db_event = Event(
        name=event.name,
        description=event.description,
        theme=event.theme,
        event_date=event.event_date
    )
    db.add(db_event)
    db.flush()
    
    # Add participants
    for participant in event.participants:
        db_participant = EventParticipant(
            event_id=db_event.id,
            name=participant.name,
            dietary_restrictions=participant.dietary_restrictions
        )
        db.add(db_participant)
    
    # Add courses with recipes
    for course in event.courses:
        db_course = EventCourse(
            event_id=db_event.id,
            course_number=course.course_number,
            course_name=course.course_name
        )
        db.add(db_course)
        db.flush()
        
        # Add recipes to course
        for recipe_id in course.recipe_ids:
            db_course_recipe = CourseRecipe(
                course_id=db_course.id,
                recipe_id=recipe_id
            )
            db.add(db_course_recipe)
    
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/events", response_model=List[EventResponse])
def list_events(
    skip: int = 0,
    limit: int = 100,
    upcoming: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    List all events with optional filters and pagination.
    """
    from datetime import datetime
    
    query = db.query(Event)
    
    if upcoming is not None:
        now = datetime.now()
        if upcoming:
            query = query.filter(Event.event_date >= now)
        else:
            query = query.filter(Event.event_date < now)
    
    events = query.order_by(Event.event_date.desc()).offset(skip).limit(limit).all()
    return events


@router.get("/events/{event_id}", response_model=EventDetailResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """
    Get a specific event with all details.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    return event


@router.put("/events/{event_id}", response_model=EventDetailResponse)
def update_event(event_id: int, event_update: EventUpdate, db: Session = Depends(get_db)):
    """
    Update an event's basic information, participants, and courses.
    """
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    # Update basic fields
    update_data = event_update.model_dump(exclude_unset=True, exclude={'participants', 'courses'})
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    # Update participants if provided
    if event_update.participants is not None:
        # Remove existing participants
        db.query(EventParticipant).filter(EventParticipant.event_id == event_id).delete()
        # Add new participants
        for participant in event_update.participants:
            db_participant = EventParticipant(
                event_id=event_id,
                name=participant.name,
                dietary_restrictions=participant.dietary_restrictions
            )
            db.add(db_participant)
    
    # Update courses if provided
    if event_update.courses is not None:
        # Remove existing courses (cascade will delete course_recipes)
        db.query(EventCourse).filter(EventCourse.event_id == event_id).delete()
        # Add new courses
        for course in event_update.courses:
            db_course = EventCourse(
                event_id=event_id,
                course_number=course.course_number,
                course_name=course.course_name
            )
            db.add(db_course)
            db.flush()
            
            # Add recipes to course
            for recipe_id in course.recipe_ids:
                db_course_recipe = CourseRecipe(
                    course_id=db_course.id,
                    recipe_id=recipe_id
                )
                db.add(db_course_recipe)
    
    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """
    Delete an event and all related data.
    """
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    db.delete(db_event)
    db.commit()
    return None


# Event Participant endpoints
@router.post("/events/{event_id}/participants", response_model=EventParticipantResponse, status_code=status.HTTP_201_CREATED)
def add_participant(event_id: int, participant: EventParticipantCreate, db: Session = Depends(get_db)):
    """
    Add a participant to an event.
    """
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    db_participant = EventParticipant(
        event_id=event_id,
        **participant.model_dump()
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant


@router.put("/events/{event_id}/participants/{participant_id}", response_model=EventParticipantResponse)
def update_participant(
    event_id: int,
    participant_id: int,
    participant_update: EventParticipantUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an event participant.
    """
    db_participant = db.query(EventParticipant).filter(
        EventParticipant.id == participant_id,
        EventParticipant.event_id == event_id
    ).first()
    
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with id {participant_id} not found in event {event_id}"
        )
    
    update_data = participant_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_participant, field, value)
    
    db.commit()
    db.refresh(db_participant)
    return db_participant


@router.delete("/events/{event_id}/participants/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(event_id: int, participant_id: int, db: Session = Depends(get_db)):
    """
    Delete an event participant.
    """
    db_participant = db.query(EventParticipant).filter(
        EventParticipant.id == participant_id,
        EventParticipant.event_id == event_id
    ).first()
    
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with id {participant_id} not found in event {event_id}"
        )
    
    db.delete(db_participant)
    db.commit()
    return None


# Event Course endpoints
@router.post("/events/{event_id}/courses", response_model=EventCourseResponse, status_code=status.HTTP_201_CREATED)
def add_course(event_id: int, course: EventCourseCreate, db: Session = Depends(get_db)):
    """
    Add a course to an event.
    """
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    db_course = EventCourse(
        event_id=event_id,
        course_number=course.course_number,
        course_name=course.course_name
    )
    db.add(db_course)
    db.flush()
    
    # Add recipes to course
    for recipe_id in course.recipe_ids:
        db_course_recipe = CourseRecipe(
            course_id=db_course.id,
            recipe_id=recipe_id
        )
        db.add(db_course_recipe)
    
    db.commit()
    db.refresh(db_course)
    return db_course


@router.put("/events/{event_id}/courses/{course_id}", response_model=EventCourseResponse)
def update_course(
    event_id: int,
    course_id: int,
    course_update: EventCourseUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an event course.
    """
    db_course = db.query(EventCourse).filter(
        EventCourse.id == course_id,
        EventCourse.event_id == event_id
    ).first()
    
    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found in event {event_id}"
        )
    
    # Update basic fields
    update_data = course_update.model_dump(exclude_unset=True, exclude={'recipe_ids'})
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    # Update recipe references if provided
    if course_update.recipe_ids is not None:
        # Remove old references
        db.query(CourseRecipe).filter(CourseRecipe.course_id == course_id).delete()
        # Add new references
        for recipe_id in course_update.recipe_ids:
            db_course_recipe = CourseRecipe(
                course_id=course_id,
                recipe_id=recipe_id
            )
            db.add(db_course_recipe)
    
    db.commit()
    db.refresh(db_course)
    return db_course


@router.delete("/events/{event_id}/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(event_id: int, course_id: int, db: Session = Depends(get_db)):
    """
    Delete an event course.
    """
    db_course = db.query(EventCourse).filter(
        EventCourse.id == course_id,
        EventCourse.event_id == event_id
    ).first()
    
    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {course_id} not found in event {event_id}"
        )
    
    db.delete(db_course)
    db.commit()
    return None


# Shopping List endpoints
@router.post("/events/{event_id}/shopping-list", response_model=ShoppingListDetailResponse, status_code=status.HTTP_201_CREATED)
def create_shopping_list(event_id: int, shopping_list: ShoppingListCreate, db: Session = Depends(get_db)):
    """
    Create a shopping list for an event.
    """
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    # Check if shopping list already exists
    existing = db.query(ShoppingList).filter(ShoppingList.event_id == event_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Shopping list already exists for event {event_id}"
        )
    
    db_shopping_list = ShoppingList(event_id=event_id)
    db.add(db_shopping_list)
    db.flush()
    
    # Add items
    for item in shopping_list.items:
        db_item = ShoppingListItem(
            shopping_list_id=db_shopping_list.id,
            **item.model_dump()
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_shopping_list)
    return db_shopping_list


@router.get("/events/{event_id}/shopping-list", response_model=ShoppingListDetailResponse)
def get_shopping_list(event_id: int, db: Session = Depends(get_db)):
    """
    Get the shopping list for an event.
    """
    shopping_list = db.query(ShoppingList).filter(ShoppingList.event_id == event_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shopping list not found for event {event_id}"
        )
    return shopping_list


@router.delete("/events/{event_id}/shopping-list", status_code=status.HTTP_204_NO_CONTENT)
def delete_shopping_list(event_id: int, db: Session = Depends(get_db)):
    """
    Delete the shopping list for an event.
    """
    shopping_list = db.query(ShoppingList).filter(ShoppingList.event_id == event_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shopping list not found for event {event_id}"
        )
    
    db.delete(shopping_list)
    db.commit()
    return None


# Shopping List Item endpoints
@router.post("/shopping-lists/{list_id}/items", response_model=ShoppingListItemResponse, status_code=status.HTTP_201_CREATED)
def add_shopping_item(list_id: int, item: ShoppingListItemCreate, db: Session = Depends(get_db)):
    """
    Add an item to a shopping list.
    """
    # Verify shopping list exists
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shopping list with id {list_id} not found"
        )
    
    db_item = ShoppingListItem(
        shopping_list_id=list_id,
        **item.model_dump()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/shopping-lists/{list_id}/items/{item_id}", response_model=ShoppingListItemResponse)
def update_shopping_item(
    list_id: int,
    item_id: int,
    item_update: ShoppingListItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a shopping list item.
    """
    db_item = db.query(ShoppingListItem).filter(
        ShoppingListItem.id == item_id,
        ShoppingListItem.shopping_list_id == list_id
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found in shopping list {list_id}"
        )
    
    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/shopping-lists/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shopping_item(list_id: int, item_id: int, db: Session = Depends(get_db)):
    """
    Delete a shopping list item.
    """
    db_item = db.query(ShoppingListItem).filter(
        ShoppingListItem.id == item_id,
        ShoppingListItem.shopping_list_id == list_id
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found in shopping list {list_id}"
        )
    
    db.delete(db_item)
    db.commit()
    return None


# Made with Bob