"""
Main FastAPI application for the Cooking Management System.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
import os
import logging
import time

from app.database import engine, Base
from app.models import *  # Import all models to ensure they're registered

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger("cms.backend")


def log_common_event(
    level: int,
    client_ip: str,
    method: str,
    path: str,
    protocol: str,
    status_code: int,
    response_size: int,
    duration_ms: float,
    source: str,
    message: str = "-",
    user_agent: str = "-",
    referer: str = "-"
) -> None:
    timestamp = time.strftime("%d/%b/%Y:%H:%M:%S %z")
    logger.log(
        level,
        '%s - - [%s] "%s %s %s" %s %s "%s" "%s" source=%s duration_ms=%.2f message="%s"',
        client_ip or "-",
        timestamp,
        method,
        path,
        protocol,
        status_code,
        response_size,
        referer,
        user_agent,
        source,
        duration_ms,
        message.replace('"', "'")
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    from app.config import settings

    log_common_event(
        logging.INFO,
        client_ip="127.0.0.1",
        method="SYSTEM",
        path="/startup",
        protocol="INTERNAL",
        status_code=200,
        response_size=0,
        duration_ms=0.0,
        source="backend",
        message=f"startup database_type={settings.database_type} database_url={settings.get_database_url()}",
        user_agent="CookingManagementSystem",
    )
    
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
        
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        log_common_event(
            logging.INFO,
            client_ip="127.0.0.1",
            method="SYSTEM",
            path="/startup/database",
            protocol="INTERNAL",
            status_code=200,
            response_size=len(tables),
            duration_ms=0.0,
            source="backend",
            message=f"database tables_ready={','.join(tables)}",
            user_agent="CookingManagementSystem",
        )
    except Exception as e:
        error_msg = str(e)
        if "SQL0605W" in error_msg:
            log_common_event(
                logging.WARNING,
                client_ip="127.0.0.1",
                method="SYSTEM",
                path="/startup/database",
                protocol="INTERNAL",
                status_code=200,
                response_size=0,
                duration_ms=0.0,
                source="backend",
                message=f"database warning={error_msg}",
                user_agent="CookingManagementSystem",
            )
        else:
            log_common_event(
                logging.ERROR,
                client_ip="127.0.0.1",
                method="SYSTEM",
                path="/startup/database",
                protocol="INTERNAL",
                status_code=500,
                response_size=0,
                duration_ms=0.0,
                source="backend",
                message=f"database error={error_msg}",
                user_agent="CookingManagementSystem",
            )
            raise
    
    yield
    
    log_common_event(
        logging.INFO,
        client_ip="127.0.0.1",
        method="SYSTEM",
        path="/shutdown",
        protocol="INTERNAL",
        status_code=200,
        response_size=0,
        duration_ms=0.0,
        source="backend",
        message="shutdown",
        user_agent="CookingManagementSystem",
    )

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


@app.middleware("http")
async def common_log_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    client_ip = request.client.host if request.client else "-"
    method = request.method
    path = request.url.path
    protocol = request.scope.get("http_version", "HTTP/1.1")
    protocol_label = f"HTTP/{protocol}" if not str(protocol).startswith("HTTP/") else str(protocol)
    user_agent = request.headers.get("user-agent", "-")
    referer = request.headers.get("referer", "-")
    
    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000
        response_size = int(response.headers.get("content-length", "0"))
        log_common_event(
            logging.INFO,
            client_ip=client_ip,
            method=method,
            path=path,
            protocol=protocol_label,
            status_code=response.status_code,
            response_size=response_size,
            duration_ms=duration_ms,
            source="backend",
            user_agent=user_agent,
            referer=referer,
        )
        return response
    except Exception as exc:
        duration_ms = (time.perf_counter() - start_time) * 1000
        log_common_event(
            logging.ERROR,
            client_ip=client_ip,
            method=method,
            path=path,
            protocol=protocol_label,
            status_code=500,
            response_size=0,
            duration_ms=duration_ms,
            source="backend",
            message=str(exc),
            user_agent=user_agent,
            referer=referer,
        )
        raise


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
from app.routers import locations, recipes, events, tools, storage, admin, guests, ingredients, shopping_lists

app.include_router(locations.router, prefix="/api", tags=["locations"])
app.include_router(recipes.router, prefix="/api", tags=["recipes"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(tools.router, prefix="/api", tags=["tools"])
app.include_router(storage.router, prefix="/api", tags=["storage"])
app.include_router(guests.router, prefix="/api", tags=["guests"])
app.include_router(ingredients.router, prefix="/api")
app.include_router(shopping_lists.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Made with Bob
