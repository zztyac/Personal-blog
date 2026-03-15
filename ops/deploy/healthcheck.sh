#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost}"

curl -fsSL "$BASE_URL/api/health"
curl -fsSL "$BASE_URL/rss.xml" >/dev/null
curl -fsSL "$BASE_URL/sitemap.xml" >/dev/null

echo "Health checks passed for $BASE_URL"
