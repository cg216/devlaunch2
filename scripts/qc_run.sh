#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
tenant="${1:?tenant}"
slug="${2:?slug}"
node scripts/qc_apply.mjs "$tenant" "$slug"
git add docs/MASTER_TRACKER.md "content/${tenant}/${slug}/index.mdx" || true
git commit -m "chore(qc): ${tenant}/${slug} tracker + noindex update" || true
