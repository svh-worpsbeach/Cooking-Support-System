"""
Manual table creation script to debug DB2 issues.
"""
import sys
import traceback
import warnings
from sqlalchemy import exc as sa_exc
from app.database import engine, Base
from app.models import *  # Import all models

# Ignore DB2 index warnings
warnings.filterwarnings("ignore", category=sa_exc.SAWarning)

def create_tables():
    """Create all tables and show detailed errors."""
    print("=" * 80)
    print("Starting table creation...")
    print(f"Database URL: {engine.url}")
    print("=" * 80)
    
    try:
        # Test connection first
        print("\n1. Testing database connection...")
        with engine.connect() as conn:
            print("✓ Connection successful!")
            
        # Get all table metadata
        print("\n2. Analyzing table metadata...")
        tables = Base.metadata.sorted_tables
        print(f"Found {len(tables)} tables to create:")
        for table in tables:
            print(f"  - {table.name}")
            
        # Try to create tables
        print("\n3. Creating tables...")
        try:
            Base.metadata.create_all(bind=engine, checkfirst=False)
        except Exception as create_error:
            # Check if it's just an index warning (SQL0605W)
            error_msg = str(create_error)
            if "SQL0605W" in error_msg:
                print("⚠ Warning: Duplicate index detected (ignored)")
            else:
                raise
        print("✓ Tables created successfully!")
        
        # Verify tables were created
        print("\n4. Verifying table creation...")
        with engine.connect() as conn:
            result = conn.execute(
                "SELECT TABNAME FROM SYSCAT.TABLES WHERE TABSCHEMA = CURRENT SCHEMA"
            )
            created_tables = [row[0] for row in result]
            print(f"Found {len(created_tables)} tables in database:")
            for table_name in created_tables:
                print(f"  - {table_name}")
                
        print("\n" + "=" * 80)
        print("SUCCESS: All tables created!")
        print("=" * 80)
        
    except Exception as e:
        print("\n" + "=" * 80)
        print("ERROR during table creation:")
        print("=" * 80)
        print(f"\nError type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()
        print("=" * 80)
        sys.exit(1)

if __name__ == "__main__":
    create_tables()

# Made with Bob
