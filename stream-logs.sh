#!/bin/bash

set -euo pipefail

COMPOSE_FILE="./docker-compose.dev.yml"
TAIL_LINES="${TAIL_LINES:-100}"
COMPOSE_CMD=()

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

detect_compose_command() {
  if command_exists podman-compose; then
    COMPOSE_CMD=("podman-compose")
  elif command_exists docker && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=("docker" "compose")
  elif command_exists docker-compose; then
    COMPOSE_CMD=("docker-compose")
  else
    echo "Error: Neither docker-compose, docker compose, nor podman-compose found." >&2
    echo "Please install one of the following:" >&2
    echo "  - Docker with Compose plugin (recommended)" >&2
    echo "  - docker-compose (legacy)" >&2
    echo "  - podman-compose" >&2
    exit 1
  fi
}

usage() {
  cat <<'EOF'
Usage:
  ./stream-logs.sh backend
  ./stream-logs.sh frontend
  ./stream-logs.sh both
  ./stream-logs.sh backend frontend
  ./stream-logs.sh all

Options:
  --tail N     Number of lines to show before following (default: 100)
  -h, --help   Show this help

Examples:
  ./stream-logs.sh backend
  ./stream-logs.sh frontend --tail 200
  ./stream-logs.sh both
EOF
}

detect_compose_command

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: Compose file not found at $COMPOSE_FILE" >&2
  exit 1
fi

SERVICES=()

while [ $# -gt 0 ]; do
  case "$1" in
    backend)
      SERVICES+=("backend")
      shift
      ;;
    frontend)
      SERVICES+=("frontend")
      shift
      ;;
    both|all)
      SERVICES+=("backend" "frontend")
      shift
      ;;
    --tail)
      if [ $# -lt 2 ]; then
        echo "Error: --tail requires a numeric value" >&2
        exit 1
      fi
      TAIL_LINES="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown argument '$1'" >&2
      echo >&2
      usage
      exit 1
      ;;
  esac
done

if [ ${#SERVICES[@]} -eq 0 ]; then
  SERVICES=("backend" "frontend")
fi

DEDUPED_SERVICES=()
DEDUPED_KEYS=""

for service in "${SERVICES[@]}"; do
  case " $DEDUPED_KEYS " in
    *" $service "*) ;;
    *)
      DEDUPED_SERVICES+=("$service")
      DEDUPED_KEYS="$DEDUPED_KEYS $service"
      ;;
  esac
done

echo "Streaming logs from: ${DEDUPED_SERVICES[*]}"
echo "Using compose file: $COMPOSE_FILE"
echo "Using compose command: ${COMPOSE_CMD[*]}"
echo "Tail lines: $TAIL_LINES"
echo "Press Ctrl+C to stop."
echo

if ! "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" ps >/dev/null 2>&1; then
  echo "Error: Unable to query compose services." >&2
  echo "Make sure the compose provider is installed and the container engine is running." >&2
  exit 1
fi

LOG_ERROR_FILE=$(mktemp)
cleanup() {
  rm -f "$LOG_ERROR_FILE"
}
trap cleanup EXIT

set +e
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" logs --follow --tail "$TAIL_LINES" "${DEDUPED_SERVICES[@]}" 2> >(tee "$LOG_ERROR_FILE" >&2)
LOG_EXIT_CODE=$?
set -e

if [ $LOG_EXIT_CODE -ne 0 ]; then
  LOG_OUTPUT=$(cat "$LOG_ERROR_FILE")

  case "${COMPOSE_CMD[*]}:$LOG_OUTPUT" in
    podman-compose:*"no container with name or ID"*|podman-compose:*"no such container"*)
      echo >&2
      echo "Hint: No matching Podman containers were found for the selected services." >&2
      echo "Start them first, for example with:" >&2
      echo "  ./compose-wrapper.sh -f ./docker-compose.dev.yml up -d" >&2
      echo "Then retry ./stream-logs.sh." >&2
      ;;
  esac

  exit $LOG_EXIT_CODE
fi

# Made with Bob
