"""
Tests für den Test Data Generator
Validiert die Generierung von Testdaten für alle Komponenten
"""

from datetime import datetime
from test_data_generator import TestDataGenerator


def test_generate_locations():
    """Test: Generierung von 10 Locations"""
    locations = TestDataGenerator.generate_locations()
    
    assert len(locations) == 10, "Es sollten genau 10 Locations generiert werden"
    
    # Prüfe erste Location
    assert locations[0]["name"] == "Hauptküche"
    assert locations[0]["description"] is not None
    assert "image_path" in locations[0]
    
    # Prüfe dass alle Namen eindeutig sind
    names = [loc["name"] for loc in locations]
    assert len(names) == len(set(names)), "Alle Location-Namen sollten eindeutig sein"
    
    print("✓ Location-Generierung erfolgreich")


def test_generate_tools():
    """Test: Generierung von 10 Tools"""
    location_ids = list(range(1, 11))  # IDs 1-10
    tools = TestDataGenerator.generate_tools(location_ids)
    
    assert len(tools) == 10, "Es sollten genau 10 Tools generiert werden"
    
    # Prüfe erste Tool
    assert tools[0]["name"] == "Profi-Kochmesser"
    assert tools[0]["location_id"] in location_ids
    assert tools[0]["storage_location"] is not None
    
    # Prüfe dass alle Namen eindeutig sind
    names = [tool["name"] for tool in tools]
    assert len(names) == len(set(names)), "Alle Tool-Namen sollten eindeutig sein"
    
    print("✓ Tool-Generierung erfolgreich")


def test_generate_tools_insufficient_locations():
    """Test: Tools-Generierung mit zu wenig Location-IDs"""
    try:
        TestDataGenerator.generate_tools([1, 2, 3])  # Nur 3 IDs
        assert False, "Sollte ValueError werfen"
    except ValueError as e:
        assert "Mindestens 10 Location-IDs erforderlich" in str(e)
        print("✓ Fehlerbehandlung für zu wenig Location-IDs funktioniert")


def test_generate_events():
    """Test: Generierung von 10 Events"""
    events = TestDataGenerator.generate_events()
    
    assert len(events) == 10, "Es sollten genau 10 Events generiert werden"
    
    # Prüfe erste Event
    assert events[0]["name"] == "Italienischer Abend"
    assert events[0]["theme"] is not None
    assert "event_date" in events[0]
    assert "participants" in events[0]
    assert "courses" in events[0]
    
    # Prüfe Event-Datum Format
    event_date = datetime.fromisoformat(events[0]["event_date"])
    assert event_date > datetime.now(), "Event-Datum sollte in der Zukunft liegen"
    
    # Prüfe Participants
    assert len(events[0]["participants"]) > 0, "Event sollte Teilnehmer haben"
    assert "name" in events[0]["participants"][0]
    
    # Prüfe Courses
    assert len(events[0]["courses"]) > 0, "Event sollte Gänge haben"
    assert events[0]["courses"][0]["course_number"] == 1
    
    print("✓ Event-Generierung erfolgreich")


def test_generate_recipes():
    """Test: Generierung von 10 Recipes"""
    recipes = TestDataGenerator.generate_recipes()
    
    assert len(recipes) == 10, "Es sollten genau 10 Recipes generiert werden"
    
    # Prüfe erste Recipe
    assert recipes[0]["name"] == "Spaghetti Carbonara"
    assert recipes[0]["preparation_time"] == "0:15"
    assert recipes[0]["cooking_time"] == "0:20"
    assert "categories" in recipes[0]
    assert "ingredients" in recipes[0]
    assert "steps" in recipes[0]
    
    # Prüfe Ingredients
    ingredients = recipes[0]["ingredients"]
    assert len(ingredients) > 0, "Recipe sollte Zutaten haben"
    assert "name" in ingredients[0]
    assert "amount" in ingredients[0]
    assert "unit" in ingredients[0]
    assert ingredients[0]["order_index"] == 0
    
    # Prüfe Steps
    steps = recipes[0]["steps"]
    assert len(steps) > 0, "Recipe sollte Schritte haben"
    assert steps[0]["step_number"] == 1
    assert "content" in steps[0]
    
    # Prüfe Zeit-Format
    prep_time = recipes[0]["preparation_time"]
    cook_time = recipes[0]["cooking_time"]
    assert ":" in prep_time, "Preparation time sollte Format H:MM haben"
    assert ":" in cook_time, "Cooking time sollte Format H:MM haben"
    
    print("✓ Recipe-Generierung erfolgreich")


def test_generate_guests():
    """Test: Generierung von 10 Guests"""
    guests = TestDataGenerator.generate_guests()
    
    assert len(guests) == 10, "Es sollten genau 10 Guests generiert werden"
    
    # Prüfe erste Guest
    assert guests[0]["first_name"] == "Anna"
    assert guests[0]["last_name"] == "Schmidt"
    assert guests[0]["email"] == "anna.schmidt@example.com"
    assert guests[0]["phone"] is not None
    assert guests[0]["city"] is not None
    
    # Prüfe E-Mail Format
    for guest in guests:
        if guest["email"]:
            assert "@" in guest["email"], f"E-Mail {guest['email']} sollte @ enthalten"
            assert "." in guest["email"], f"E-Mail {guest['email']} sollte . enthalten"
    
    # Prüfe dass alle E-Mails eindeutig sind
    emails = [guest["email"] for guest in guests if guest["email"]]
    assert len(emails) == len(set(emails)), "Alle E-Mail-Adressen sollten eindeutig sein"
    
    print("✓ Guest-Generierung erfolgreich")


def test_data_consistency():
    """Test: Konsistenz der generierten Daten"""
    # Mehrfache Generierung sollte identische Daten liefern
    locations1 = TestDataGenerator.generate_locations()
    locations2 = TestDataGenerator.generate_locations()
    
    assert locations1 == locations2, "Generierte Daten sollten konsistent sein"
    
    events1 = TestDataGenerator.generate_events()
    events2 = TestDataGenerator.generate_events()
    
    # Events haben Zeitstempel, daher prüfen wir nur Namen
    names1 = [event["name"] for event in events1]
    names2 = [event["name"] for event in events2]
    assert names1 == names2, "Event-Namen sollten konsistent sein"
    
    print("✓ Daten-Konsistenz erfolgreich")


def run_all_tests():
    """Führt alle Tests aus"""
    print("=== Test Data Generator Tests ===\n")
    
    try:
        test_generate_locations()
        test_generate_tools()
        test_generate_tools_insufficient_locations()
        test_generate_events()
        test_generate_recipes()
        test_generate_guests()
        test_data_consistency()
        
        print("\n🎉 Alle Tests erfolgreich!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test fehlgeschlagen: {e}")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)

# Made with Bob
