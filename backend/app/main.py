"""
Main FastAPI application for the Cooking Management System.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.models import *  # Import all models to ensure they're registered

# Create FastAPI app
app = FastAPI(
    title="Cookies Support System API",
    description="API for managing recipes, events, cooking tools, and storage",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
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


@app.on_event("startup")
async def startup():
    """
    Create database tables on startup.
    """
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


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
from app.routers import locations, recipes, events, tools, storage

app.include_router(locations.router, prefix="/api", tags=["locations"])
app.include_router(recipes.router, prefix="/api", tags=["recipes"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(tools.router, prefix="/api", tags=["tools"])
app.include_router(storage.router, prefix="/api", tags=["storage"])

# Made with Bob
