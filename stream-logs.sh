#!/bin/bash

set -euo pipefail

COMPOSE_FILE="./docker-compose.dev.yml"
TAIL_LINES="${TAIL_LINES:-100}"

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
for service in "${SERVICES[@]}"; do
  skip=false
  for existing in "${DEDUPED_SERVICES[@]}"; do
    if [ "$existing" = "$service" ]; then
      skip=true
      break
    fi
  done
  if [ "$skip" = false ]; then
    DEDUPED_SERVICES+=("$service")
  fi
done

echo "Streaming logs from: ${DEDUPED_SERVICES[*]}"
echo "Using compose file: $COMPOSE_FILE"
echo "Tail lines: $TAIL_LINES"
echo "Press Ctrl+C to stop."
echo

docker compose -f "$COMPOSE_FILE" logs --follow --tail "$TAIL_LINES" "${DEDUPED_SERVICES[@]}"

# Made with Bob
