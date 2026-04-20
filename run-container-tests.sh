#!/bin/bash

# Test-Script für laufende Docker/Podman-Container
# Fügt generierte Testdaten über die API ein und validiert sie

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Konfiguration
BACKEND_URL="${BACKEND_URL:-http://localhost:5580}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5500}"
API_TIMEOUT=5

# Erkenne Container-Runtime (Docker oder Podman)
detect_container_runtime() {
    if command -v podman &> /dev/null; then
        CONTAINER_CMD="podman"
        COMPOSE_CMD="podman-compose"
        # Prüfe ob podman-compose verfügbar ist
        if ! command -v podman-compose &> /dev/null; then
            COMPOSE_CMD="podman compose"
        fi
    elif command -v docker &> /dev/null; then
        CONTAINER_CMD="docker"
        COMPOSE_CMD="docker-compose"
        # Prüfe ob docker compose (v2) verfügbar ist
        if docker compose version &> /dev/null 2>&1; then
            COMPOSE_CMD="docker compose"
        fi
    else
        print_error "Weder Docker noch Podman gefunden!"
        exit 1
    fi
    
    print_info "Verwende Container-Runtime: ${CONTAINER_CMD}"
    print_info "Verwende Compose-Command: ${COMPOSE_CMD}"
}

# Funktionen
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Prüfe ob Container laufen
check_containers() {
    print_header "CONTAINER STATUS"
    
    # Erkenne Container-Runtime
    detect_container_runtime
    
    # Liste laufende Container
    print_info "Laufende Container:"
    if [ "$CONTAINER_CMD" = "podman" ]; then
        $CONTAINER_CMD ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
    else
        $CONTAINER_CMD ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
    fi
    echo ""
    
    # Prüfe Backend
    print_info "Prüfe Backend Container..."
    if curl -s --max-time $API_TIMEOUT "http://localhost:5580/docs" > /dev/null 2>&1; then
        print_success "Backend läuft auf http://localhost:5580"
    else
        print_error "Backend nicht erreichbar auf http://localhost:5580"
        print_info "Starte Container mit: ${COMPOSE_CMD} up -d"
        print_info "Oder mit compose-wrapper: ./compose-wrapper.sh up -d"
        exit 1
    fi
    
    # Prüfe Frontend
    print_info "Prüfe Frontend Container..."
    if curl -s --max-time $API_TIMEOUT "${FRONTEND_URL}" > /dev/null 2>&1; then
        print_success "Frontend läuft auf ${FRONTEND_URL}"
    else
        print_info "Frontend nicht erreichbar auf ${FRONTEND_URL} (optional)"
    fi
}

# Teste API-Endpunkte
test_api_endpoints() {
    print_header "API ENDPUNKT TESTS"
    
    # Test Health Check
    print_info "Teste Health Check..."
    if curl -s --max-time $API_TIMEOUT "${BACKEND_URL%/api}/docs" > /dev/null; then
        print_success "API Dokumentation erreichbar"
    else
        print_error "API Dokumentation nicht erreichbar"
        return 1
    fi
    
    # Test Locations Endpunkt
    print_info "Teste Locations Endpunkt..."
    if curl -s --max-time $API_TIMEOUT "${BACKEND_URL}/locations" > /dev/null; then
        print_success "Locations Endpunkt erreichbar"
    else
        print_error "Locations Endpunkt nicht erreichbar"
        return 1
    fi
    
    # Test Tools Endpunkt
    print_info "Teste Tools Endpunkt..."
    if curl -s --max-time $API_TIMEOUT "${BACKEND_URL}/tools" > /dev/null; then
        print_success "Tools Endpunkt erreichbar"
    else
        print_error "Tools Endpunkt nicht erreichbar"
        return 1
    fi
    
    # Test Events Endpunkt
    print_info "Teste Events Endpunkt..."
    if curl -s --max-time $API_TIMEOUT "${BACKEND_URL}/events" > /dev/null; then
        print_success "Events Endpunkt erreichbar"
    else
        print_error "Events Endpunkt nicht erreichbar"
        return 1
    fi
    
    # Test Recipes Endpunkt
    print_info "Teste Recipes Endpunkt..."
    if curl -s --max-time $API_TIMEOUT "${BACKEND_URL}/recipes" > /dev/null; then
        print_success "Recipes Endpunkt erreichbar"
    else
        print_error "Recipes Endpunkt nicht erreichbar"
        return 1
    fi
    
    # Test Guests Endpunkt
    print_info "Teste Guests Endpunkt..."
    if curl -s --max-time $API_TIMEOUT "${BACKEND_URL}/guests" > /dev/null; then
        print_success "Guests Endpunkt erreichbar"
    else
        print_error "Guests Endpunkt nicht erreichbar"
        return 1
    fi
}

