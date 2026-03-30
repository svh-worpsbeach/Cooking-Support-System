#!/bin/bash

# ============================================
# Database Switching Script
# ============================================
# This script helps you quickly switch between different database backends
# for the Cooking Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
${BLUE}Cooking Management System - Database Switcher${NC}

Usage: $0 [DATABASE_TYPE]

Available database types:
  sqlite      - SQLite (local development, no Docker required)
  postgresql  - PostgreSQL (recommended for production)
  db2         - IBM DB2 (enterprise)
  mysql       - MySQL (optional)

Examples:
  $0 sqlite       # Switch to SQLite
  $0 postgresql   # Switch to PostgreSQL
  $0 db2          # Switch to DB2

EOF
    exit 1
}

# Function to stop all containers
stop_containers() {
    print_info "Stopping all running containers..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.postgres.yml down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    print_success "Containers stopped"
}

# Function to switch to SQLite
switch_to_sqlite() {
    print_info "Switching to SQLite..."
    
    # Create .env file
    cat > backend/.env << EOF
DATABASE_TYPE=sqlite
SQLITE_DATABASE=./cooking.db
ECHO_SQL=false
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost
EOF
    
    print_success "Configuration updated for SQLite"
    print_info "Building and starting services with SQLite..."
    
    docker-compose -f docker-compose.dev.yml up -d --build
    
    print_success "Services started!"
    print_info "Backend: http://localhost:8000"
    print_info "Frontend: http://localhost:5173"
    print_info "Database: ./backend/cooking.db"
}

# Function to switch to PostgreSQL
switch_to_postgresql() {
    print_info "Switching to PostgreSQL..."
    
    # Create .env file
    cat > backend/.env << EOF
DATABASE_TYPE=postgresql
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DATABASE=cooking_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POOL_SIZE=10
MAX_OVERFLOW=20
POOL_PRE_PING=true
ECHO_SQL=false
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost
EOF
    
    print_success "Configuration updated for PostgreSQL"
    print_info "Building and starting services with PostgreSQL..."
    
    docker-compose -f docker-compose.postgres.yml up -d --build
    
    print_success "Services started!"
    print_info "Backend: http://localhost:8000"
    print_info "Frontend: http://localhost:80"
    print_info "PostgreSQL: localhost:5432"
    print_warning "Wait ~10 seconds for PostgreSQL to initialize..."
}

# Function to switch to DB2
switch_to_db2() {
    print_info "Switching to DB2..."
    
    # Create .env file
    cat > backend/.env << EOF
DATABASE_TYPE=db2
DB2_HOST=db2
DB2_PORT=50000
DB2_DATABASE=COOKDB
DB2_USER=db2inst1
DB2_PASSWORD=db2inst1-pwd
POOL_SIZE=10
MAX_OVERFLOW=20
POOL_PRE_PING=true
ECHO_SQL=false
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost
EOF
    
    print_success "Configuration updated for DB2"
    print_info "Building and starting services with DB2..."
    
    docker-compose up -d --build
    
    print_success "Services started!"
    print_info "Backend: http://localhost:8000"
    print_info "Frontend: http://localhost:80"
    print_info "DB2: localhost:50000"
    print_warning "Wait ~3 minutes for DB2 to initialize..."
}

# Function to switch to MySQL
switch_to_mysql() {
    print_error "MySQL support is not yet fully configured"
    print_info "To add MySQL support:"
    print_info "1. Uncomment MySQL drivers in backend/requirements.txt"
    print_info "2. Create docker-compose.mysql.yml"
    print_info "3. Update this script"
    exit 1
}

# Main script
main() {
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check arguments
    if [ $# -eq 0 ]; then
        usage
    fi
    
    DB_TYPE=$1
    
    print_info "Current database type: ${DB_TYPE}"
    
    # Stop existing containers
    stop_containers
    
    # Switch based on database type
    case $DB_TYPE in
        sqlite)
            switch_to_sqlite
            ;;
        postgresql|postgres)
            switch_to_postgresql
            ;;
        db2)
            switch_to_db2
            ;;
        mysql)
            switch_to_mysql
            ;;
        *)
            print_error "Unknown database type: $DB_TYPE"
            usage
            ;;
    esac
    
    echo ""
    print_success "Database switched to ${DB_TYPE}!"
    print_info "Check logs with: docker-compose logs -f"
    print_info "Stop services with: docker-compose down"
}

# Run main function
main "$@"

# Made with Bob
