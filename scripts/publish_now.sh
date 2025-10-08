#!/usr/bin/env bash
# publish_now.sh tenant slug absolute_url
set -euo pipefail
tenant="${1:?tenant}"
slug="${2:?slug}"
url="${3:?absolute url to ping}"
./scripts/flip_noindex.sh "$tenant" "$slug" false
INDEXNOW_KEY=${INDEXNOW_KEY:?set INDEXNOW_KEY env or repo secret} ./scripts/ping_indexnow.sh "$url"
echo "🚀 Published & pinged: $url"
