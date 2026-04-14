#!/bin/bash

# ============================================
# Docker/Podman Compose Wrapper Script
# ============================================
# This script automatically detects whether to use docker-compose,
# docker compose, or podman-compose and forwards all arguments

set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

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
    exit 1
fi

# Execute the compose command with all provided arguments
exec $COMPOSE_CMD "$@"

# Made with Bob