# Erstelle Testdaten über API
create_test_data() {
    print_header "TESTDATEN ERSTELLEN"
    
    print_info "Prüfe Python-Abhängigkeiten..."
    
    # Prüfe ob requests installiert ist
    if ! python3 -c "import requests" 2>/dev/null; then
        print_warning "Python-Modul 'requests' nicht gefunden"
        print_info "Versuche Installation mit --user Flag..."
        
        # Versuche Installation mit --user Flag (für macOS mit Homebrew Python)
        if pip3 install requests --user --quiet 2>/dev/null; then
            print_success "requests erfolgreich installiert (user)"
        else
            print_error "Automatische Installation fehlgeschlagen"
            print_info ""
            print_info "Bitte installieren Sie 'requests' manuell:"
            print_info "  Option 1 (empfohlen): pip3 install --user requests"
            print_info "  Option 2: python3 -m pip install --user requests"
            print_info "  Option 3: brew install python-requests (macOS)"
            print_info ""
            return 1
        fi
    else
        print_success "Python-Modul 'requests' gefunden"
    fi
    
    print_info "Generiere Testdaten mit Python..."
    
    # Python-Script zum Erstellen der Testdaten
    python3 << 'EOF'
import sys
import json
import requests
from pathlib import Path

# Füge Backend-Pfad hinzu
sys.path.insert(0, str(Path(__file__).parent / "backend" / "tests"))

try:
    from test_data_generator import TestDataGenerator
except ImportError:
    print("✗ Konnte test_data_generator nicht importieren")
    sys.exit(1)

BACKEND_URL = "http://localhost:5580/api"
created_counts = {
    "locations": 0,
    "tools": 0,
    "events": 0,
    "recipes": 0,
    "guests": 0
}

try:
    # 1. Locations erstellen
    print("\n📍 Erstelle Locations...")
    locations = TestDataGenerator.generate_locations()
    location_ids = []
    
    for loc_data in locations:
        try:
            response = requests.post(f"{BACKEND_URL}/locations", json=loc_data, timeout=5)
            if response.status_code in [200, 201]:
                location_ids.append(response.json()["id"])
                created_counts["locations"] += 1
            else:
                print(f"  Warnung: Location '{loc_data['name']}' - Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"  Warnung: Location '{loc_data['name']}' konnte nicht erstellt werden: {e}")
    
    print(f"  ✓ {created_counts['locations']}/{len(locations)} Locations erstellt")
    
    # 2. Tools erstellen (nur wenn Locations existieren)
    if location_ids:
        print("\n🔧 Erstelle Tools...")
        tools = TestDataGenerator.generate_tools(location_ids)
        
        for tool_data in tools:
            try:
                response = requests.post(f"{BACKEND_URL}/tools", json=tool_data, timeout=5)
                if response.status_code in [200, 201]:
                    created_counts["tools"] += 1
                else:
                    print(f"  Warnung: Tool '{tool_data['name']}' - Status {response.status_code}: {response.text}")
            except Exception as e:
                print(f"  Warnung: Tool '{tool_data['name']}' konnte nicht erstellt werden: {e}")
        
        print(f"  ✓ {created_counts['tools']}/{len(tools)} Tools erstellt")
    
    # 3. Events erstellen
    print("\n📅 Erstelle Events...")
    events = TestDataGenerator.generate_events()
    
    for event_data in events:
        try:
            response = requests.post(f"{BACKEND_URL}/events", json=event_data, timeout=5)
            if response.status_code in [200, 201]:
                created_counts["events"] += 1
            else:
                print(f"  Warnung: Event '{event_data['name']}' - Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"  Warnung: Event '{event_data['name']}' konnte nicht erstellt werden: {e}")
    
    print(f"  ✓ {created_counts['events']}/{len(events)} Events erstellt")
    
    # 4. Recipes erstellen
    print("\n📖 Erstelle Recipes...")
    recipes = TestDataGenerator.generate_recipes()
    
    for recipe_data in recipes:
        try:
            response = requests.post(f"{BACKEND_URL}/recipes", json=recipe_data, timeout=5)
            if response.status_code in [200, 201]:
                created_counts["recipes"] += 1
            else:
                print(f"  Warnung: Recipe '{recipe_data['name']}' - Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"  Warnung: Recipe '{recipe_data['name']}' konnte nicht erstellt werden: {e}")
    
    print(f"  ✓ {created_counts['recipes']}/{len(recipes)} Recipes erstellt")
    
    # 5. Guests erstellen
    print("\n👥 Erstelle Guests...")
    guests = TestDataGenerator.generate_guests()
    
    for guest_data in guests:
        try:
            response = requests.post(f"{BACKEND_URL}/guests", json=guest_data, timeout=5)
            if response.status_code in [200, 201]:
                created_counts["guests"] += 1
            else:
                print(f"  Warnung: Guest '{guest_data['first_name']} {guest_data['last_name']}' - Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"  Warnung: Guest '{guest_data['first_name']} {guest_data['last_name']}' konnte nicht erstellt werden: {e}")
    
    print(f"  ✓ {created_counts['guests']}/{len(guests)} Guests erstellt")
    
    # Zusammenfassung
    total_created = sum(created_counts.values())
    print(f"\n📊 Gesamt: {total_created} Datensätze erstellt")
    
    # Speichere Statistiken
    with open("/tmp/test_data_stats.json", "w") as f:
        json.dump(created_counts, f)
    
    sys.exit(0 if total_created > 0 else 1)

except Exception as e:
    print(f"\n✗ Fehler beim Erstellen der Testdaten: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
EOF

    if [ $? -eq 0 ]; then
        print_success "Testdaten erfolgreich erstellt"
        return 0
    else
        print_error "Fehler beim Erstellen der Testdaten"
        return 1
    fi
}

# Validiere erstellte Daten
validate_test_data() {
    print_header "DATEN VALIDIERUNG"
    
    # Lese Statistiken
    if [ -f "/tmp/test_data_stats.json" ]; then
        print_info "Validiere erstellte Daten..."
        
        # Prüfe Locations
        location_count=$(curl -s "${BACKEND_URL}/locations" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
        print_info "Locations in Datenbank: ${location_count}"
        
        # Prüfe Tools
        tool_count=$(curl -s "${BACKEND_URL}/tools" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
        print_info "Tools in Datenbank: ${tool_count}"
        
        # Prüfe Events
        event_count=$(curl -s "${BACKEND_URL}/events" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
        print_info "Events in Datenbank: ${event_count}"
        
        # Prüfe Recipes
        recipe_count=$(curl -s "${BACKEND_URL}/recipes" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
        print_info "Recipes in Datenbank: ${recipe_count}"
        
        # Prüfe Guests
        guest_count=$(curl -s "${BACKEND_URL}/guests" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
        print_info "Guests in Datenbank: ${guest_count}"
        
        total=$((location_count + tool_count + event_count + recipe_count + guest_count))
        
        if [ $total -gt 0 ]; then
            print_success "Validierung erfolgreich: ${total} Datensätze in Datenbank"
            return 0
        else
            print_error "Keine Daten in Datenbank gefunden"
            return 1
        fi
    else
        print_error "Keine Statistiken gefunden"
        return 1
    fi
}

# Hauptfunktion
main() {
    print_header "CONTAINER TESTS - Test Data Generator"
    echo "Backend URL: ${BACKEND_URL}"
    echo "Frontend URL: ${FRONTEND_URL}"
    echo "Startzeitpunkt: $(date)"
    
    # Tests ausführen
    check_containers || exit 1
    test_api_endpoints || exit 1
    create_test_data || exit 1
    validate_test_data || exit 1
    
    # Zusammenfassung
    print_header "TEST ERFOLGREICH"
    print_success "Alle Container-Tests bestanden! 🎉"
    print_info "Testdaten wurden erfolgreich in die Datenbank eingefügt"
    print_info "Sie können die Daten jetzt im Frontend unter ${FRONTEND_URL} sehen"
    echo ""
    
    # Cleanup
    rm -f /tmp/test_data_stats.json
}

# Script ausführen
main

# Made with Bob
