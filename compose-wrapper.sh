#!/bin/bash

# ============================================
# Docker/Podman Compose Wrapper Script
# ============================================
# This script automatically detects whether to use docker-compose,
# docker compose, podman-compose, or podman quadlets

set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we should use quadlets (Podman with systemd)
USE_QUADLETS="${USE_QUADLETS:-false}"
if [ "$USE_QUADLETS" = "true" ] && command_exists podman && command_exists systemctl; then
    # Map compose commands to quadlet commands
    case "${1:-}" in
        up)
            shift
            if [ "$1" = "-d" ] || [ "$1" = "--detach" ]; then
                exec ./quadlet-wrapper.sh start
            else
                echo "Note: Quadlets run as systemd services (always detached)"
                exec ./quadlet-wrapper.sh start
            fi
            ;;
        down)
            exec ./quadlet-wrapper.sh stop
            ;;
        ps|status)
            exec ./quadlet-wrapper.sh status
            ;;
        logs)
            shift
            service="${1:-backend}"
            follow_flag=""
            if [ "$2" = "--follow" ] || [ "$2" = "-f" ]; then
                follow_flag="--follow"
            fi
            exec ./quadlet-wrapper.sh logs "$service" $follow_flag
            ;;
        restart)
            exec ./quadlet-wrapper.sh restart
            ;;
        *)
            echo "Quadlet mode enabled. Available commands:"
            echo "  up [-d]     - Start services"
            echo "  down        - Stop services"
            echo "  ps/status   - Show status"
            echo "  logs <svc>  - Show logs"
            echo "  restart     - Restart services"
            echo ""
            echo "Or use ./quadlet-wrapper.sh directly for more options"
            exit 1
            ;;
    esac
fi

# Detect which compose tool is available
if command_exists podman-compose; then
    COMPOSE_CMD="podman-compose"
elif command_exists docker && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command_exists docker-compose; then
    COMPOSE_CMD="docker-compose"
else
    echo "Error: Neither docker-compose, docker compose, nor podman-compose found."
    echo "Please install one of the following:"
    echo "  - Docker with Compose plugin (recommended)"
    echo "  - docker-compose (legacy)"
    echo "  - podman-compose"
    echo ""
    echo "Or set USE_QUADLETS=true to use Podman Quadlets with systemd"
    exit 1
fi

# Execute the compose command with all provided arguments
exec $COMPOSE_CMD "$@"

# Made with Bob
