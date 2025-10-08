#!/usr/bin/env bash
set -euo pipefail
tenant="${1:?tenant}"; csv="${2:?topics.csv}"; seedp="${3:-batch}"
while IFS=, read -r slug title; do
  [ -z "$slug" ] && continue
  ./scripts/gen_and_track.sh "$tenant" "$slug" "$title" "${seedp}-${slug}"
done < <(grep -v '^\s*$' "$csv" | sed 's/\r$//')
