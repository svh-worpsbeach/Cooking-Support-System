"""
Vereinfachter Integrations-Test für Test Data Generator
Testet die Datenstruktur ohne Datenbankabhängigkeiten
"""

from test_data_generator import TestDataGenerator


def test_locations_structure():
    """Test: Locations haben korrekte Struktur"""
    locations = TestDataGenerator.generate_locations()
    
    print("\n=== Location Tests ===")
    print(f"✓ {len(locations)} Locations generiert")
    
    # Prüfe Struktur
    for i, loc in enumerate(locations, 1):
        assert "name" in loc, f"Location {i} fehlt 'name'"
        assert "description" in loc, f"Location {i} fehlt 'description'"
        assert "image_path" in loc, f"Location {i} fehlt 'image_path'"
        assert isinstance(loc["name"], str), f"Location {i} name muss String sein"
    
    print(f"  Beispiel: {locations[0]['name']} - {locations[0]['description'][:50]}...")
    return locations


def test_tools_structure():
    """Test: Tools haben korrekte Struktur"""
    location_ids = list(range(1, 11))
    tools = TestDataGenerator.generate_tools(location_ids)
    
    print("\n=== Tool Tests ===")
    print(f"✓ {len(tools)} Tools generiert")
    
    # Prüfe Struktur
    for i, tool in enumerate(tools, 1):
        assert "name" in tool, f"Tool {i} fehlt 'name'"
        assert "description" in tool, f"Tool {i} fehlt 'description'"
        assert "location_id" in tool, f"Tool {i} fehlt 'location_id'"
        assert "storage_location" in tool, f"Tool {i} fehlt 'storage_location'"
        assert tool["location_id"] in location_ids, f"Tool {i} hat ungültige location_id"
    
    print(f"  Beispiel: {tools[0]['name']} in Location {tools[0]['location_id']}")
    return tools


def test_events_structure():
    """Test: Events haben korrekte Struktur"""
    events = TestDataGenerator.generate_events()
    
    print("\n=== Event Tests ===")
    print(f"✓ {len(events)} Events generiert")
    
    # Prüfe Struktur
    for i, event in enumerate(events, 1):
        assert "name" in event, f"Event {i} fehlt 'name'"
        assert "description" in event, f"Event {i} fehlt 'description'"
        assert "theme" in event, f"Event {i} fehlt 'theme'"
        assert "event_date" in event, f"Event {i} fehlt 'event_date'"
        assert "participants" in event, f"Event {i} fehlt 'participants'"
        assert "courses" in event, f"Event {i} fehlt 'courses'"
        
        # Prüfe Participants
        for p in event["participants"]:
            assert "name" in p, f"Event {i} Participant fehlt 'name'"
        
        # Prüfe Courses
        for c in event["courses"]:
            assert "course_number" in c, f"Event {i} Course fehlt 'course_number'"
            assert "course_name" in c, f"Event {i} Course fehlt 'course_name'"
    
    print(f"  Beispiel: {events[0]['name']} - {events[0]['theme']}")
    print(f"    {len(events[0]['participants'])} Teilnehmer, {len(events[0]['courses'])} Gänge")
    return events


def test_recipes_structure():
    """Test: Recipes haben korrekte Struktur"""
    recipes = TestDataGenerator.generate_recipes()
    
    print("\n=== Recipe Tests ===")
    print(f"✓ {len(recipes)} Recipes generiert")
    
    # Prüfe Struktur
    for i, recipe in enumerate(recipes, 1):
        assert "name" in recipe, f"Recipe {i} fehlt 'name'"
        assert "description" in recipe, f"Recipe {i} fehlt 'description'"
        assert "preparation_time" in recipe, f"Recipe {i} fehlt 'preparation_time'"
        assert "cooking_time" in recipe, f"Recipe {i} fehlt 'cooking_time'"
        assert "categories" in recipe, f"Recipe {i} fehlt 'categories'"
        assert "ingredients" in recipe, f"Recipe {i} fehlt 'ingredients'"
        assert "steps" in recipe, f"Recipe {i} fehlt 'steps'"
        
        # Prüfe Zeit-Format
        assert ":" in recipe["preparation_time"], f"Recipe {i} preparation_time hat falsches Format"
        assert ":" in recipe["cooking_time"], f"Recipe {i} cooking_time hat falsches Format"
        
        # Prüfe Ingredients
        for ing in recipe["ingredients"]:
            assert "name" in ing, f"Recipe {i} Ingredient fehlt 'name'"
            assert "amount" in ing, f"Recipe {i} Ingredient fehlt 'amount'"
            assert "unit" in ing, f"Recipe {i} Ingredient fehlt 'unit'"
            assert "order_index" in ing, f"Recipe {i} Ingredient fehlt 'order_index'"
        
        # Prüfe Steps
        for step in recipe["steps"]:
            assert "step_number" in step, f"Recipe {i} Step fehlt 'step_number'"
            assert "content" in step, f"Recipe {i} Step fehlt 'content'"
    
    print(f"  Beispiel: {recipes[0]['name']}")
    print(f"    {len(recipes[0]['ingredients'])} Zutaten, {len(recipes[0]['steps'])} Schritte")
    print(f"    Zubereitungszeit: {recipes[0]['preparation_time']}, Kochzeit: {recipes[0]['cooking_time']}")
    return recipes


