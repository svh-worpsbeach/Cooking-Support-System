"""
Admin schemas for configuration and logs.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DatabaseConfig(BaseModel):
    """Database configuration information."""
    database_type: str
    database_url: str  # Sanitized (no passwords)
    pool_size: Optional[int] = None
    max_overflow: Optional[int] = None
    pool_pre_ping: Optional[bool] = None
    echo_sql: bool


class SystemConfig(BaseModel):
    """System configuration information."""
    database: DatabaseConfig
    cors_origins: List[str]
    upload_directories: Dict[str, str]


class LogEntry(BaseModel):
    """Single log entry."""
    timestamp: datetime
    level: str
    source: str
    message: str
    details: Optional[Dict[str, Any]] = None


class LogsResponse(BaseModel):
    """Response containing logs."""
    logs: List[LogEntry]
    total_count: int
    page: int
    page_size: int


class SystemStats(BaseModel):
    """System statistics."""
    database_size: Optional[str] = None
    total_recipes: int
    total_events: int
    total_tools: int
    total_storage_items: int
    total_locations: int
    uptime: Optional[str] = None


# Made with Bob