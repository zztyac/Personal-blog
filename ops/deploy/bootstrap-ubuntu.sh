#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y ca-certificates curl git

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
fi

if ! docker compose version >/dev/null 2>&1; then
  sudo apt-get install -y docker-compose-plugin
fi

echo "Bootstrap complete. Re-login if docker group membership has changed."
