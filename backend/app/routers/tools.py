"""
Tool router for managing cooking tools and wishlist.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.services.file_service import file_service
from app.models.tool import CookingTool, ToolWishlist
from app.models.location import Location
from app.schemas.tool import (
    CookingToolCreate, CookingToolUpdate, CookingToolResponse, CookingToolWithLocation,
    ToolWishlistCreate, ToolWishlistUpdate, ToolWishlistResponse
)

router = APIRouter()


# Cooking Tool endpoints
@router.post("/tools", response_model=CookingToolResponse, status_code=status.HTTP_201_CREATED)
def create_tool(tool: CookingToolCreate, db: Session = Depends(get_db)):
    """
    Create a new cooking tool.
    """
    # Verify location exists
    location = db.query(Location).filter(Location.id == tool.location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with id {tool.location_id} not found"
        )
    
    db_tool = CookingTool(**tool.model_dump())
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool


@router.get("/tools", response_model=List[CookingToolWithLocation])
def list_tools(
    skip: int = 0,
    limit: int = 100,
    location_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    List all cooking tools with optional location filter and pagination.
    """
    query = db.query(CookingTool).join(Location)
    
    if location_id:
        query = query.filter(CookingTool.location_id == location_id)
    
    tools = query.offset(skip).limit(limit).all()
    
    # Add location name to response
    result = []
    for tool in tools:
        tool_dict = {
            "id": tool.id,
            "name": tool.name,
            "description": tool.description,
            "location_id": tool.location_id,
            "storage_location": tool.storage_location,
            "image_path": tool.image_path,
            "created_at": tool.created_at,
            "updated_at": tool.updated_at,
            "location_name": tool.location.name
        }
        result.append(tool_dict)
    
    return result


@router.get("/tools/{tool_id}", response_model=CookingToolWithLocation)
def get_tool(tool_id: int, db: Session = Depends(get_db)):
    """
    Get a specific cooking tool.
    """
    tool = db.query(CookingTool).filter(CookingTool.id == tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    return {
        "id": tool.id,
        "name": tool.name,
        "description": tool.description,
        "location_id": tool.location_id,
        "storage_location": tool.storage_location,
        "image_path": tool.image_path,
        "created_at": tool.created_at,
        "updated_at": tool.updated_at,
        "location_name": tool.location.name
    }


@router.put("/tools/{tool_id}", response_model=CookingToolResponse)
def update_tool(tool_id: int, tool_update: CookingToolUpdate, db: Session = Depends(get_db)):
    """
    Update a cooking tool.
    """
    db_tool = db.query(CookingTool).filter(CookingTool.id == tool_id).first()
    if not db_tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    # Verify new location exists if provided
    if tool_update.location_id:
        location = db.query(Location).filter(Location.id == tool_update.location_id).first()
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Location with id {tool_update.location_id} not found"
            )
    
    # Update fields
    update_data = tool_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tool, field, value)
    
    db.commit()
    db.refresh(db_tool)
    return db_tool


@router.delete("/tools/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(tool_id: int, db: Session = Depends(get_db)):
    """
    Delete a cooking tool and its image.
    """
    db_tool = db.query(CookingTool).filter(CookingTool.id == tool_id).first()
    if not db_tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    # Delete image using file service (handles both image and thumbnail)
    if db_tool.image_path:
        file_service.delete_file(db_tool.image_path, "tools")
    
    db.delete(db_tool)
    db.commit()
    return None


@router.post("/tools/{tool_id}/image", response_model=CookingToolResponse)
async def upload_tool_image(
    tool_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a cooking tool with automatic thumbnail generation.
    """
    # Verify tool exists
    tool = db.query(CookingTool).filter(CookingTool.id == tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    # Delete old image if exists
    if tool.image_path:
        file_service.delete_file(tool.image_path, "tools")
    
    # Save file using file service
    filename, filepath = await file_service.save_upload(
        file=file,
        category="tools",
        create_thumbnail=True
    )
    
    # Update tool record
    tool.image_path = filepath
    db.commit()
    db.refresh(tool)
    return tool


@router.delete("/tools/{tool_id}/image", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool_image(tool_id: int, db: Session = Depends(get_db)):
    """
    Delete a cooking tool's image.
    """
    tool = db.query(CookingTool).filter(CookingTool.id == tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    if not tool.image_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool has no image"
        )
    
    # Delete image using file service
    file_service.delete_file(tool.image_path, "tools")
    
    # Update tool record
    tool.image_path = None
    db.commit()
    return None


@router.get("/tools/{tool_id}/image/url")
def get_tool_image_url(tool_id: int, thumbnail: bool = False, db: Session = Depends(get_db)):
    """
    Get the URL for a tool's image or its thumbnail.
    """
    tool = db.query(CookingTool).filter(CookingTool.id == tool_id).first()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool with id {tool_id} not found"
        )
    
    if not tool.image_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool has no image"
        )
    
    if thumbnail:
        url = file_service.get_thumbnail_url(tool.image_path)
        if not url:
            # Fallback to original image if thumbnail doesn't exist
            url = file_service.get_file_url(tool.image_path)
    else:
        url = file_service.get_file_url(tool.image_path)
    
    return {"url": url}


# Tool Wishlist endpoints
@router.post("/tools/wishlist", response_model=ToolWishlistResponse, status_code=status.HTTP_201_CREATED)
def create_wishlist_item(item: ToolWishlistCreate, db: Session = Depends(get_db)):
    """
    Add a tool to the wishlist.
    """
    db_item = ToolWishlist(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/tools/wishlist", response_model=List[ToolWishlistResponse])
def list_wishlist(
    skip: int = 0,
    limit: int = 100,
    priority: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    List all wishlist items with optional priority filter and pagination.
    """
    query = db.query(ToolWishlist)
    
    if priority:
        query = query.filter(ToolWishlist.priority == priority)
    
    items = query.order_by(ToolWishlist.priority, ToolWishlist.created_at.desc()).offset(skip).limit(limit).all()
    return items


@router.get("/tools/wishlist/{item_id}", response_model=ToolWishlistResponse)
def get_wishlist_item(item_id: int, db: Session = Depends(get_db)):
    """
    Get a specific wishlist item.
    """
    item = db.query(ToolWishlist).filter(ToolWishlist.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wishlist item with id {item_id} not found"
        )
    return item


@router.put("/tools/wishlist/{item_id}", response_model=ToolWishlistResponse)
def update_wishlist_item(item_id: int, item_update: ToolWishlistUpdate, db: Session = Depends(get_db)):
    """
    Update a wishlist item.
    """
    db_item = db.query(ToolWishlist).filter(ToolWishlist.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wishlist item with id {item_id} not found"
        )
    
    # Update fields
    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/tools/wishlist/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wishlist_item(item_id: int, db: Session = Depends(get_db)):
    """
    Delete a wishlist item.
    """
    db_item = db.query(ToolWishlist).filter(ToolWishlist.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wishlist item with id {item_id} not found"
        )
    
    db.delete(db_item)
    db.commit()
    return None


# Made with Bob