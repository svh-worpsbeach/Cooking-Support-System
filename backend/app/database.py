import os
import warnings
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SAWarning

# Get database URL from environment variable or use default DB2 connection
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "db2+ibm_db://db2inst1:db2inst1-pwd@localhost:50000/COOKDB"
)

# Check if we're using DB2 or SQLite (fallback for local development)
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # DB2 configuration
    # Ignore DB2 warnings about duplicate indexes
    warnings.filterwarnings("ignore", category=SAWarning)
    
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,  # Enable connection health checks
        pool_size=10,
        max_overflow=20,
        echo=False  # Set to True for SQL query logging
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
Base = declarative_base()


# Dependency to get database session
def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Made with Bob
