# Test Data Generator - Dokumentation

## Übersicht

Dieses Dokument beschreibt die Test Data Generators für automatisierte Tests im Cooking Management System. Die Generatoren erstellen konsistente Testdaten für Backend- und Frontend-Tests.

## Komponenten

Die Test Data Generators erstellen jeweils **10 Testdatensätze** für folgende Komponenten:

1. **Locations** - Lagerorte für Tools und Storage Items
2. **Tools** - Kochutensilien und Werkzeuge
3. **Events** - Koch-Events und Veranstaltungen
4. **Recipes** - Rezepte mit Zutaten und Schritten
5. **Guests** - Gäste mit Kontaktdaten und Ernährungspräferenzen

## Backend Test Data Generator

### Datei
`backend/tests/test_data_generator.py`

### Verwendung

```python
from tests.test_data_generator import TestDataGenerator

# Locations generieren
locations = TestDataGenerator.generate_locations()
# Gibt 10 Location-Dictionaries zurück

# Tools generieren (benötigt Location-IDs)
location_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
tools = TestDataGenerator.generate_tools(location_ids)
# Gibt 10 Tool-Dictionaries zurück

# Events generieren
events = TestDataGenerator.generate_events()
# Gibt 10 Event-Dictionaries mit Participants und Courses zurück

# Recipes generieren
recipes = TestDataGenerator.generate_recipes()
# Gibt 10 Recipe-Dictionaries mit Ingredients und Steps zurück

# Guests generieren
guests = TestDataGenerator.generate_guests()
# Gibt 10 Guest-Dictionaries zurück
```

### Beispiel: Integration in pytest

```python
import pytest
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.location import Location
from tests.test_data_generator import TestDataGenerator

@pytest.fixture
def test_locations(db: Session):
    """Fixture zum Erstellen von Test-Locations"""
    location_data = TestDataGenerator.generate_locations()
    locations = []
    
    for data in location_data:
        location = Location(**data)
        db.add(location)
        locations.append(location)
    
    db.commit()
    return locations

def test_create_locations(test_locations):
    """Test zum Überprüfen der Location-Erstellung"""
    assert len(test_locations) == 10
    assert test_locations[0].name == "Hauptküche"
```

### Datenstruktur

#### Locations
```python
{
    "name": str,              # Eindeutiger Name
    "description": str,       # Beschreibung
    "image_path": None        # Bildpfad (optional)
}
```

#### Tools
```python
{
    "name": str,              # Tool-Name
    "description": str,       # Beschreibung
    "location_id": int,       # Zugeordnete Location-ID
    "storage_location": str,  # Spezifischer Lagerort
    "image_path": None        # Bildpfad (optional)
}
```

#### Events
```python
{
    "name": str,              # Event-Name
    "description": str,       # Beschreibung
    "theme": str,             # Thema/Motto
    "event_date": str,        # ISO-Format Datum
    "participants": [         # Liste von Teilnehmern
        {
            "name": str,
            "dietary_restrictions": str | None
        }
    ],
    "courses": [              # Liste von Gängen
        {
            "course_number": int,
            "course_name": str,
            "recipe_ids": []
        }
    ]
}
```

#### Recipes
```python
{
    "name": str,              # Rezeptname
    "description": str,       # Beschreibung
    "preparation_time": str,  # Format "H:MM"
    "cooking_time": str,      # Format "H:MM"
    "categories": [str],      # Liste von Kategorien
    "ingredients": [          # Liste von Zutaten
        {
            "name": str,
            "description": str | None,
            "amount": float,
            "unit": str,
            "order_index": int
        }
    ],
    "steps": [                # Liste von Schritten
        {
            "step_number": int,
            "content": str,
            "ingredient_ids": [],
            "storage_item_ids": []
        }
    ]
}
```

#### Guests
```python
{
    "first_name": str,        # Vorname
    "last_name": str,         # Nachname
    "email": str,             # E-Mail
    "phone": str,             # Telefon
    "street": str,            # Straße
    "city": str,              # Stadt
    "postal_code": str,       # PLZ
    "country": str,           # Land
    "intolerances": str | None,  # Unverträglichkeiten
    "favorites": str,         # Lieblingsgerichte
    "dietary_notes": str,     # Ernährungshinweise
    "image_path": None        # Bildpfad (optional)
}
```

