# Test Data Generator - Quick Start

## 🚀 Schnellstart

### Alle Tests automatisch ausführen:
```bash
./run-tests.sh
```

Das war's! Das Script führt automatisch alle Backend- und Frontend-Tests aus.

---

## 📋 Was wird getestet?

### Backend Tests (2 Test-Suites)
1. **Basis Unit Tests** - 7 Tests
   - Location-Generierung (10 Items)
   - Tool-Generierung (10 Items)
   - Event-Generierung (10 Items)
   - Recipe-Generierung (10 Items)
   - Guest-Generierung (10 Items)
   - Fehlerbehandlung
   - Daten-Konsistenz

2. **Integrations Tests** - 8 Tests
   - Datenstruktur-Validierung
   - Beziehungen zwischen Komponenten
   - Eindeutigkeit der Daten
   - Detaillierte Statistiken

### Frontend Tests
- TypeScript Kompilierung
- Build-Prozess
- Unit Tests (falls vorhanden)

---

## ✅ Erwartete Ausgabe

```
========================================
Test Data Generator - Automatische Tests
========================================

BACKEND TESTS
========================================
✓ Basis Unit Tests bestanden
✓ Integrations Tests bestanden

FRONTEND TESTS
========================================
✓ Frontend Build erfolgreich
✓ Frontend Unit Tests bestanden

TEST ZUSAMMENFASSUNG
========================================
Gesamt Tests:     4
Bestanden:        4
Fehlgeschlagen:   0

✓ Alle Tests erfolgreich! 🎉
```

---

## 📊 Generierte Testdaten

Das Test-Script validiert die Generierung von:

| Komponente | Anzahl | Details |
|------------|--------|---------|
| **Locations** | 10 | Hauptküche, Vorratsraum, Kühlschrank, etc. |
| **Tools** | 10 | Kochmesser, Pfanne, Küchenmaschine, etc. |
| **Events** | 10 | Italienischer Abend, Sushi Workshop, etc. |
| **Recipes** | 10 | Carbonara, Steak, Curry, Tiramisu, etc. |
| **Guests** | 10 | Mit vollständigen Kontaktdaten |

**Gesamt: 195 Datensätze** (50 Haupt + 145 Unter-Datensätze)

---

## 🔧 Manuelle Test-Ausführung

### Nur Backend Tests:
```bash
# Basis Tests
cd backend/tests
python3 test_data_generator_test.py

# Integrations Tests
python3 test_simple_integration.py
```

### Nur Frontend Tests:
```bash
cd frontend
npm run build
npm test
```

---

## 📁 Dateien

### Test-Scripts:
- [`run-tests.sh`](run-tests.sh) - **Automatisches Test-Script** ⭐
- [`backend/tests/test_data_generator_test.py`](backend/tests/test_data_generator_test.py) - Unit Tests
- [`backend/tests/test_simple_integration.py`](backend/tests/test_simple_integration.py) - Integrations Tests

### Generatoren:
- [`backend/tests/test_data_generator.py`](backend/tests/test_data_generator.py) - Backend Generator
- [`frontend/src/tests/testDataGenerator.ts`](frontend/src/tests/testDataGenerator.ts) - Frontend Generator

### Dokumentation:
- [`TESTING_GUIDE.md`](TESTING_GUIDE.md) - Ausführliche Anleitung
- [`TEST_DATA_DOCUMENTATION.md`](TEST_DATA_DOCUMENTATION.md) - API-Dokumentation

---

## 🎯 Verwendung in eigenen Tests

### Backend (Python):
```python
from tests.test_data_generator import TestDataGenerator

# Generiere Testdaten
locations = TestDataGenerator.generate_locations()
tools = TestDataGenerator.generate_tools([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
events = TestDataGenerator.generate_events()
recipes = TestDataGenerator.generate_recipes()
guests = TestDataGenerator.generate_guests()
```

### Frontend (TypeScript):
```typescript
import { TestDataGenerator } from './tests/testDataGenerator';

// Generiere Testdaten
const locations = TestDataGenerator.generateLocations();
const tools = TestDataGenerator.generateTools([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const events = TestDataGenerator.generateEvents();
const recipes = TestDataGenerator.generateRecipes();
const guests = TestDataGenerator.generateGuests();
```

---

## 🐛 Troubleshooting

### Script ist nicht ausführbar:
```bash
chmod +x run-tests.sh
```

### Python nicht gefunden:
```bash
# Installiere Python 3
brew install python3  # macOS
apt-get install python3  # Linux
```

### Node.js nicht gefunden:
```bash
# Installiere Node.js
brew install node  # macOS
apt-get install nodejs npm  # Linux
```

---

## 🔄 CI/CD Integration

### GitHub Actions:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: ./run-tests.sh
```

### GitLab CI:
```yaml
test:
  script:
    - ./run-tests.sh
```

---

## 📈 Nächste Schritte

1. **Tests ausführen**: `./run-tests.sh`
2. **Dokumentation lesen**: [`TESTING_GUIDE.md`](TESTING_GUIDE.md)
3. **In eigenen Tests verwenden**: Siehe Beispiele oben
4. **CI/CD integrieren**: Siehe CI/CD Integration

---

## ✨ Features

- ✅ Automatische Ausführung aller Tests
- ✅ Farbige Ausgabe für bessere Lesbarkeit
- ✅ Detaillierte Fehlerberichte
- ✅ Zusammenfassung am Ende
- ✅ Exit-Code für CI/CD (0 = Erfolg, 1 = Fehler)
- ✅ Überspringt fehlende Tests automatisch

---

**Viel Erfolg beim Testen! 🎉**