#!/usr/bin/env bash
set -euo pipefail
URL="${1:?absolute url to ping}"          # e.g., https://example.com/methods-tests/ramzi-method-accuracy/
HOST=$(node -e "console.log(new URL(process.argv[1]).host)" "$URL")
KEY="${INDEXNOW_KEY:-}"
if [ -z "$KEY" ]; then echo "INDEXNOW_KEY env not set"; exit 1; fi
curl -sS "https://api.indexnow.org/indexnow?url=${URL}&key=${KEY}&keyLocation=https://${HOST}/indexnow.txt" -o /dev/null
echo "IndexNow pinged for ${URL}"