## Frontend Test Data Generator

### Datei
`frontend/src/tests/testDataGenerator.ts`

### Verwendung

```typescript
import { TestDataGenerator } from './tests/testDataGenerator';

// Locations generieren
const locations = TestDataGenerator.generateLocations();
// Gibt Array mit 10 Location-Objekten zurück

// Tools generieren (benötigt Location-IDs)
const locationIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const tools = TestDataGenerator.generateTools(locationIds);
// Gibt Array mit 10 Tool-Objekten zurück

// Events generieren
const events = TestDataGenerator.generateEvents();
// Gibt Array mit 10 Event-Objekten zurück

// Recipes generieren (vereinfacht)
const recipes = TestDataGenerator.generateRecipes();
// Gibt Array mit 10 Recipe-Objekten zurück

// Guests generieren
const guests = TestDataGenerator.generateGuests();
// Gibt Array mit 10 Guest-Objekten zurück
```

### Beispiel: Integration in Vitest/Jest

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataGenerator } from './tests/testDataGenerator';
import { api } from './services/api';

describe('Location Tests', () => {
  let testLocations: any[];

  beforeEach(async () => {
    // Testdaten generieren
    const locationData = TestDataGenerator.generateLocations();
    
    // Locations über API erstellen
    testLocations = [];
    for (const data of locationData) {
      const response = await api.post('/locations', data);
      testLocations.push(response.data);
    }
  });

  it('should create 10 locations', () => {
    expect(testLocations).toHaveLength(10);
  });

  it('first location should be Hauptküche', () => {
    expect(testLocations[0].name).toBe('Hauptküche');
  });
});
```

### Beispiel: Mock-Daten für Komponententests

```typescript
import { render, screen } from '@testing-library/react';
import { TestDataGenerator } from './tests/testDataGenerator';
import LocationList from './components/LocationList';

describe('LocationList Component', () => {
  it('renders all locations', () => {
    const mockLocations = TestDataGenerator.generateLocations();
    
    render(<LocationList locations={mockLocations} />);
    
    expect(screen.getByText('Hauptküche')).toBeInTheDocument();
    expect(screen.getByText('Vorratsraum')).toBeInTheDocument();
  });
});
```

## Testdaten-Charakteristiken

### Locations (10 Items)
- Hauptküche, Vorratsraum, Kühlschrank, Gefrierschrank
- Gewürzschrank, Backstation, Grillbereich, Weinkeller
- Kräutergarten, Speisekammer

### Tools (10 Items)
- Profi-Kochmesser, Gusseiserne Pfanne, KitchenAid Küchenmaschine
- Digitales Küchenthermometer, Springform-Set, Standmixer
- Grillzange, Nudelmaschine, Mörser und Stößel, Sous-Vide Stick

### Events (10 Items)
- Verschiedene Küchenstile: Italienisch, Japanisch, Amerikanisch, Französisch
- Spezielle Themen: Vegan, Tapas, Thai, Weihnachten, Brunch, Indisch
- Events verteilt über 70 Tage in die Zukunft

### Recipes (10 Items)
- Spaghetti Carbonara, Rindersteak mit Kräuterbutter, Gemüse-Curry
- Schokoladen-Lava-Kuchen, Caesar Salad, Pad Thai
- Risotto ai Funghi, Tiramisu, Pulled Pork Burger, Gazpacho
- Verschiedene Kategorien: Pasta, Fleisch, Vegan, Dessert, Salat

### Guests (10 Items)
- Deutsche Namen und Adressen
- Verschiedene Städte: Berlin, München, Hamburg, Frankfurt, etc.
- Unterschiedliche Ernährungspräferenzen und Unverträglichkeiten
- Realistische E-Mail-Adressen und Telefonnummern

## Best Practices

### 1. Konsistenz
- Verwenden Sie immer die gleichen Testdaten für reproduzierbare Tests
- Die Generatoren liefern deterministisch die gleichen Daten

### 2. Isolation
- Erstellen Sie Testdaten in Fixtures/beforeEach
- Bereinigen Sie Testdaten nach jedem Test

### 3. Abhängigkeiten
- Tools benötigen Location-IDs
- Beachten Sie die Reihenfolge beim Erstellen von abhängigen Daten

### 4. Anpassung
- Die Generatoren können erweitert werden
- Fügen Sie bei Bedarf weitere Testdaten hinzu

## Beispiel: Vollständiger Integrations-Test

### Backend (Python/pytest)

```python
import pytest
from sqlalchemy.orm import Session
from tests.test_data_generator import TestDataGenerator
from app.models.location import Location
from app.models.tool import CookingTool