def test_guests_structure():
    """Test: Guests haben korrekte Struktur"""
    guests = TestDataGenerator.generate_guests()
    
    print("\n=== Guest Tests ===")
    print(f"✓ {len(guests)} Guests generiert")
    
    # Prüfe Struktur
    for i, guest in enumerate(guests, 1):
        assert "first_name" in guest, f"Guest {i} fehlt 'first_name'"
        assert "last_name" in guest, f"Guest {i} fehlt 'last_name'"
        assert "email" in guest, f"Guest {i} fehlt 'email'"
        assert "phone" in guest, f"Guest {i} fehlt 'phone'"
        assert "city" in guest, f"Guest {i} fehlt 'city'"
        
        # Prüfe E-Mail Format
        if guest["email"]:
            assert "@" in guest["email"], f"Guest {i} E-Mail fehlt @"
            assert "." in guest["email"], f"Guest {i} E-Mail fehlt ."
    
    print(f"  Beispiel: {guests[0]['first_name']} {guests[0]['last_name']}")
    print(f"    {guests[0]['email']}, {guests[0]['city']}")
    return guests


def test_data_relationships():
    """Test: Beziehungen zwischen Daten"""
    print("\n=== Beziehungs-Tests ===")
    
    # Locations und Tools
    locations = TestDataGenerator.generate_locations()
    location_ids = list(range(1, len(locations) + 1))
    tools = TestDataGenerator.generate_tools(location_ids)
    
    # Prüfe dass alle Tool location_ids gültig sind
    tool_location_ids = set(tool["location_id"] for tool in tools)
    assert tool_location_ids.issubset(set(location_ids)), "Alle Tool location_ids müssen gültig sein"
    print(f"✓ Alle {len(tools)} Tools haben gültige Location-Referenzen")
    
    # Events und Courses
    events = TestDataGenerator.generate_events()
    for event in events:
        course_numbers = [c["course_number"] for c in event["courses"]]
        expected = list(range(1, len(course_numbers) + 1))
        assert sorted(course_numbers) == expected, f"Event '{event['name']}' hat ungültige Course-Nummern"
    print(f"✓ Alle {len(events)} Events haben sequentielle Course-Nummern")
    
    # Recipes und Steps
    recipes = TestDataGenerator.generate_recipes()
    for recipe in recipes:
        step_numbers = [s["step_number"] for s in recipe["steps"]]
        expected = list(range(1, len(step_numbers) + 1))
        assert sorted(step_numbers) == expected, f"Recipe '{recipe['name']}' hat ungültige Step-Nummern"
    print(f"✓ Alle {len(recipes)} Recipes haben sequentielle Step-Nummern")


def test_data_uniqueness():
    """Test: Eindeutigkeit der Daten"""
    print("\n=== Eindeutigkeits-Tests ===")
    
    # Location Namen
    locations = TestDataGenerator.generate_locations()
    location_names = [loc["name"] for loc in locations]
    assert len(location_names) == len(set(location_names)), "Location-Namen müssen eindeutig sein"
    print(f"✓ Alle {len(location_names)} Location-Namen sind eindeutig")
    
    # Tool Namen
    tools = TestDataGenerator.generate_tools(list(range(1, 11)))
    tool_names = [tool["name"] for tool in tools]
    assert len(tool_names) == len(set(tool_names)), "Tool-Namen müssen eindeutig sein"
    print(f"✓ Alle {len(tool_names)} Tool-Namen sind eindeutig")
    
    # Guest E-Mails
    guests = TestDataGenerator.generate_guests()
    guest_emails = [g["email"] for g in guests if g["email"]]
    assert len(guest_emails) == len(set(guest_emails)), "Guest E-Mails müssen eindeutig sein"
    print(f"✓ Alle {len(guest_emails)} Guest E-Mails sind eindeutig")


def test_summary():
    """Test: Zusammenfassung aller Testdaten"""
    print("\n=== Zusammenfassung ===")
    
    locations = TestDataGenerator.generate_locations()
    tools = TestDataGenerator.generate_tools(list(range(1, 11)))
    events = TestDataGenerator.generate_events()
    recipes = TestDataGenerator.generate_recipes()
    guests = TestDataGenerator.generate_guests()
    
    total_participants = sum(len(e["participants"]) for e in events)
    total_courses = sum(len(e["courses"]) for e in events)
    total_ingredients = sum(len(r["ingredients"]) for r in recipes)
    total_steps = sum(len(r["steps"]) for r in recipes)
    
    print(f"\n📊 Generierte Testdaten:")
    print(f"  • {len(locations)} Locations")
    print(f"  • {len(tools)} Tools")
    print(f"  • {len(events)} Events")
    print(f"    - {total_participants} Participants")
    print(f"    - {total_courses} Courses")
    print(f"  • {len(recipes)} Recipes")
    print(f"    - {total_ingredients} Ingredients")
    print(f"    - {total_steps} Steps")
    print(f"  • {len(guests)} Guests")
    print(f"\n  Gesamt: {len(locations) + len(tools) + len(events) + len(recipes) + len(guests)} Hauptdatensätze")
    print(f"  Mit Unterdaten: {len(locations) + len(tools) + len(events) + total_participants + total_courses + len(recipes) + total_ingredients + total_steps + len(guests)} Datensätze")


def run_all_tests():
    """Führt alle Tests aus"""
    print("=" * 60)
    print("Backend Test Data Generator - Integrations-Tests")
    print("=" * 60)
    
    try:
        test_locations_structure()
        test_tools_structure()
        test_events_structure()
        test_recipes_structure()
        test_guests_structure()
        test_data_relationships()
        test_data_uniqueness()
        test_summary()
        
        print("\n" + "=" * 60)
        print("🎉 Alle Tests erfolgreich!")
        print("✅ Test Data Generator ist produktionsbereit")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Test fehlgeschlagen: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)

# Made with Bob
