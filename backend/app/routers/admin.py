"""
Admin router for system configuration and logs.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.admin import SystemConfig, LogsResponse, SystemStats
from app.services import admin_service


router = APIRouter()

# Global variable to track seed data loading status
_seed_loading_status = {
    "is_loading": False,
    "progress": 0,
    "message": "",
    "error": None
}


@router.get("/config", response_model=SystemConfig)
async def get_system_configuration():
    """
    Get current system configuration.
    
    Returns database configuration, CORS settings, and upload directories.
    Passwords and sensitive information are sanitized.
    """
    return admin_service.get_system_config()


@router.get("/logs", response_model=LogsResponse)
async def get_system_logs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    level: str = Query(None, description="Filter by log level (INFO, WARNING, ERROR)"),
    source: str = Query(None, description="Filter by log source"),
):
    """
    Get system logs with pagination and filtering.
    
    Logs include:
    - Database interactions
    - API requests
    - System events
    - Error messages
    """
    return admin_service.get_logs(
        page=page,
        page_size=page_size,
        level=level,
        source=source,
    )


@router.get("/stats", response_model=SystemStats)
async def get_system_statistics(db: Session = Depends(get_db)):
    """
    Get system statistics.
    
    Returns counts of all entities and database size information.
    """
    return admin_service.get_system_stats(db)


@router.post("/logs/clear")
async def clear_logs():
    """
    Clear all stored logs.
    
    This will remove all log entries from the in-memory buffer.
    """
    admin_service._log_buffer.clear()
    admin_service.add_log_entry("INFO", "admin", "Logs cleared by admin")
    return {"message": "Logs cleared successfully"}


@router.post("/data/clear")
async def clear_all_data(db: Session = Depends(get_db)):
    """
    Clear all data from the database.
    
    WARNING: This will delete all recipes, events, tools, storage items, and locations.
    This action cannot be undone.
    """
    try:
        counts = admin_service.clear_all_data(db)
        return {
            "message": "All data cleared successfully",
            "deleted_counts": counts
        }
    except Exception as e:
        admin_service.add_log_entry("ERROR", "admin", f"Failed to clear data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/data/seed")
async def load_seed_data(background_tasks: BackgroundTasks):
    """
    Load seed/test data into the database.
    
    This will populate the database with sample recipes, events, tools, and storage items.
    This is a background task that runs asynchronously.
    """
    global _seed_loading_status
    
    if _seed_loading_status["is_loading"]:
        raise HTTPException(status_code=409, detail="Seed data is already being loaded")
    
    # Start background task
    _seed_loading_status = {
        "is_loading": True,
        "progress": 0,
        "message": "Starting seed data load...",
        "error": None
    }
    
    background_tasks.add_task(admin_service.load_seed_data_background, _seed_loading_status)
    
    return {
        "message": "Seed data loading started in background",
        "status": "started"
    }


@router.get("/data/seed/status")
async def get_seed_status():
    """
    Get the current status of seed data loading.
    """
    return _seed_loading_status


# Made with Bob