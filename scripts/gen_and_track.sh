#!/usr/bin/env bash
set -euo pipefail
tenant="${1:?tenant}"; slug="${2:?slug}"; title="${3:?title}"; seed="${4:-}"
track="docs/MASTER_TRACKER.md"; now="$(date -u +'%Y-%m-%d %H:%M UTC')"; owner="@cg216"
[ -n "$seed" ] && node scripts/generate_page.mjs "$tenant" "$slug" "$title" "$seed" || node scripts/generate_page.mjs "$tenant" "$slug" "$title"
rc=$?; if [ $rc -eq 42 ]; then echo "🚫 Duplicate guard tripped."; exit 42; elif [ $rc -ne 0 ]; then echo "❌ Generator failed ($rc)"; exit $rc; fi
if ! grep -q "| ${tenant} | ${slug} |" "$track"; then
  awk -v row="| - | ${tenant} | ${slug} | ${title} | draft | ${owner} | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ${now} |" '
    /:------------:/ && !added {print; print row; added=1; next} {print}
  ' "$track" > "$track.tmp" && mv "$track.tmp" "$track"
else
  sed -E -i'' "s/(\\| ${tenant} \\| ${slug} \\|)[^|]+(\\|) [^|]+ (\\| [^|]+ \\| [☐☑] \\| [☐☑] \\| [☐☑] \\| [☐☑] \\| [☐☑] \\| [☐☑] \\|) [^|]+ \\|/\\1 ${title} \\2 draft \\3 ${now} \\|/g" "$track" 2>/dev/null || \
  sed -E -i "s/(\\| ${tenant} \\| ${slug} \\|)[^|]+(\\|) [^|]+ (\\| [^|]+ \\| [☐☑] \\| [☐☑] \\| [☐☑] \\| [☐☑] \\| [☐☑] \\| [☐☑] \\|) [^|]+ \\|/\\1 ${title} \\2 draft \\3 ${now} \\|/g" "$track"
fi
git add "content/${tenant}/${slug}/index.mdx" "$track" "tasks/video/${slug}.json" "content/${tenant}/${slug}/image_prompts.txt"
git commit -m "feat(content): ${tenant}/${slug} — ${title}" || true
echo "✅ Created page + tracker row for ${tenant}/${slug}"
