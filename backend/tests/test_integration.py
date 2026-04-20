"""
Integrations-Test für Test Data Generator
Testet das Einfügen von generierten Testdaten in die Datenbank
"""

import sys
import os

# Füge das Backend-Verzeichnis zum Python-Pfad hinzu
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.location import Location
from app.models.tool import CookingTool
from app.models.event import Event, EventParticipant, EventCourse
from app.models.recipe import Recipe, RecipeCategory, RecipeIngredient, RecipeStep
from app.models.guest import Guest
from test_data_generator import TestDataGenerator


# Erstelle Test-Datenbank im Speicher
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def setup_database():
    """Erstellt alle Tabellen in der Test-Datenbank"""
    Base.metadata.create_all(bind=engine)
    print("✓ Test-Datenbank erstellt")


def test_insert_locations():
    """Test: Locations in Datenbank einfügen"""
    db = TestSessionLocal()
    
    try:
        # Generiere Testdaten
        location_data = TestDataGenerator.generate_locations()
        
        # Füge in Datenbank ein
        locations = []
        for data in location_data:
            location = Location(**data)
            db.add(location)
            locations.append(location)
        
        db.commit()
        
        # Validiere
        db_locations = db.query(Location).all()
        assert len(db_locations) == 10, f"Erwartet 10 Locations, gefunden {len(db_locations)}"
        assert db_locations[0].name == "Hauptküche"
        
        print(f"✓ {len(db_locations)} Locations erfolgreich eingefügt")
        return [loc.id for loc in db_locations]
        
    finally:
        db.close()


def test_insert_tools(location_ids):
    """Test: Tools in Datenbank einfügen"""
    db = TestSessionLocal()
    
    try:
        # Generiere Testdaten
        tool_data = TestDataGenerator.generate_tools(location_ids)
        
        # Füge in Datenbank ein
        tools = []
        for data in tool_data:
            tool = CookingTool(**data)
            db.add(tool)
            tools.append(tool)
        
        db.commit()
        
        # Validiere
        db_tools = db.query(CookingTool).all()
        assert len(db_tools) == 10, f"Erwartet 10 Tools, gefunden {len(db_tools)}"
        assert db_tools[0].name == "Profi-Kochmesser"
        
        # Prüfe Beziehungen
        first_tool = db_tools[0]
        assert first_tool.location is not None, "Tool sollte Location-Beziehung haben"
        assert first_tool.location.name == "Hauptküche"
        
        print(f"✓ {len(db_tools)} Tools erfolgreich eingefügt")
        print(f"  - Tool '{first_tool.name}' ist in Location '{first_tool.location.name}'")
        
    finally:
        db.close()


def test_insert_events():
    """Test: Events in Datenbank einfügen"""
    db = TestSessionLocal()
    
    try:
        # Generiere Testdaten
        event_data = TestDataGenerator.generate_events()
        
        # Füge in Datenbank ein
        events = []
        for data in event_data:
            # Extrahiere Participants und Courses
            participants_data = data.pop("participants", [])
            courses_data = data.pop("courses", [])
            
            # Erstelle Event
            event = Event(**data)
            db.add(event)
            db.flush()  # Um ID zu erhalten
            
            # Füge Participants hinzu
            for p_data in participants_data:
                participant = EventParticipant(event_id=event.id, **p_data)
                db.add(participant)
            
            # Füge Courses hinzu
            for c_data in courses_data:
                c_data.pop("recipe_ids", [])  # Entferne recipe_ids für diesen Test
                course = EventCourse(event_id=event.id, **c_data)
                db.add(course)
            
            events.append(event)
        
        db.commit()
        
        # Validiere
        db_events = db.query(Event).all()
        assert len(db_events) == 10, f"Erwartet 10 Events, gefunden {len(db_events)}"
        assert db_events[0].name == "Italienischer Abend"
        
        # Prüfe Beziehungen
        first_event = db_events[0]
        assert len(first_event.participants) > 0, "Event sollte Participants haben"
        assert len(first_event.courses) > 0, "Event sollte Courses haben"
        
        print(f"✓ {len(db_events)} Events erfolgreich eingefügt")
        print(f"  - Event '{first_event.name}' hat {len(first_event.participants)} Teilnehmer und {len(first_event.courses)} Gänge")
        
    finally:
        db.close()


