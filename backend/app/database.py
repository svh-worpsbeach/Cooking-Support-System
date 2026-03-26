import warnings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SAWarning

from app.config import settings, DatabaseType

# Get database URL from settings
SQLALCHEMY_DATABASE_URL = settings.get_database_url()

# Ignore DB2 warnings about duplicate indexes
if settings.database_type == DatabaseType.DB2:
    warnings.filterwarnings("ignore", category=SAWarning)

# Create engine with appropriate configuration
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **settings.get_engine_kwargs()
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
