#!/usr/bin/env bash
# flip_noindex.sh tenant slug false|true
set -euo pipefail
tenant="${1:?tenant}"; slug="${2:?slug}"; flag="${3:?true|false}"
file="content/${tenant}/${slug}/index.mdx"
[ ! -f "$file" ] && { echo "not found: $file"; exit 1; }
# toggle front-matter noindex:
perl -0777 -pe "s/(^---[\\s\\S]*?noindex:\\s*)(true|false)/\\1${flag}/m" -i "$file" || true
git add "$file" && git commit -m "chore: ${tenant}/${slug} noindex -> ${flag}" || true
echo "noindex now ${flag} for ${tenant}/${slug}"
