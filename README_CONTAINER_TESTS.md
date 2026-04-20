# Container Tests - Test Data Generator

## 🐳 Tests gegen laufende Docker/Podman-Container

Dieses Script testet die API-Endpunkte und fügt generierte Testdaten in die laufende Datenbank ein.

**Unterstützt:** Docker, Podman, docker-compose, podman-compose, compose-wrapper.sh

---

## 🚀 Schnellstart

### Mit Docker:
```bash
docker-compose up -d
./run-container-tests.sh
```

### Mit Podman:
```bash
podman-compose up -d
./run-container-tests.sh
```

### Mit compose-wrapper (empfohlen):
```bash
./compose-wrapper.sh up -d
./run-container-tests.sh
```

Das Script:
- ✅ Prüft ob Container laufen
- ✅ Testet alle API-Endpunkte
- ✅ Erstellt 10 Items pro Komponente über die API
- ✅ Validiert die eingefügten Daten

---

## 📋 Was wird getestet?

### 1. Container Status
- Backend Container (Port 8000)
- Frontend Container (Port 3000)

### 2. API Endpunkte
- `/docs` - API Dokumentation
- `/locations` - Locations Endpunkt
- `/tools` - Tools Endpunkt
- `/events` - Events Endpunkt
- `/recipes` - Recipes Endpunkt
- `/guests` - Guests Endpunkt

### 3. Daten-Erstellung
- 10 Locations
- 10 Tools (mit Location-Referenzen)
- 10 Events (mit Participants und Courses)
- 10 Recipes (mit Ingredients und Steps)
- 10 Guests (mit vollständigen Daten)

### 4. Validierung
- Prüft ob Daten in Datenbank vorhanden sind
- Zählt erstellte Datensätze
- Validiert Beziehungen

---

## ✅ Erwartete Ausgabe

```bash
========================================
CONTAINER TESTS - Test Data Generator
========================================
Backend URL: http://localhost:8000
Frontend URL: http://localhost:3000

CONTAINER STATUS
========================================
✓ Backend läuft auf http://localhost:8000
✓ Frontend läuft auf http://localhost:3000

API ENDPUNKT TESTS
========================================
✓ API Dokumentation erreichbar
✓ Locations Endpunkt erreichbar
✓ Tools Endpunkt erreichbar
✓ Events Endpunkt erreichbar
✓ Recipes Endpunkt erreichbar
✓ Guests Endpunkt erreichbar

TESTDATEN ERSTELLEN
========================================
📍 Erstelle Locations...
  ✓ 10/10 Locations erstellt

🔧 Erstelle Tools...
  ✓ 10/10 Tools erstellt

📅 Erstelle Events...
  ✓ 10/10 Events erstellt

📖 Erstelle Recipes...
  ✓ 10/10 Recipes erstellt

👥 Erstelle Guests...
  ✓ 10/10 Guests erstellt

📊 Gesamt: 50 Datensätze erstellt

DATEN VALIDIERUNG
========================================
ℹ Locations in Datenbank: 10
ℹ Tools in Datenbank: 10
ℹ Events in Datenbank: 10
ℹ Recipes in Datenbank: 10
ℹ Guests in Datenbank: 10
✓ Validierung erfolgreich: 50 Datensätze in Datenbank

TEST ERFOLGREICH
========================================
✓ Alle Container-Tests bestanden! 🎉
ℹ Testdaten wurden erfolgreich in die Datenbank eingefügt
ℹ Sie können die Daten jetzt im Frontend unter http://localhost:3000 sehen
```

---

## 🔧 Konfiguration

### Umgebungsvariablen

```bash
# Backend URL anpassen
export BACKEND_URL=http://localhost:8000

# Frontend URL anpassen
export FRONTEND_URL=http://localhost:3000

# Tests ausführen
./run-container-tests.sh
```

### Andere Ports

```bash
# Für andere Ports
BACKEND_URL=http://localhost:8080 ./run-container-tests.sh
```

---

## 🐛 Troubleshooting

### Problem: "Backend nicht erreichbar"

**Lösung:**
```bash
# Prüfe ob Container laufen
docker-compose ps

# Starte Container
docker-compose up -d

# Prüfe Logs
docker-compose logs backend
```

### Problem: "API Endpunkt nicht erreichbar"

**Lösung:**
```bash
# Warte bis Backend vollständig gestartet ist
sleep 10

# Prüfe Backend-Status
curl http://localhost:8000/docs
```

### Problem: "Daten konnten nicht erstellt werden"

**Mögliche Ursachen:**
1. Datenbank nicht bereit
2. Validierungsfehler in den Daten
3. Fehlende Abhängigkeiten (z.B. Locations für Tools)

