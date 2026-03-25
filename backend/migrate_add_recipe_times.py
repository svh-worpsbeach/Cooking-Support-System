"""
Migration script to add preparation_time and cooking_time columns to recipes table.
Run this script to update the database schema.
"""

import sqlite3
import os

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), "cooking_system.db")


def migrate():
    """Add preparation_time and cooking_time columns to recipes table."""
    
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(recipes)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "preparation_time" in columns and "cooking_time" in columns:
            print("Migration already applied: preparation_time and cooking_time columns already exist.")
            return True
        
        # Add preparation_time column if it doesn't exist
        if "preparation_time" not in columns:
            print("Adding preparation_time column...")
            cursor.execute("""
                ALTER TABLE recipes 
                ADD COLUMN preparation_time TEXT NOT NULL DEFAULT '0:00'
            """)
            print("✓ preparation_time column added successfully")
        
        # Add cooking_time column if it doesn't exist
        if "cooking_time" not in columns:
            print("Adding cooking_time column...")
            cursor.execute("""
                ALTER TABLE recipes 
                ADD COLUMN cooking_time TEXT NOT NULL DEFAULT '0:00'
            """)
            print("✓ cooking_time column added successfully")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        print("All existing recipes now have default times of '0:00' for both preparation and cooking.")
        return True
        
    except sqlite3.Error as e:
        print(f"Error during migration: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Recipe Times Migration Script")
    print("=" * 60)
    print(f"Database: {DB_PATH}")
    print()
    
    success = migrate()
    
    if success:
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Migration failed!")
        print("=" * 60)
        exit(1)

# Made with Bob