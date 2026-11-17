#!/usr/bin/env bash
# Stop: run typecheck, lint and tests for every package with uncommitted changes.
# Exit 2 keeps Claude working until they pass.
set -uo pipefail

input="$(cat)"
# Second stop after a block: let it finish to avoid an endless loop.
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
failures=""

verify() {
  local pkg="$1"; shift
  local dir="$root/$pkg"
  [ -f "$dir/package.json" ] && [ -d "$dir/node_modules" ] || return 0
  [ -n "$(git -C "$root" status --porcelain -- "$pkg")" ] || return 0

  local stamp="$root/.git/stop-verify-$pkg" fingerprint
  fingerprint="$(cd "$root" && { git diff HEAD -- "$pkg"; git ls-files --others --exclude-standard -z -- "$pkg" | xargs -0 cat 2>/dev/null; } | shasum | cut -d' ' -f1)"
  [ "$(cat "$stamp" 2>/dev/null)" = "$fingerprint" ] && return 0

  local cmd out pkg_failed=""
  for cmd in "$@"; do
    if ! out="$(cd "$dir" && eval "$cmd" 2>&1)"; then
      failures+=$'\n'"[$pkg] $cmd falló:"$'\n'"$(grep -E 'error|Error|✖|❯|FAILED|failed' <<<"$out" | head -n 15)"$'\n'
      pkg_failed=1
    fi
  done
  [ -z "$pkg_failed" ] && echo "$fingerprint" > "$stamp"
}

verify backend "npm run --if-present typecheck" "npm run --if-present lint" "node ace test"
verify frontend "npx tsc --noEmit" "npm run --if-present lint"

if [ -n "$failures" ]; then
  echo "Los checks no pasan; corrígelos antes de terminar:$failures" >&2
  exit 2
fi
