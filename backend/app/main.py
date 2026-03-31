"""
Main FastAPI application for the Cooking Management System.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.database import engine, Base
from app.models import *  # Import all models to ensure they're registered

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    logger.info("=" * 80)
    logger.info("BACKEND STARTUP - Cooking Management System")
    logger.info("=" * 80)
    
    # Log database configuration
    from app.config import settings
    logger.info(f"Database Type: {settings.database_type}")
    logger.info(f"Database URL: {settings.get_database_url()}")
    
    # Startup: Create database tables
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine, checkfirst=True)
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Available tables: {', '.join(tables)}")
        
        # Check each table
        for table_name in tables:
            columns = inspector.get_columns(table_name)
            logger.debug(f"Table '{table_name}' has {len(columns)} columns")
        
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        error_msg = str(e)
        # Only ignore DB2 index warnings (SQL0605W)
        if "SQL0605W" in error_msg:
            logger.warning(f"Index already exists (ignored): {error_msg}")
            logger.info("✓ Database tables created successfully (with warnings)")
        else:
            logger.error(f"✗ ERROR creating tables: {error_msg}")
            raise
    
    logger.info("=" * 80)
    logger.info("Backend ready to accept requests")
    logger.info("=" * 80)
    
    yield
    
    # Shutdown: Add cleanup logic here if needed
    logger.info("Application shutting down")

# Create FastAPI app
app = FastAPI(
    title="Cookies Support System API",
    description="API for managing recipes, events, cooking tools, and storage",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development/testing
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/recipes", exist_ok=True)
os.makedirs("uploads/tools", exist_ok=True)
os.makedirs("uploads/locations", exist_ok=True)
os.makedirs("uploads/guests", exist_ok=True)

# Mount static files for images under /api/uploads to match frontend URLs
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
async def root():
    """
    Root endpoint.
    """
    return {
        "message": "Cookies Support System API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}


# Include routers
from app.routers import locations, recipes, events, tools, storage, admin, guests

app.include_router(locations.router, prefix="/api", tags=["locations"])
app.include_router(recipes.router, prefix="/api", tags=["recipes"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(tools.router, prefix="/api", tags=["tools"])
app.include_router(storage.router, prefix="/api", tags=["storage"])
app.include_router(guests.router, prefix="/api", tags=["guests"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Made with Bob
