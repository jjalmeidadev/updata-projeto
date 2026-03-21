#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_DEV="docker-compose.dev.yml"
COMPOSE_PROD="docker-compose.prod.yml"
MAX_WAIT_SECONDS="${MAX_WAIT_SECONDS:-240}"

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

wait_for_status() {
  local url="$1"
  local expected="$2"
  local label="$3"

  local started_at
  started_at="$(date +%s)"

  while true; do
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)"
    if [[ "$code" == "$expected" ]]; then
      log "${label}: HTTP ${code}"
      return 0
    fi

    local now elapsed
    now="$(date +%s)"
    elapsed="$((now - started_at))"
    if (( elapsed >= MAX_WAIT_SECONDS )); then
      echo "Timeout waiting for ${label}. Last HTTP code: ${code:-none}"
      return 1
    fi

    sleep 3
  done
}

cleanup() {
  log "Cleaning up stacks"
  docker compose -f "$COMPOSE_PROD" down --remove-orphans >/dev/null 2>&1 || true
  docker compose -f "$COMPOSE_DEV" down --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

require_cmd docker
require_cmd curl

log "Stage 1/6: validating docker compose files"
docker compose -f "$COMPOSE_DEV" config >/dev/null
docker compose -f "$COMPOSE_PROD" config >/dev/null

log "Stage 2/6: building and starting production stack"
docker compose -f "$COMPOSE_PROD" up -d --build

log "Stage 3/6: production smoke tests"
wait_for_status "http://localhost:8080" "200" "prod frontend"
wait_for_status "http://localhost:3000/api/users" "401" "prod backend auth route"

log "Stage 4/6: stopping production stack"
docker compose -f "$COMPOSE_PROD" down --remove-orphans

log "Stage 5/6: building and starting development stack"
docker compose -f "$COMPOSE_DEV" up -d --build

log "Stage 6/6: development smoke tests"
wait_for_status "http://localhost:4200" "200" "dev frontend"
wait_for_status "http://localhost:3000/api/users" "401" "dev backend auth route"

log "Staged workflow validation completed successfully"
