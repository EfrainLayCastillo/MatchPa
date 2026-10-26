#!/usr/bin/env bash
# PostToolUse(Edit|Write): lint the edited file. Exit 2 sends the errors back to Claude.
set -uo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
file="$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')"

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs) ;;
  *) exit 0 ;;
esac

rel="${file#"$root"/}"
pkg="${rel%%/*}"
case "$pkg" in backend|frontend) ;; *) exit 0 ;; esac

dir="$root/$pkg"
[ -f "$dir/package.json" ] && [ -x "$dir/node_modules/.bin/eslint" ] || exit 0

if ! out="$(cd "$dir" && ./node_modules/.bin/eslint --no-warn-ignored "${rel#"$pkg"/}" 2>&1)"; then
  echo "ESLint encontró errores en $rel:" >&2
  echo "$out" >&2
  exit 2
fi
