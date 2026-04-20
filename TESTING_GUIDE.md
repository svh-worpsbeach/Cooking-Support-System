# Testing Guide - Test Data Generator

## Schnellstart

### Backend-Tests ausführen

Es gibt drei verschiedene Test-Dateien, die Sie ausführen können:

#### 1. Basis-Tests (Empfohlen für Schnelltest)
```bash
cd backend/tests
python3 test_data_generator_test.py
```

**Was wird getestet:**
- Generierung von 10 Items pro Komponente
- Datenstruktur-Validierung
- Fehlerbehandlung
- Konsistenz der Daten

**Ausgabe:**
```
=== Test Data Generator Tests ===

✓ Location-Generierung erfolgreich
✓ Tool-Generierung erfolgreich
✓ Fehlerbehandlung für zu wenig Location-IDs funktioniert
✓ Event-Generierung erfolgreich
✓ Recipe-Generierung erfolgreich
✓ Guest-Generierung erfolgreich
✓ Daten-Konsistenz erfolgreich

🎉 Alle Tests erfolgreich!
```

#### 2. Integrations-Tests (Empfohlen für vollständige Validierung)
```bash
cd backend/tests
python3 test_simple_integration.py
```

**Was wird getestet:**
- Vollständige Datenstruktur
- Beziehungen zwischen Komponenten
- Eindeutigkeit der Daten
- Detaillierte Statistiken

**Ausgabe:**
```
============================================================
Backend Test Data Generator - Integrations-Tests
============================================================

=== Location Tests ===
✓ 10 Locations generiert
  Beispiel: Hauptküche - Die zentrale Küche...

[... weitere Tests ...]

📊 Generierte Testdaten:
  • 10 Locations
  • 10 Tools
  • 10 Events (20 Participants, 31 Courses)
  • 10 Recipes (44 Ingredients, 50 Steps)
  • 10 Guests

  Gesamt: 195 Datensätze

🎉 Alle Tests erfolgreich!
✅ Test Data Generator ist produktionsbereit
```

#### 3. Datenbank-Integrations-Tests (Erfordert Setup)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python tests/test_integration.py
```

**Hinweis:** Dieser Test benötigt eine funktionierende Datenbankverbindung.

---

## Frontend-Tests

### Verwendung im Code

```typescript
import { TestDataGenerator } from './tests/testDataGenerator';

