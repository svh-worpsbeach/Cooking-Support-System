"""
Migration script to add guests table and event_guests association table
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect, MetaData, Table, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import get_settings

def get_db_type(database_url: str) -> str:
    """Determine database type from URL"""
    if database_url.startswith('sqlite'):
        return 'sqlite'
    elif database_url.startswith('postgresql'):
        return 'postgresql'
    elif 'db2' in database_url.lower() or database_url.startswith('ibm_db_sa'):
        return 'db2'
    elif database_url.startswith('mysql'):
        return 'mysql'
    else:
        return 'unknown'

def migrate():
    settings = get_settings()
    engine = create_engine(settings.database_url)
    db_type = get_db_type(settings.database_url)
    
    print(f"Detected database type: {db_type}")
    print(f"Database URL: {settings.database_url}")
    
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    with engine.begin() as conn:
        # Check if guests table exists
        if 'guests' not in existing_tables:
            print("Creating guests table...")
            
            if db_type == 'sqlite':
                conn.execute(text("""
                    CREATE TABLE guests (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(200) NOT NULL,
                        email VARCHAR(200),
                        phone VARCHAR(50),
                        address_street VARCHAR(200),
                        address_city VARCHAR(100),
                        address_postal_code VARCHAR(20),
                        address_country VARCHAR(100),
                        intolerances TEXT,
                        favorites TEXT,
                        dietary_notes TEXT,
                        image_path VARCHAR(500),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
            
            elif db_type == 'postgresql':
                conn.execute(text("""
                    CREATE TABLE guests (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(200) NOT NULL,
                        email VARCHAR(200),
                        phone VARCHAR(50),
                        address_street VARCHAR(200),
                        address_city VARCHAR(100),
                        address_postal_code VARCHAR(20),
                        address_country VARCHAR(100),
                        intolerances TEXT,
                        favorites TEXT,
                        dietary_notes TEXT,
                        image_path VARCHAR(500),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    )
                """))
            
            elif db_type == 'db2':
                conn.execute(text("""
                    CREATE TABLE guests (
                        id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
                        name VARCHAR(200) NOT NULL,
                        email VARCHAR(200),
                        phone VARCHAR(50),
                        address_street VARCHAR(200),
                        address_city VARCHAR(100),
                        address_postal_code VARCHAR(20),
                        address_country VARCHAR(100),
                        intolerances CLOB,
                        favorites CLOB,
                        dietary_notes CLOB,
                        image_path VARCHAR(500),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (id)
                    )
                """))
            
            elif db_type == 'mysql':
                conn.execute(text("""
                    CREATE TABLE guests (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(200) NOT NULL,
                        email VARCHAR(200),
                        phone VARCHAR(50),
                        address_street VARCHAR(200),
                        address_city VARCHAR(100),
                        address_postal_code VARCHAR(20),
                        address_country VARCHAR(100),
                        intolerances TEXT,
                        favorites TEXT,
                        dietary_notes TEXT,
                        image_path VARCHAR(500),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """))
            
            print("✓ guests table created successfully")
        else:
            print("✓ guests table already exists")
        
        # Check if event_guests association table exists
        if 'event_guests' not in existing_tables:
            print("Creating event_guests association table...")
            
            if db_type == 'sqlite':
                conn.execute(text("""
                    CREATE TABLE event_guests (
                        event_id INTEGER NOT NULL,
                        guest_id INTEGER NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (event_id, guest_id),
                        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
                    )
                """))
            
            elif db_type == 'postgresql':
                conn.execute(text("""
                    CREATE TABLE event_guests (
                        event_id INTEGER NOT NULL,
                        guest_id INTEGER NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (event_id, guest_id),
                        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
                    )
                """))
            
            elif db_type == 'db2':
                conn.execute(text("""
                    CREATE TABLE event_guests (
                        event_id INTEGER NOT NULL,
                        guest_id INTEGER NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (event_id, guest_id),
                        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
                    )
                """))
            
            elif db_type == 'mysql':
                conn.execute(text("""
                    CREATE TABLE event_guests (
                        event_id INT NOT NULL,
                        guest_id INT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (event_id, guest_id),
                        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
                    )
                """))
            
            print("✓ event_guests association table created successfully")
        else:
            print("✓ event_guests association table already exists")
    
    print("\n✓ Migration completed successfully!")

if __name__ == "__main__":
    migrate()

# Made with Bob
