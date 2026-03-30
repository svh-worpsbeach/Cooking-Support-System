"""
Main FastAPI application for the Cooking Management System.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.models import *  # Import all models to ensure they're registered


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup: Create database tables
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
        print("Database tables created successfully")
    except Exception as e:
        error_msg = str(e)
        # Only ignore DB2 index warnings (SQL0605W)
        if "SQL0605W" in error_msg:
            print(f"Warning (ignored): Index already exists")
            print("Database tables created successfully (with warnings)")
        else:
            print(f"ERROR creating tables: {error_msg}")
            raise
    
    yield
    
    # Shutdown: Add cleanup logic here if needed
    print("Application shutting down")

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
    allow_origins=[
        "http://localhost:5500",  # Frontend PostgreSQL
        "http://localhost:5501",  # Frontend DB2
        "http://localhost:5502",  # Frontend SQLite
        "http://localhost:5580",  # Backend API
        "http://localhost:5173",  # Vite dev server (legacy)
        "http://localhost:3000",  # Alternative dev server (legacy)
        "http://localhost",  # Frontend container (legacy)
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501",
        "http://127.0.0.1:5502",
        "http://127.0.0.1:5580",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/recipes", exist_ok=True)
os.makedirs("uploads/tools", exist_ok=True)

# Mount static files for images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


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
from app.routers import locations, recipes, events, tools, storage, admin

app.include_router(locations.router, prefix="/api", tags=["locations"])
app.include_router(recipes.router, prefix="/api", tags=["recipes"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(tools.router, prefix="/api", tags=["tools"])
app.include_router(storage.router, prefix="/api", tags=["storage"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Made with Bob