**Lösung:**
```bash
# Prüfe Backend-Logs
docker-compose logs backend

# Starte Container neu
docker-compose restart backend
```

### Problem: "Python-Module nicht gefunden"

**Lösung:**
```bash
# Installiere requests
pip3 install requests

# Oder mit venv
cd backend
python3 -m venv venv
source venv/bin/activate
pip install requests
```

---

## 📊 Datenbank zurücksetzen

### Alle Testdaten löschen

```bash
# Container stoppen
docker-compose down

# Volumes löschen (löscht Datenbank)
docker-compose down -v

# Neu starten
docker-compose up -d

# Neue Testdaten einfügen
./run-container-tests.sh
```

### Nur bestimmte Daten löschen

```bash
# Über API (Beispiel: Alle Locations)
curl -X DELETE http://localhost:8000/locations/1
curl -X DELETE http://localhost:8000/locations/2
# ... etc
```

---

## 🔄 CI/CD Integration

### Docker Compose in CI

```yaml
# .github/workflows/test.yml
name: Container Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Start Containers
        run: docker-compose up -d
      
      - name: Wait for Backend
        run: |
          timeout 60 bash -c 'until curl -s http://localhost:8000/docs > /dev/null; do sleep 2; done'
      
      - name: Run Container Tests
        run: ./run-container-tests.sh
      
      - name: Stop Containers
        run: docker-compose down
```

---

## 📈 Verwendung

### Entwicklung

```bash
# Container starten
docker-compose up -d

# Testdaten einfügen
./run-container-tests.sh

# Entwickeln...
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs

# Container stoppen
docker-compose down
```

### Testing

```bash
# Sauberer Start
docker-compose down -v
docker-compose up -d

# Warte auf Backend
sleep 10

# Tests ausführen
./run-container-tests.sh

# Ergebnis prüfen
echo $?  # 0 = Erfolg, 1 = Fehler
```

### Produktion

```bash
# NICHT in Produktion verwenden!
# Dieses Script ist nur für Test-/Entwicklungsumgebungen
```

---

## 🎯 Vergleich der Test-Scripts

| Script | Zweck | Benötigt |
|--------|-------|----------|
| [`run-tests.sh`](run-tests.sh) | Unit & Integrations Tests | Python3 |
| [`run-container-tests.sh`](run-container-tests.sh) | API Tests mit Containern | Docker, Python3, curl |

### Wann welches Script?

**`run-tests.sh`** - Für:
- ✅ Schnelle lokale Tests
- ✅ CI/CD ohne Docker
- ✅ Entwicklung ohne Container

**`run-container-tests.sh`** - Für:
- ✅ End-to-End Tests
- ✅ API-Validierung
- ✅ Datenbank-Integration
- ✅ Realistische Test-Umgebung

---

## 📁 Verwandte Dateien

- [`run-tests.sh`](run-tests.sh) - Lokale Tests ohne Container
- [`backend/tests/test_data_generator.py`](backend/tests/test_data_generator.py) - Test Data Generator
- [`docker-compose.yml`](docker-compose.yml) - Container-Konfiguration
- [`TESTING_GUIDE.md`](TESTING_GUIDE.md) - Ausführliche Test-Dokumentation

---

## ✨ Features

- ✅ **Docker & Podman Support** - Automatische Erkennung
- ✅ **Compose-Wrapper Integration** - Funktioniert mit compose-wrapper.sh
- ✅ **Automatische Container-Erkennung** - Zeigt laufende Container
- ✅ **API-Endpunkt-Validierung** - Testet alle Endpunkte
- ✅ **Daten-Erstellung über REST API** - 50 Datensätze
- ✅ **Validierung der eingefügten Daten** - Prüft Datenbank
- ✅ **Farbige Ausgabe** - Bessere Lesbarkeit
- ✅ **Detaillierte Fehlerberichte** - Hilft bei Debugging
- ✅ **CI/CD-kompatibel** - Exit-Codes für Automation

---

## 🔧 Container-Runtime Erkennung

Das Script erkennt automatisch, ob Docker oder Podman verwendet wird:

```bash
# Prüft in dieser Reihenfolge:
1. podman + podman-compose
2. podman + podman compose
3. docker + docker-compose
4. docker + docker compose
```

**Manuelle Auswahl:**
```bash
# Erzwinge Docker
CONTAINER_CMD=docker ./run-container-tests.sh

# Erzwinge Podman
CONTAINER_CMD=podman ./run-container-tests.sh
```

---

**Viel Erfolg beim Testen mit Docker oder Podman! 🐳**