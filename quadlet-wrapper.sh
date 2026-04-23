#!/bin/bash

# ============================================
# Podman Quadlet Management Wrapper Script
# ============================================
# This script manages Podman Quadlets (systemd-based container management)
# and provides a compose-like interface

set -e

QUADLET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/quadlets" && pwd)"
SYSTEMD_USER_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

check_podman() {
    if ! command_exists podman; then
        echo -e "${RED}Error: podman not found${NC}"
        echo "Please install Podman first"
        exit 1
    fi
}

check_systemd() {
    if ! command_exists systemctl; then
        echo -e "${RED}Error: systemd not found on host${NC}"
        echo ""
        echo "Quadlets require systemd, which is not available on macOS host."
        echo ""
        echo "Options:"
        echo "  1. Use podman-compose instead (recommended for macOS):"
        echo "     podman-compose up -d"
        echo ""
        echo "  2. Use Podman Machine with systemd (advanced):"
        echo "     podman machine ssh"
        echo "     # Then install quadlets inside the VM"
        echo ""
        echo "  3. Use Linux host where systemd is available"
        echo ""
        exit 1
    fi
}

check_podman_machine() {
    # Check if running on macOS with Podman Machine
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${YELLOW}Warning: Running on macOS${NC}"
        echo "Quadlets work best on Linux with native systemd."
        echo "On macOS, consider using podman-compose instead."
        echo ""
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

install_quadlets() {
    check_podman_machine
    
    echo -e "${GREEN}Installing Quadlets...${NC}"
    
    # Create systemd user directory if it doesn't exist
    mkdir -p "$SYSTEMD_USER_DIR"
    
    # Copy quadlet files
    for file in "$QUADLET_DIR"/*.{container,network,volume}; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  Installing $filename"
            cp "$file" "$SYSTEMD_USER_DIR/"
        fi
    done
    
    # Reload systemd daemon
    echo "  Reloading systemd daemon..."
    systemctl --user daemon-reload
    
    echo -e "${GREEN}✓ Quadlets installed${NC}"
    echo ""
    echo "Note: On macOS, quadlets may not work as expected."
    echo "Consider using podman-compose for better macOS compatibility."
}

uninstall_quadlets() {
    echo -e "${YELLOW}Uninstalling Quadlets...${NC}"
    
    # Remove quadlet files
    for file in "$QUADLET_DIR"/*.{container,network,volume}; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            rm -f "$SYSTEMD_USER_DIR/$filename"
            echo "  Removed $filename"
        fi
    done
    
    # Reload systemd daemon
    systemctl --user daemon-reload
    
    echo -e "${GREEN}✓ Quadlets uninstalled${NC}"
}

start_services() {
    echo -e "${GREEN}Starting services...${NC}"
    
    # Start in order: network, volumes, postgres, backend, frontend
    systemctl --user start cooking-network.service || true
    systemctl --user start cooking-postgres-data.service || true
    systemctl --user start cooking-uploads-data.service || true
    systemctl --user start cooking-postgres.service
    systemctl --user start cooking-backend.service
    systemctl --user start cooking-frontend.service
    
    echo -e "${GREEN}✓ Services started${NC}"
}

stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    
    # Stop in reverse order
    systemctl --user stop cooking-frontend.service || true
    systemctl --user stop cooking-backend.service || true
    systemctl --user stop cooking-postgres.service || true
    
    echo -e "${GREEN}✓ Services stopped${NC}"
}

restart_services() {
    stop_services
    start_services
}

status_services() {
    echo -e "${GREEN}Service Status:${NC}"
    echo ""
    
    for service in cooking-postgres cooking-backend cooking-frontend; do
        echo "=== $service ==="
        systemctl --user status "$service.service" --no-pager || true
        echo ""
    done
}

enable_services() {
    echo -e "${GREEN}Enabling services (start on boot)...${NC}"
    
    systemctl --user enable cooking-postgres.service
    systemctl --user enable cooking-backend.service
    systemctl --user enable cooking-frontend.service
    
    echo -e "${GREEN}✓ Services enabled${NC}"
}

disable_services() {
    echo -e "${YELLOW}Disabling services...${NC}"
    
    systemctl --user disable cooking-frontend.service || true
    systemctl --user disable cooking-backend.service || true
    systemctl --user disable cooking-postgres.service || true
    
    echo -e "${GREEN}✓ Services disabled${NC}"
}

logs_service() {
    local service="$1"
    local follow="${2:-false}"
    
    if [ "$follow" = "true" ]; then
        journalctl --user -u "$service.service" -f
    else
        journalctl --user -u "$service.service" --no-pager
    fi
}

usage() {
    cat <<'EOF'
Podman Quadlet Management Script

Usage:
  ./quadlet-wrapper.sh <command> [options]

Commands:
  install       Install quadlets to systemd user directory
  uninstall     Remove quadlets from systemd
  start         Start all services
  stop          Stop all services
  restart       Restart all services
  status        Show status of all services
  enable        Enable services (start on boot)
  disable       Disable services
  logs <service> [--follow]
                Show logs for a service
                Services: postgres, backend, frontend
  
Examples:
  ./quadlet-wrapper.sh install
  ./quadlet-wrapper.sh start
  ./quadlet-wrapper.sh logs backend --follow
  ./quadlet-wrapper.sh status
  ./quadlet-wrapper.sh stop

Note: Quadlets require systemd and run as user services.
EOF
}

# Main script
check_podman
check_systemd

case "${1:-}" in
    install)
        install_quadlets
        ;;
    uninstall)
        uninstall_quadlets
        ;;
    start|up)
        start_services
        ;;
    stop|down)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status|ps)
        status_services
        ;;
    enable)
        enable_services
        ;;
    disable)
        disable_services
        ;;
    logs)
        if [ -z "${2:-}" ]; then
            echo -e "${RED}Error: Service name required${NC}"
            echo "Available services: postgres, backend, frontend"
            exit 1
        fi
        
        follow=false
        if [ "${3:-}" = "--follow" ] || [ "${3:-}" = "-f" ]; then
            follow=true
        fi
        
        logs_service "cooking-$2" "$follow"
        ;;
    -h|--help|help|"")
        usage
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        echo ""
        usage
        exit 1
        ;;
esac

# Made with Bob