@pytest.fixture
def setup_test_data(db: Session):
    """Erstellt vollständige Testdaten"""
    # Locations erstellen
    location_data = TestDataGenerator.generate_locations()
    locations = []
    for data in location_data:
        location = Location(**data)
        db.add(location)
        locations.append(location)
    db.commit()
    
    # Location-IDs sammeln
    location_ids = [loc.id for loc in locations]
    
    # Tools erstellen
    tool_data = TestDataGenerator.generate_tools(location_ids)
    tools = []
    for data in tool_data:
        tool = CookingTool(**data)
        db.add(tool)
        tools.append(tool)
    db.commit()
    
    return {"locations": locations, "tools": tools}

def test_full_workflow(setup_test_data):
    """Test des vollständigen Workflows"""
    locations = setup_test_data["locations"]
    tools = setup_test_data["tools"]
    
    assert len(locations) == 10
    assert len(tools) == 10
    assert tools[0].location_id == locations[0].id
```

### Frontend (TypeScript/Vitest)

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { TestDataGenerator } from './tests/testDataGenerator';
import { api } from './services/api';

describe('Full Integration Test', () => {
  let locationIds: number[];
  let toolIds: number[];

  beforeAll(async () => {
    // Locations erstellen
    const locations = TestDataGenerator.generateLocations();
    const createdLocations = await Promise.all(
      locations.map(loc => api.post('/locations', loc))
    );
    locationIds = createdLocations.map(res => res.data.id);

    // Tools erstellen
    const tools = TestDataGenerator.generateTools(locationIds);
    const createdTools = await Promise.all(
      tools.map(tool => api.post('/tools', tool))
    );
    toolIds = createdTools.map(res => res.data.id);
  });

  it('should have created all test data', () => {
    expect(locationIds).toHaveLength(10);
    expect(toolIds).toHaveLength(10);
  });

  it('tools should reference correct locations', async () => {
    const tool = await api.get(`/tools/${toolIds[0]}`);
    expect(locationIds).toContain(tool.data.location_id);
  });
});
```

## Wartung

### Aktualisierung der Testdaten
Wenn neue Felder zu den Modellen hinzugefügt werden:

1. Aktualisieren Sie die entsprechende `generate_*` Methode
2. Fügen Sie die neuen Felder zu allen 10 Testdatensätzen hinzu
3. Aktualisieren Sie diese Dokumentation

### Erweiterung
Um neue Komponenten hinzuzufügen:

1. Erstellen Sie eine neue `generate_*` Methode in beiden Generatoren
2. Generieren Sie 10 konsistente Testdatensätze
3. Dokumentieren Sie die Datenstruktur hier

## Fehlerbehebung

### "Mindestens 10 Location-IDs erforderlich"
- Stellen Sie sicher, dass Sie zuerst Locations erstellen
- Übergeben Sie die korrekten IDs an `generate_tools()`

### Datenbankfehler bei Tests
- Verwenden Sie Transaktionen oder bereinigen Sie die Datenbank nach Tests
- Nutzen Sie pytest Fixtures mit `scope="function"` für Isolation

### TypeScript-Typfehler
- Die Frontend-Version ist vereinfacht
- Passen Sie die Typen an Ihre `types/index.ts` an

## Zusammenfassung

Die Test Data Generators bieten:
- ✅ **10 konsistente Testdatensätze** pro Komponente
- ✅ **Backend und Frontend** Unterstützung
- ✅ **Realistische Daten** für aussagekräftige Tests
- ✅ **Einfache Integration** in bestehende Test-Frameworks
- ✅ **Wartbare Struktur** für zukünftige Erweiterungen

Verwenden Sie diese Generatoren für Unit-Tests, Integrationstests und End-to-End-Tests, um konsistente und reproduzierbare Testergebnisse zu gewährleisten.