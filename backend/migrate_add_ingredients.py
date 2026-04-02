#!/usr/bin/env python3
"""
Migration script to add the ingredients master table.

This script creates the ingredients table for the ingredient catalog feature.
Run this after updating the codebase to add ingredient master functionality.

Usage:
    python migrate_add_ingredients.py
"""

import sys
from sqlalchemy import text
from app.database import engine, Base
from app.models.ingredient import Ingredient

def run_migration():
    """Run the migration to add ingredients table."""
    print("=" * 80)
    print("MIGRATION: Add Ingredients Master Table")
    print("=" * 80)
    
    try:
        # Create the ingredients table
        print("\n1. Creating ingredients table...")
        Base.metadata.create_all(bind=engine, tables=[Ingredient.__table__])
        print("   ✓ Ingredients table created successfully")
        
        # Verify table was created
        print("\n2. Verifying table creation...")
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients'"
            ))
            if result.fetchone():
                print("   ✓ Table 'ingredients' exists")
            else:
                print("   ✗ Table 'ingredients' not found!")
                return False
        
        # Optional: Add some common ingredients
        print("\n3. Adding common ingredients (optional)...")
        from sqlalchemy.orm import Session
        
        common_ingredients = [
            {"name": "Salz", "default_shop": "Supermarkt", "default_unit": "g"},
            {"name": "Pfeffer", "default_shop": "Supermarkt", "default_unit": "g"},
            {"name": "Olivenöl", "default_shop": "Supermarkt", "default_unit": "ml"},
            {"name": "Butter", "default_shop": "Supermarkt", "default_unit": "g"},
            {"name": "Mehl", "default_shop": "Supermarkt", "default_unit": "g"},
            {"name": "Zucker", "default_shop": "Supermarkt", "default_unit": "g"},
            {"name": "Eier", "default_shop": "Supermarkt", "default_unit": "Stück"},
            {"name": "Milch", "default_shop": "Supermarkt", "default_unit": "ml"},
            {"name": "Zwiebeln", "default_shop": "Gemüseladen", "default_unit": "Stück"},
            {"name": "Knoblauch", "default_shop": "Gemüseladen", "default_unit": "Zehen"},
            {"name": "Tomaten", "default_shop": "Gemüseladen", "default_unit": "g"},
            {"name": "Kartoffeln", "default_shop": "Gemüseladen", "default_unit": "g"},
        ]
        
        with Session(engine) as session:
            for ing_data in common_ingredients:
                # Check if ingredient already exists
                existing = session.query(Ingredient).filter(
                    Ingredient.name == ing_data["name"]
                ).first()
                
                if not existing:
                    ingredient = Ingredient(**ing_data)
                    session.add(ingredient)
                    print(f"   + Added: {ing_data['name']}")
                else:
                    print(f"   - Skipped (exists): {ing_data['name']}")
            
            session.commit()
        
        print("\n" + "=" * 80)
        print("MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 80)
        print("\nNext steps:")
        print("1. Restart the backend server")
        print("2. The /api/ingredients endpoints are now available")
        print("3. You can start using the ingredient master catalog")
        
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR during migration: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

# Made with Bob