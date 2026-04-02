"""
Admin service for system configuration and log management.
"""

import os
import logging
import subprocess
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.schemas.admin import (
    DatabaseConfig,
    SystemConfig,
    LogEntry,
    LogsResponse,
    SystemStats,
)
from app.models.recipe import Recipe, RecipeCategory, RecipeIngredient, RecipeStep, RecipeImage
from app.models.event import Event, EventParticipant, EventCourse, CourseRecipe
from app.models.shopping_list import ShoppingList, ShoppingListItem
from app.models.tool import CookingTool, ToolWishlist
from app.models.storage import StorageItem
from app.models.location import Location


# In-memory log storage (for demonstration)
# In production, you might want to use a proper logging backend
_log_buffer: List[Dict[str, Any]] = []
_max_log_entries = 1000

# Export _log_buffer for use in routers
__all__ = ['_log_buffer', 'add_log_entry', 'get_system_config', 'get_logs', 'get_system_stats',
           'clear_all_data', 'load_seed_data', 'load_seed_data_background']


def add_log_entry(level: str, source: str, message: str, details: Dict[str, Any] = None):
    """Add a log entry to the buffer."""
    global _log_buffer
    
    entry = {
        "timestamp": datetime.utcnow(),
        "level": level,
        "source": source,
        "message": message,
        "details": details or {},
    }
    
    _log_buffer.append(entry)
    
    # Keep only the last N entries
    if len(_log_buffer) > _max_log_entries:
        _log_buffer = _log_buffer[-_max_log_entries:]


def get_system_config() -> SystemConfig:
    """Get current system configuration."""
    # Sanitize database URL (remove password)
    db_url = settings.get_database_url()
    if "@" in db_url:
        # Format: protocol://user:password@host/db
        parts = db_url.split("@")
        if ":" in parts[0]:
            protocol_user = parts[0].rsplit(":", 1)[0]
            sanitized_url = f"{protocol_user}:****@{parts[1]}"
        else:
            sanitized_url = db_url
    else:
        sanitized_url = db_url
    
    db_config = DatabaseConfig(
        database_type=settings.database_type.value,
        database_url=sanitized_url,
        pool_size=settings.pool_size if settings.database_type.value != "sqlite" else None,
        max_overflow=settings.max_overflow if settings.database_type.value != "sqlite" else None,
        pool_pre_ping=settings.pool_pre_ping if settings.database_type.value != "sqlite" else None,
        echo_sql=settings.echo_sql,
    )
    
    upload_dirs = {
        "recipes": os.path.abspath("uploads/recipes"),
        "tools": os.path.abspath("uploads/tools"),
    }
    
    return SystemConfig(
        database=db_config,
        cors_origins=settings.cors_origins_list,
        upload_directories=upload_dirs,
    )


def get_logs(
    page: int = 1,
    page_size: int = 100,
    level: str = None,
    source: str = None,
) -> LogsResponse:
    """Get system logs with pagination and filtering."""
    global _log_buffer
    
    # Filter logs
    filtered_logs = _log_buffer
    
    if level:
        filtered_logs = [log for log in filtered_logs if log["level"] == level]
    
    if source:
        filtered_logs = [log for log in filtered_logs if log["source"] == source]
    
    # Sort by timestamp (newest first)
    filtered_logs = sorted(filtered_logs, key=lambda x: x["timestamp"], reverse=True)
    
    # Paginate
    total_count = len(filtered_logs)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_logs = filtered_logs[start_idx:end_idx]
    
    # Convert to LogEntry objects
    log_entries = [
        LogEntry(
            timestamp=log["timestamp"],
            level=log["level"],
            source=log["source"],
            message=log["message"],
            details=log.get("details"),
        )
        for log in page_logs
    ]
    
    return LogsResponse(
        logs=log_entries,
        total_count=total_count,
        page=page,
        page_size=page_size,
    )