def test_insert_recipes():
    """Test: Recipes in Datenbank einfügen"""
    db = TestSessionLocal()
    
    try:
        # Generiere Testdaten
        recipe_data = TestDataGenerator.generate_recipes()
        
        # Füge in Datenbank ein
        recipes = []
        for data in recipe_data:
            # Extrahiere Categories, Ingredients und Steps
            categories_data = data.pop("categories", [])
            ingredients_data = data.pop("ingredients", [])
            steps_data = data.pop("steps", [])
            
            # Erstelle Recipe
            recipe = Recipe(**data)
            db.add(recipe)
            db.flush()  # Um ID zu erhalten
            
            # Füge Categories hinzu
            for cat_name in categories_data:
                category = RecipeCategory(recipe_id=recipe.id, category_name=cat_name)
                db.add(category)
            
            # Füge Ingredients hinzu
            for ing_data in ingredients_data:
                ingredient = RecipeIngredient(recipe_id=recipe.id, **ing_data)
                db.add(ingredient)
            
            # Füge Steps hinzu
            for step_data in steps_data:
                step_data.pop("ingredient_ids", [])
                step_data.pop("storage_item_ids", [])
                step = RecipeStep(recipe_id=recipe.id, **step_data)
                db.add(step)
            
            recipes.append(recipe)
        
        db.commit()
        
        # Validiere
        db_recipes = db.query(Recipe).all()
        assert len(db_recipes) == 10, f"Erwartet 10 Recipes, gefunden {len(db_recipes)}"
        assert db_recipes[0].name == "Spaghetti Carbonara"
        
        # Prüfe Beziehungen
        first_recipe = db_recipes[0]
        assert len(first_recipe.categories) > 0, "Recipe sollte Categories haben"
        assert len(first_recipe.ingredients) > 0, "Recipe sollte Ingredients haben"
        assert len(first_recipe.steps) > 0, "Recipe sollte Steps haben"
        
        print(f"✓ {len(db_recipes)} Recipes erfolgreich eingefügt")
        print(f"  - Recipe '{first_recipe.name}' hat {len(first_recipe.ingredients)} Zutaten und {len(first_recipe.steps)} Schritte")
        
    finally:
        db.close()


def test_insert_guests():
    """Test: Guests in Datenbank einfügen"""
    db = TestSessionLocal()
    
    try:
        # Generiere Testdaten
        guest_data = TestDataGenerator.generate_guests()
        
        # Füge in Datenbank ein
        guests = []
        for data in guest_data:
            guest = Guest(**data)
            db.add(guest)
            guests.append(guest)
        
        db.commit()
        
        # Validiere
        db_guests = db.query(Guest).all()
        assert len(db_guests) == 10, f"Erwartet 10 Guests, gefunden {len(db_guests)}"
        assert db_guests[0].first_name == "Anna"
        assert db_guests[0].last_name == "Schmidt"
        
        print(f"✓ {len(db_guests)} Guests erfolgreich eingefügt")
        print(f"  - Guest '{db_guests[0].first_name} {db_guests[0].last_name}' aus {db_guests[0].city}")
        
    finally:
        db.close()


def test_database_statistics():
    """Test: Zeige Datenbank-Statistiken"""
    db = TestSessionLocal()
    
    try:
        location_count = db.query(Location).count()
        tool_count = db.query(CookingTool).count()
        event_count = db.query(Event).count()
        recipe_count = db.query(Recipe).count()
        guest_count = db.query(Guest).count()
        
        print("\n📊 Datenbank-Statistiken:")
        print(f"  - Locations: {location_count}")
        print(f"  - Tools: {tool_count}")
        print(f"  - Events: {event_count}")
        print(f"  - Recipes: {recipe_count}")
        print(f"  - Guests: {guest_count}")
        print(f"  - Gesamt: {location_count + tool_count + event_count + recipe_count + guest_count} Datensätze")
        
        assert location_count == 10
        assert tool_count == 10
        assert event_count == 10
        assert recipe_count == 10
        assert guest_count == 10
        
        print("✓ Alle Datensätze korrekt in Datenbank")
        
    finally:
        db.close()


def run_integration_tests():
    """Führt alle Integrations-Tests aus"""
    print("=== Backend Integrations-Tests ===\n")
    
    try:
        # Setup
        setup_database()
        
        # Tests ausführen
        location_ids = test_insert_locations()
        test_insert_tools(location_ids)
        test_insert_events()
        test_insert_recipes()
        test_insert_guests()
        test_database_statistics()
        
        print("\n🎉 Alle Integrations-Tests erfolgreich!")
        print("✅ Test Data Generator funktioniert korrekt mit der Datenbank")
        return True
        
    except Exception as e:
        print(f"\n❌ Test fehlgeschlagen: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_integration_tests()
    exit(0 if success else 1)

# Made with Bob
