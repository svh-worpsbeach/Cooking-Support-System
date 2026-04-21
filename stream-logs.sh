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

stream_podman_logs() {
  local tail_args=()
  local pid_list=()

  for target in "${RESOLVED_SERVICES[@]}"; do
    tail_args+=("--tail" "$TAIL_LINES" "-f" "$target")
  done

  podman logs "${tail_args[@]}" &
  pid_list+=($!)

  wait "${pid_list[@]}"
}

resolve_podman_targets() {
  local ps_output
  ps_output=$("${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" ps 2>/dev/null || true)

  if [ -z "$ps_output" ]; then
    echo "Error: Unable to read Podman compose container list." >&2
    exit 1
  fi

  RESOLVED_SERVICES=()

  for service in "${DEDUPED_SERVICES[@]}"; do
    local target_name=""
    case "$service" in
      backend)
        if printf '%s\n' "$ps_output" | grep -q '[[:space:]]cooking-backend[[:space:]]*$'; then
          target_name="cooking-backend"
        elif printf '%s\n' "$ps_output" | grep -q '[[:space:]]cooking-backend-dev[[:space:]]*$'; then
          target_name="cooking-backend-dev"
        fi
        ;;
      frontend)
        if printf '%s\n' "$ps_output" | grep -q '[[:space:]]cooking-frontend[[:space:]]*$'; then
          target_name="cooking-frontend"
        elif printf '%s\n' "$ps_output" | grep -q '[[:space:]]cooking-frontend-dev[[:space:]]*$'; then
          target_name="cooking-frontend-dev"
        fi
        ;;
    esac

    if [ -z "$target_name" ]; then
      echo "Error: No running container found for service '$service'." >&2
      echo "Available containers:" >&2
      printf '%s\n' "$ps_output" >&2
      exit 1
    fi

    RESOLVED_SERVICES+=("$target_name")
  done
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

RESOLVED_SERVICES=("${DEDUPED_SERVICES[@]}")
if [ "${COMPOSE_CMD[0]}" = "podman-compose" ]; then
  resolve_podman_targets
fi

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

if [ "${COMPOSE_CMD[0]}" = "podman-compose" ]; then
  stream_podman_logs
  exit $?
fi

LOG_ERROR_FILE=$(mktemp)
cleanup() {
  rm -f "$LOG_ERROR_FILE"
}
trap cleanup EXIT

set +e
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" logs --follow --tail "$TAIL_LINES" "${RESOLVED_SERVICES[@]}" 2> >(tee "$LOG_ERROR_FILE" >&2)
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
