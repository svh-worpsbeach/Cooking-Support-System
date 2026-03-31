"""
Migration script to fix image filepaths in database.
Adds /uploads/ prefix to all image paths that don't have it.
"""

import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import settings
sys.path.insert(0, '.')
from app.config import settings

def migrate_image_paths():
    """Fix image paths by adding /uploads/ prefix if missing."""
    
    print("=" * 80)
    print("IMAGE PATH MIGRATION")
    print("=" * 80)
    
    # Get database URL
    database_url = settings.get_database_url()
    print(f"Database: {settings.database_type}")
    print(f"URL: {database_url}")
    
    # Create engine
    engine = create_engine(database_url, **settings.get_engine_kwargs())
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Get all recipe images
        print("\nFetching recipe images...")
        result = session.execute(text("SELECT id, filepath FROM recipe_images"))
        images = result.fetchall()
        print(f"Found {len(images)} images")
        
        updated_count = 0
        for image_id, filepath in images:
            # Check if filepath needs updating (doesn't start with /uploads/)
            if filepath and not filepath.startswith('/uploads/'):
                new_filepath = f"/uploads/{filepath}"
                print(f"  Updating image {image_id}:")
                print(f"    Old: {filepath}")
                print(f"    New: {new_filepath}")
                
                session.execute(
                    text("UPDATE recipe_images SET filepath = :new_path WHERE id = :id"),
                    {"new_path": new_filepath, "id": image_id}
                )
                updated_count += 1
        
        # Commit changes
        if updated_count > 0:
            session.commit()
            print(f"\n✓ Updated {updated_count} image paths")
        else:
            print("\n✓ No images needed updating")
        
        print("=" * 80)
        print("MIGRATION COMPLETE")
        print("=" * 80)
        
    except Exception as e:
        session.rollback()
        print(f"\n✗ ERROR: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    migrate_image_paths()

# Made with Bob
