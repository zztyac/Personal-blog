#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/root/Personal-blog}"

cd "$PROJECT_DIR"

# mkdir -p content/posts
# mkdir -p public/uploads

if [ ! -f .env.production ]; then
  echo ".env.production not found. Copy .env.production.example and fill it first."
  exit 1
fi

git pull --ff-only
docker compose down
docker compose up -d --build
docker compose ps