def get_system_stats(db: Session) -> SystemStats:
    """Get system statistics."""
    # Get database size (SQLite only)
    db_size = None
    if settings.database_type.value == "sqlite":
        db_path = settings.sqlite_database
        if os.path.exists(db_path):
            size_bytes = os.path.getsize(db_path)
            # Convert to human-readable format
            if size_bytes < 1024:
                db_size = f"{size_bytes} B"
            elif size_bytes < 1024 * 1024:
                db_size = f"{size_bytes / 1024:.2f} KB"
            else:
                db_size = f"{size_bytes / (1024 * 1024):.2f} MB"
    
    # Get counts
    total_recipes = db.query(func.count(Recipe.id)).scalar() or 0
    total_events = db.query(func.count(Event.id)).scalar() or 0
    total_tools = db.query(func.count(CookingTool.id)).scalar() or 0
    total_storage_items = db.query(func.count(StorageItem.id)).scalar() or 0
    total_locations = db.query(func.count(Location.id)).scalar() or 0
    
    return SystemStats(
        database_size=db_size,
        total_recipes=total_recipes,
        total_events=total_events,
        total_tools=total_tools,
        total_storage_items=total_storage_items,
        total_locations=total_locations,
        uptime=None,  # Could be implemented with process start time
    )


def clear_all_data(db: Session) -> Dict[str, int]:
    """
    Clear all data from the database.
    
    Returns:
        Dict with counts of deleted items
    """
    counts = {}
    
    try:
        # Delete in correct order to respect foreign key constraints
        # Use synchronize_session=False to avoid issues with expired objects
        counts['shopping_list_items'] = db.query(ShoppingListItem).delete(synchronize_session=False)
        counts['shopping_lists'] = db.query(ShoppingList).delete(synchronize_session=False)
        counts['course_recipes'] = db.query(CourseRecipe).delete(synchronize_session=False)
        counts['event_courses'] = db.query(EventCourse).delete(synchronize_session=False)
        counts['event_participants'] = db.query(EventParticipant).delete(synchronize_session=False)
        counts['events'] = db.query(Event).delete(synchronize_session=False)
        
        counts['recipe_images'] = db.query(RecipeImage).delete(synchronize_session=False)
        counts['recipe_steps'] = db.query(RecipeStep).delete(synchronize_session=False)
        counts['recipe_ingredients'] = db.query(RecipeIngredient).delete(synchronize_session=False)
        counts['recipe_categories'] = db.query(RecipeCategory).delete(synchronize_session=False)
        counts['recipes'] = db.query(Recipe).delete(synchronize_session=False)
        
        counts['tool_wishlist'] = db.query(ToolWishlist).delete(synchronize_session=False)
        counts['tools'] = db.query(CookingTool).delete(synchronize_session=False)
        
        counts['storage_items'] = db.query(StorageItem).delete(synchronize_session=False)
        counts['locations'] = db.query(Location).delete(synchronize_session=False)
        
        db.commit()
        
        add_log_entry("INFO", "admin", "Cleared all data from database", counts)
        
        return counts
    except Exception as e:
        db.rollback()
        error_msg = f"Failed to clear data: {str(e)}"
        add_log_entry("ERROR", "admin", error_msg)
        raise Exception(error_msg)


