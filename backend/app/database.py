import warnings
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SAWarning

from app.config import settings, DatabaseType

# Configure logging
logger = logging.getLogger(__name__)

# Get database URL from settings
SQLALCHEMY_DATABASE_URL = settings.get_database_url()

logger.info("=" * 80)
logger.info("DATABASE CONFIGURATION")
logger.info("=" * 80)
logger.info(f"Database Type: {settings.database_type}")
logger.info(f"Database URL: {SQLALCHEMY_DATABASE_URL}")
logger.info(f"Engine kwargs: {settings.get_engine_kwargs()}")

# Ignore DB2 warnings about duplicate indexes
if settings.database_type == DatabaseType.DB2:
    warnings.filterwarnings("ignore", category=SAWarning)
    logger.info("DB2 warnings suppressed")

# Create engine with appropriate configuration
logger.info("Creating database engine...")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **settings.get_engine_kwargs()
)
logger.info("✓ Database engine created successfully")
logger.info("=" * 80)

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
        logger.debug("Database session created")
        yield db
    finally:
        logger.debug("Database session closed")
        db.close()

# Made with Bob
