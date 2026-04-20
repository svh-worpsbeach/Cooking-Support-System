# Container-Tests Anleitung

## Voraussetzungen

### System-Anforderungen
- Docker oder Podman installiert
- Python 3.8+ installiert
- `requests` Python-Modul (wird automatisch installiert)

### Installation von requests (falls nicht vorhanden)

Das Script versucht automatisch, `requests` zu installieren. Falls dies fehlschlägt:

```bash
# Option 1 (empfohlen für macOS mit Homebrew Python)
pip3 install --user requests

# Option 2
python3 -m pip install --user requests

# Option 3 (nur macOS mit Homebrew)
brew install python-requests
```

## Container-Tests ausführen

### 1. Container starten
```bash
# Mit Docker
docker-compose up -d

# Mit Podman
podman-compose up -d
# oder
./compose-wrapper.sh up -d
```

### 2. Tests ausführen
```bash
./run-container-tests.sh
```

Das Script führt automatisch folgende Schritte aus:
1. Erkennt Container-Runtime (Docker/Podman)
2. Prüft ob Container laufen
3. Prüft Python-Abhängigkeiten (installiert `requests` falls nötig)
4. Testet API-Endpunkte
5. Erstellt 10 Testdatensätze pro Komponente:
   - Locations (Lagerorte)
   - Tools (Werkzeuge)
   - Events (Veranstaltungen)
   - Recipes (Rezepte)
   - Guests (Gäste)
6. Validiert erstellte Daten

## Konfiguration

### Ports anpassen
Standardmäßig verwendet das Script:
- Backend: `http://localhost:5580`
- Frontend: `http://localhost:5500`

Um andere Ports zu verwenden:
```bash
BACKEND_URL=http://localhost:8000 FRONTEND_URL=http://localhost:3000 ./run-container-tests.sh
```

### Timeout anpassen
```bash
# In run-container-tests.sh Zeile 18 ändern:
API_TIMEOUT=10  # Standard: 5 Sekunden
```

## Fehlerbehebung

### Problem: "requests" Modul nicht gefunden
**Lösung:** Das Script versucht automatisch, `requests` mit `--user` Flag zu installieren.

Falls die automatische Installation fehlschlägt (z.B. bei macOS mit Homebrew Python):

```bash
# Manuelle Installation mit --user Flag
pip3 install --user requests

# Alternative: Mit python3 -m pip
python3 -m pip install --user requests

# Für macOS mit Homebrew
brew install python-requests
```

**Hinweis für macOS-Benutzer:** Homebrew Python ist "externally managed" und erfordert das `--user` Flag oder die Verwendung von virtuellen Umgebungen.

### Problem: Container nicht erreichbar
**Prüfen:**
```bash
# Container-Status prüfen
docker ps
# oder
podman ps

# Backend-API testen
curl http://localhost:5580/docs

# Frontend testen
curl http://localhost:5500
```

### Problem: Port bereits belegt
**Lösung:** Andere Ports in docker-compose.yml konfigurieren oder laufende Dienste stoppen

### Problem: Datenbank-Verbindungsfehler
**Lösung:** 
```bash
# Container neu starten
docker-compose down
docker-compose up -d

# Logs prüfen
docker-compose logs backend
```

## Erweiterte Nutzung

### Nur bestimmte Tests ausführen
Das Script kann angepasst werden, um nur bestimmte Komponenten zu testen. Bearbeiten Sie die `create_test_data()` Funktion in `run-container-tests.sh`.

### Testdaten anpassen
Die Testdaten werden in `backend/tests/test_data_generator.py` definiert. Passen Sie die Generator-Methoden an, um andere Daten zu erstellen.

### Manuelle API-Tests
```bash
# Locations abrufen
curl http://localhost:5580/locations

# Neue Location erstellen
curl -X POST http://localhost:5580/locations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Location", "description": "Test"}'
```

## Ausgabe verstehen

### Erfolgreiche Ausführung
```
========================================
CONTAINER STATUS
========================================

✓ Backend läuft auf http://localhost:5580
✓ Frontend läuft auf http://localhost:5500

========================================
API ENDPUNKT TESTS
========================================

✓ API Dokumentation erreichbar
✓ Locations Endpunkt erreichbar
...

========================================
TESTDATEN ERSTELLEN
========================================

✓ 10 Locations erstellt
✓ 10 Tools erstellt
...

========================================
ZUSAMMENFASSUNG
========================================

✓ Alle Tests erfolgreich!
```

### Fehlerhafte Ausführung
Bei Fehlern werden detaillierte Fehlermeldungen angezeigt:
```
✗ Backend nicht erreichbar auf http://localhost:5580
✗ Fehler beim Erstellen der Testdaten
```

## Weitere Ressourcen

- [TEST_DATA_DOCUMENTATION.md](TEST_DATA_DOCUMENTATION.md) - API-Dokumentation der Testdaten
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Umfassende Testanleitung
- [README_TESTS.md](README_TESTS.md) - Lokale Tests ohne Container