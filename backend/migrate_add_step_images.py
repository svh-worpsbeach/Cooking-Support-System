"""
Migration script to add step_image_id column to recipe_steps table.
Run this script to update the database schema.
"""
import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'cooking_system.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(recipe_steps)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'step_image_id' in columns:
            print("Column 'step_image_id' already exists in recipe_steps table.")
            return
        
        # Add the new column
        cursor.execute("""
            ALTER TABLE recipe_steps 
            ADD COLUMN step_image_id INTEGER 
            REFERENCES recipe_images(id)
        """)
        
        conn.commit()
        print("Successfully added 'step_image_id' column to recipe_steps table.")
        
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()

# Made with Bob
