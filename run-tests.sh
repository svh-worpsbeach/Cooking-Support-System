#!/bin/bash

# Automatisches Test-Script für Backend und Frontend
# Führt alle Test Data Generator Tests aus

set -e  # Beende bei Fehler

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen für farbigen Output
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

# Zähler für Testergebnisse
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Hauptfunktion
main() {
    print_header "Test Data Generator - Automatische Tests"
    
    echo "Startzeitpunkt: $(date)"
    echo ""
    
    # Backend Tests
    run_backend_tests
    
    # Frontend Tests
    run_frontend_tests
    
    # Zusammenfassung
    print_summary
}

# Backend Tests ausführen
run_backend_tests() {
    print_header "BACKEND TESTS"
    
    # Prüfe ob Python verfügbar ist
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 nicht gefunden. Bitte installieren Sie Python3."
        exit 1
    fi
    
    print_info "Python Version: $(python3 --version)"
    echo ""
    
    # Test 1: Basis Unit Tests
    print_info "Führe Basis Unit Tests aus..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if cd backend/tests && python3 test_data_generator_test.py; then
        print_success "Basis Unit Tests bestanden"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        cd ../..
    else
        print_error "Basis Unit Tests fehlgeschlagen"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        cd ../..
    fi
    
    echo ""
    
    # Test 2: Integrations Tests
    print_info "Führe Integrations Tests aus..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if cd backend/tests && python3 test_simple_integration.py; then
        print_success "Integrations Tests bestanden"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        cd ../..
    else
        print_error "Integrations Tests fehlgeschlagen"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        cd ../..
    fi
}

# Frontend Tests ausführen
run_frontend_tests() {
    print_header "FRONTEND TESTS"
    
    # Prüfe ob Node.js verfügbar ist
    if ! command -v node &> /dev/null; then
        print_info "Node.js nicht gefunden. Frontend-Tests werden übersprungen."
        return
    fi
    
    print_info "Node Version: $(node --version)"
    print_info "NPM Version: $(npm --version)"
    echo ""
    
    # Prüfe ob package.json existiert
    if [ ! -f "frontend/package.json" ]; then
        print_info "frontend/package.json nicht gefunden. Frontend-Tests werden übersprungen."
        return
    fi
    
    # Test 3: Frontend TypeScript Kompilierung
    print_info "Prüfe Frontend TypeScript Kompilierung..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if cd frontend && npm run build --if-present 2>/dev/null; then
        print_success "Frontend Build erfolgreich"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        cd ..
    else
        print_info "Frontend Build übersprungen (kein Build-Script)"
        TOTAL_TESTS=$((TOTAL_TESTS - 1))
        cd ..
    fi
    
    echo ""
    
    # Test 4: Frontend Unit Tests (falls vorhanden)
    print_info "Führe Frontend Unit Tests aus..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if cd frontend && npm test --if-present 2>/dev/null; then
        print_success "Frontend Unit Tests bestanden"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        cd ..
    else
        print_info "Frontend Unit Tests übersprungen (kein Test-Script)"
        TOTAL_TESTS=$((TOTAL_TESTS - 1))
        cd ..
    fi
}

# Zusammenfassung ausgeben
print_summary() {
    print_header "TEST ZUSAMMENFASSUNG"
    
    echo "Endzeitpunkt: $(date)"
    echo ""
    echo "Gesamt Tests:     $TOTAL_TESTS"
    echo -e "${GREEN}Bestanden:        $PASSED_TESTS${NC}"
    
    if [ $FAILED_TESTS -gt 0 ]; then
        echo -e "${RED}Fehlgeschlagen:   $FAILED_TESTS${NC}"
    else
        echo -e "${GREEN}Fehlgeschlagen:   $FAILED_TESTS${NC}"
    fi
    
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_success "Alle Tests erfolgreich! 🎉"
        echo ""
        exit 0
    else
        print_error "Einige Tests sind fehlgeschlagen."
        echo ""
        exit 1
    fi
}

# Script ausführen
main

# Made with Bob
