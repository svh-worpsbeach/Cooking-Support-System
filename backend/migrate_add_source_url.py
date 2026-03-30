"""
Migration script to add source_url column to recipes table.
Run this script to update existing database schema.
"""

from sqlalchemy import create_engine, text
from app.config import settings

def migrate():
    """Add source_url column to recipes table"""
    
    # Get database URL from settings
    db_url = settings.get_database_url()
    engine = create_engine(db_url, **settings.get_engine_kwargs())
    
    print(f"Connecting to database: {settings.DATABASE_TYPE}")
    
    try:
        with engine.connect() as conn:
            # Check if column already exists
            if settings.DATABASE_TYPE == "sqlite":
                # SQLite: Check using pragma
                result = conn.execute(text("PRAGMA table_info(recipes)"))
                columns = [row[1] for row in result]
                
                if 'source_url' not in columns:
                    print("Adding source_url column to recipes table...")
                    conn.execute(text("""
                        ALTER TABLE recipes 
                        ADD COLUMN source_url VARCHAR(500)
                    """))
                    conn.commit()
                    print("✓ Column added successfully")
                else:
                    print("✓ Column already exists")
                    
            elif settings.DATABASE_TYPE == "postgresql":
                # PostgreSQL: Check using information_schema
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='recipes' AND column_name='source_url'
                """))
                
                if result.rowcount == 0:
                    print("Adding source_url column to recipes table...")
                    conn.execute(text("""
                        ALTER TABLE recipes 
                        ADD COLUMN source_url VARCHAR(500)
                    """))
                    conn.commit()
                    print("✓ Column added successfully")
                else:
                    print("✓ Column already exists")
                    
            elif settings.DATABASE_TYPE == "db2":
                # DB2: Check using syscat.columns
                result = conn.execute(text("""
                    SELECT colname 
                    FROM syscat.columns 
                    WHERE tabname='RECIPES' AND colname='SOURCE_URL'
                """))
                
                if result.rowcount == 0:
                    print("Adding source_url column to recipes table...")
                    conn.execute(text("""
                        ALTER TABLE recipes 
                        ADD COLUMN source_url VARCHAR(500)
                    """))
                    conn.commit()
                    print("✓ Column added successfully")
                else:
                    print("✓ Column already exists")
                    
            else:
                print(f"Unsupported database type: {settings.DATABASE_TYPE}")
                return False
                
        print("\n✓ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n✗ Migration failed: {str(e)}")
        return False
    finally:
        engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("Recipe Source URL Migration")
    print("=" * 60)
    print()
    
    success = migrate()
    
    if not success:
        exit(1)

# Made with Bob