def load_seed_data() -> Dict[str, Any]:
    """
    Load seed data by running the seed_data.py script.
    
    Returns:
        Dict with status and message
    """
    try:
        # Get the absolute path to seed_data.py
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir))
        seed_script = os.path.join(backend_dir, "seed_data.py")
        
        add_log_entry("INFO", "admin", f"Looking for seed script at: {seed_script}")
        
        if not os.path.exists(seed_script):
            error_msg = f"Seed script not found at {seed_script}"
            add_log_entry("ERROR", "admin", error_msg)
            return {
                "success": False,
                "message": error_msg
            }
        
        # Set environment variable for API URL
        env = os.environ.copy()
        env['API_URL'] = 'http://localhost:8000/api'
        
        # Run the seed script
        result = subprocess.run(
            [sys.executable, seed_script],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=backend_dir,
            env=env
        )
        
        if result.returncode == 0:
            add_log_entry("INFO", "admin", "Seed data loaded successfully", {
                "output": result.stdout[:500]  # Limit output size
            })
            return {
                "success": True,
                "message": "Seed data loaded successfully",
                "output": result.stdout
            }
        else:
            add_log_entry("ERROR", "admin", "Failed to load seed data", {
                "error": result.stderr[:500]  # Limit error size
            })
            return {
                "success": False,
                "message": "Failed to load seed data",
                "error": result.stderr
            }
    except subprocess.TimeoutExpired:
        add_log_entry("ERROR", "admin", "Seed data loading timed out")
        return {
            "success": False,
            "message": "Seed data loading timed out (exceeded 120 seconds)"
        }
    except Exception as e:
        error_msg = f"Error loading seed data: {str(e)}"
        add_log_entry("ERROR", "admin", error_msg)
        return {
            "success": False,
            "message": error_msg
        }


def load_seed_data_background(status_dict: Dict[str, Any]):
    """
    Load seed data in background with progress updates.
    
    Args:
        status_dict: Dictionary to update with progress information
    """
    try:
        status_dict["message"] = "Looking for seed script..."
        status_dict["progress"] = 10
        
        # Get the absolute path to seed_data.py
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir))
        seed_script = os.path.join(backend_dir, "seed_data.py")
        
        add_log_entry("INFO", "admin", f"Looking for seed script at: {seed_script}")
        
        if not os.path.exists(seed_script):
            error_msg = f"Seed script not found at {seed_script}"
            status_dict["error"] = error_msg
            status_dict["is_loading"] = False
            add_log_entry("ERROR", "admin", error_msg)
            return
        
        status_dict["message"] = "Running seed script..."
        status_dict["progress"] = 20
        
        # Set environment variable for API URL
        env = os.environ.copy()
        env['API_URL'] = 'http://localhost:8000/api'
        
        # Run the seed script
        process = subprocess.Popen(
            [sys.executable, seed_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=backend_dir,
            env=env
        )
        
        # Read output line by line to track progress
        output_lines = []
        for line in iter(process.stdout.readline, ''):
            if not line:
                break
            output_lines.append(line.strip())
            
            # Update progress based on output
            if "Creating locations" in line:
                status_dict["progress"] = 30
                status_dict["message"] = "Creating locations..."
            elif "Creating recipes" in line:
                status_dict["progress"] = 40
                status_dict["message"] = "Creating recipes..."
            elif "Creating events" in line:
                status_dict["progress"] = 60
                status_dict["message"] = "Creating events..."
            elif "Creating cooking tools" in line:
                status_dict["progress"] = 75
                status_dict["message"] = "Creating tools..."
            elif "Creating storage items" in line:
                status_dict["progress"] = 85
                status_dict["message"] = "Creating storage items..."
            elif "complete" in line.lower():
                status_dict["progress"] = 95
                status_dict["message"] = "Finalizing..."
            
            add_log_entry("INFO", "seed_data", line.strip())
        
        # Wait for process to complete
        return_code = process.wait()
        
        if return_code == 0:
            status_dict["progress"] = 100
            status_dict["message"] = "Seed data loaded successfully"
            status_dict["is_loading"] = False
            add_log_entry("INFO", "admin", "Seed data loaded successfully")
        else:
            stderr_output = process.stderr.read()
            error_msg = f"Seed script failed with return code {return_code}"
            status_dict["error"] = error_msg
            status_dict["is_loading"] = False
            add_log_entry("ERROR", "admin", error_msg, {"stderr": stderr_output[:500]})
            
    except Exception as e:
        error_msg = f"Error loading seed data: {str(e)}"
        status_dict["error"] = error_msg
        status_dict["is_loading"] = False
        add_log_entry("ERROR", "admin", error_msg)


# Initialize with some startup logs
add_log_entry("INFO", "system", "Admin service initialized")


# Made with Bob