// In Ihren Tests
const locations = TestDataGenerator.generateLocations();
const tools = TestDataGenerator.generateTools([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const events = TestDataGenerator.generateEvents();
const recipes = TestDataGenerator.generateRecipes();
const guests = TestDataGenerator.generateGuests();
```

### Mit Vitest/Jest

```typescript
import { describe, it, expect } from 'vitest';
import { TestDataGenerator } from './tests/testDataGenerator';

describe('Location Tests', () => {
  it('should generate 10 locations', () => {
    const locations = TestDataGenerator.generateLocations();
    expect(locations).toHaveLength(10);
    expect(locations[0].name).toBe('Hauptküche');
  });
});
```

**Tests ausführen:**
```bash
cd frontend
npm test
```

---

## Verwendung in eigenen Tests

### Backend (Python)

#### Beispiel 1: Einfacher Test
```python
from tests.test_data_generator import TestDataGenerator

def test_my_feature():
    # Testdaten generieren
    locations = TestDataGenerator.generate_locations()
    
    # Ihre Tests hier
    assert len(locations) == 10
    assert locations[0]["name"] == "Hauptküche"
```

#### Beispiel 2: Mit Datenbank (pytest)
```python
import pytest
from sqlalchemy.orm import Session
from app.models.location import Location
from tests.test_data_generator import TestDataGenerator

@pytest.fixture
def test_locations(db: Session):
    """Erstellt Test-Locations in der Datenbank"""
    location_data = TestDataGenerator.generate_locations()
    locations = []
    
    for data in location_data:
        location = Location(**data)
        db.add(location)
        locations.append(location)
    
    db.commit()
    return locations

def test_location_count(test_locations):
    assert len(test_locations) == 10
```

### Frontend (TypeScript)

#### Beispiel 1: Komponenten-Test
```typescript
import { render, screen } from '@testing-library/react';
import { TestDataGenerator } from './tests/testDataGenerator';
import LocationList from './components/LocationList';

describe('LocationList', () => {
  it('renders all locations', () => {
    const locations = TestDataGenerator.generateLocations();
    render(<LocationList locations={locations} />);
    
    expect(screen.getByText('Hauptküche')).toBeInTheDocument();
  });
});
```

#### Beispiel 2: API-Test
```typescript
import { TestDataGenerator } from './tests/testDataGenerator';
import { api } from './services/api';

describe('API Tests', () => {
  it('creates locations via API', async () => {
    const locationData = TestDataGenerator.generateLocations();
    
    for (const data of locationData) {
      const response = await api.post('/locations', data);
      expect(response.status).toBe(201);
    }
  });
});
```

---

## Testdaten-Übersicht

### Was wird generiert?

| Komponente | Anzahl | Enthält |
|------------|--------|---------|
| **Locations** | 10 | Name, Beschreibung |
| **Tools** | 10 | Name, Beschreibung, Location-Referenz, Lagerort |
| **Events** | 10 | Name, Thema, Datum, Participants (20), Courses (31) |
| **Recipes** | 10 | Name, Zeiten, Categories, Ingredients (44), Steps (50) |
| **Guests** | 10 | Name, Kontakt, Adresse, Ernährungspräferenzen |

**Gesamt:** 50 Hauptdatensätze + 145 Unterdatensätze = **195 Datensätze**

---

## Häufige Anwendungsfälle

### 1. Unit-Tests
```bash
# Schnelle Tests ohne Datenbank
cd backend/tests
python3 test_data_generator_test.py
```

### 2. Integrations-Tests
```bash
# Tests mit Beziehungen und Validierung
cd backend/tests
python3 test_simple_integration.py
```

### 3. Entwicklungs-Datenbank befüllen
```python
from tests.test_data_generator import TestDataGenerator
from app.database import SessionLocal
from app.models.location import Location

db = SessionLocal()

# Locations erstellen
for data in TestDataGenerator.generate_locations():
    location = Location(**data)
    db.add(location)

db.commit()
print("✓ 10 Locations erstellt")
```

### 4. API-Tests
```python
import requests
from tests.test_data_generator import TestDataGenerator

BASE_URL = "http://localhost:8000"

# Locations über API erstellen
for data in TestDataGenerator.generate_locations():
    response = requests.post(f"{BASE_URL}/locations", json=data)
    print(f"Created: {response.json()['name']}")
```

---

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'test_data_generator'"

**Lösung:**
```bash
# Stellen Sie sicher, dass Sie im richtigen Verzeichnis sind
cd backend/tests
python3 test_data_generator_test.py
```

### Problem: "Mindestens 10 Location-IDs erforderlich"

**Lösung:**
```python
# Erstellen Sie zuerst Locations und sammeln Sie die IDs
locations = TestDataGenerator.generate_locations()
# Simulieren Sie IDs (1-10)
location_ids = list(range(1, 11))
tools = TestDataGenerator.generate_tools(location_ids)
```

### Problem: Datenbank-Fehler bei test_integration.py

**Lösung:**
Verwenden Sie stattdessen `test_simple_integration.py`, der keine Datenbankverbindung benötigt:
```bash
cd backend/tests
python3 test_simple_integration.py
```

---

## Continuous Integration (CI)

### GitHub Actions Beispiel

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Run Backend Tests
      run: |
        cd backend/tests
        python3 test_data_generator_test.py
        python3 test_simple_integration.py
    
    - name: Run Frontend Tests
      run: |
        cd frontend
        npm install
        npm test
```

---

## Best Practices

### ✅ DO

1. **Verwenden Sie die Generatoren für konsistente Tests**
   ```python
   locations = TestDataGenerator.generate_locations()
   ```

2. **Bereinigen Sie Testdaten nach jedem Test**
   ```python
   @pytest.fixture
   def test_data(db):
       # Setup
       data = create_test_data()
       yield data
       # Teardown
       db.query(Location).delete()
       db.commit()
   ```

3. **Testen Sie Beziehungen zwischen Daten**
   ```python
   location_ids = [loc.id for loc in locations]
   tools = TestDataGenerator.generate_tools(location_ids)
   ```

### ❌ DON'T

1. **Keine hartcodierten Testdaten**
   ```python
   # Schlecht
   location = {"name": "Test Location", "description": "Test"}
   
   # Gut
   locations = TestDataGenerator.generate_locations()
   ```

2. **Keine Annahmen über Datenbank-IDs**
   ```python
   # Schlecht
   tool = {"location_id": 1}  # ID könnte nicht existieren
   
   # Gut
   location_ids = [loc.id for loc in created_locations]
   tools = TestDataGenerator.generate_tools(location_ids)
   ```

---

## Zusammenfassung

**Schnellste Methode zum Testen:**
```bash
cd backend/tests && python3 test_simple_integration.py
```

**Für Entwicklung:**
```python
from tests.test_data_generator import TestDataGenerator
locations = TestDataGenerator.generate_locations()
```

**Für CI/CD:**
Integrieren Sie `test_data_generator_test.py` und `test_simple_integration.py` in Ihre Pipeline.

---

## Weitere Informationen

- Vollständige Dokumentation: [`TEST_DATA_DOCUMENTATION.md`](TEST_DATA_DOCUMENTATION.md)
- Backend Generator: [`backend/tests/test_data_generator.py`](backend/tests/test_data_generator.py)
- Frontend Generator: [`frontend/src/tests/testDataGenerator.ts`](frontend/src/tests/testDataGenerator.ts)