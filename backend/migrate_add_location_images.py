#!/usr/bin/env python3
"""
Migration script to add image_path column to locations table.
This script adds support for location images.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import engine
from app.config import settings

def migrate():
    """Add image_path column to locations table."""
    
    print("=" * 80)
    print("MIGRATION: Add image_path to locations table")
    print("=" * 80)
    print(f"Database: {settings.database_type}")
    print(f"URL: {settings.get_database_url()}")
    print()
    
    with engine.connect() as conn:
        # Check if column already exists
        if settings.database_type == "postgresql":
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='locations' AND column_name='image_path'
            """))
            exists = result.fetchone() is not None
        elif settings.database_type == "sqlite":
            result = conn.execute(text("PRAGMA table_info(locations)"))
            columns = [row[1] for row in result.fetchall()]
            exists = 'image_path' in columns
        elif settings.database_type == "db2":
            result = conn.execute(text("""
                SELECT COLNAME 
                FROM SYSCAT.COLUMNS 
                WHERE TABNAME='LOCATIONS' AND COLNAME='IMAGE_PATH'
            """))
            exists = result.fetchone() is not None
        elif settings.database_type == "mysql":
            result = conn.execute(text("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME='locations' AND COLUMN_NAME='image_path'
            """))
            exists = result.fetchone() is not None
        else:
            print(f"❌ Unsupported database type: {settings.database_type}")
            return False
        
        if exists:
            print("✓ Column 'image_path' already exists in locations table")
            print("✓ Migration not needed")
            return True
        
        # Add the column
        print("Adding 'image_path' column to locations table...")
        
        try:
            if settings.database_type == "db2":
                # DB2 syntax
                conn.execute(text("""
                    ALTER TABLE locations 
                    ADD COLUMN image_path VARCHAR(500)
                """))
            else:
                # PostgreSQL, SQLite, MySQL syntax
                conn.execute(text("""
                    ALTER TABLE locations 
                    ADD COLUMN image_path VARCHAR(500)
                """))
            
            conn.commit()
            print("✓ Column 'image_path' added successfully")
            print()
            print("=" * 80)
            print("✓ MIGRATION COMPLETED SUCCESSFULLY")
            print("=" * 80)
            return True
            
        except Exception as e:
            print(f"❌ Error adding column: {e}")
            conn.rollback()
            return False

if __name__ == "__main__":
    success = migrate()
    sys.exit(0 if success else 1)

# Made with Bob
