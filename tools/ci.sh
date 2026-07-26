#!/usr/bin/env bash
# ci.sh — the complete verification suite. Continuous integration runs this file and nothing else,
# so "it passes locally" and "it passes in CI" cannot mean different things. Run it from the
# repository root before every push:
#
#   ./tools/ci.sh
#
# No dependencies are installed. The framework is dependency-free so it runs inside a disconnected
# enclave, and this script proves that property on every run.
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
# Snapshot the working tree up front so step 10 can tell rebuild drift apart from edits a
# contributor already had in progress. Only the former is a failure.
if command -v git >/dev/null && git rev-parse --git-dir >/dev/null 2>&1; then
  BEFORE=$(git status --porcelain 2>/dev/null)
else
  BEFORE=""
fi

step() { printf '\n\033[1m== %s\033[0m\n' "$1"; }
ok()   { printf '   %s\n' "$1"; }
bad()  { printf '   FAIL  %s\n' "$1"; fail=1; }
run()  { if "$@" >/dev/null 2>&1; then ok "ok"; else bad "$*"; fi; }

step "1. Registries and instances are valid JSON"
for f in ontology/*.json instances/*.json dib-ksi-consolidated.json; do
  if node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null; then ok "ok  $f"; else bad "invalid JSON: $f"; fi
done

step "2. Canonical dataset is in sync with its sources"
if out=$(node tools/gen-consolidated.mjs --check 2>&1); then ok "$out"; else bad "$out"; fi

step "3. Component index is in sync with the registries"
if out=$(node tools/gen-summary.mjs --check 2>&1); then ok "$out"; else bad "$out"; fi

step "3b. KSI reference doc is in sync with the catalog"
if out=$(node tools/gen-ksi-doc.mjs --check 2>&1); then ok "$out"; else bad "$out"; fi

step "4. Every instance validates"
for i in instances/*.json; do
  if node tools/validate.mjs "$i" >/dev/null 2>&1; then ok "VALID  $i"; else bad "invalid: $i"; fi
done

step "5. Projections compute"
for i in instances/*.json; do run node tools/project.mjs "$i" all; done

step "6. Test suite"
if out=$(node tools/test.mjs 2>&1 | tail -1); then ok "$out"; else bad "$out"; fi

step "7. Projections are pure functions of the graph"
node tools/project.mjs instances/*.json all > /tmp/dibksi-a.txt 2>&1
node tools/project.mjs instances/*.json all > /tmp/dibksi-b.txt 2>&1
if diff -q /tmp/dibksi-a.txt /tmp/dibksi-b.txt >/dev/null; then ok "deterministic"; else bad "projections are not deterministic"; fi

step "8. Prose holds up"
if out=$(node tools/prose-lint.mjs 2>&1 | tail -1); then ok "$out"; else node tools/prose-lint.mjs 2>&1 | sed 's/^/   /'; bad "prose lint"; fi

step "9. Prose numbers match the registries"
if out=$(node tools/claims-lint.mjs 2>&1 | tail -1); then ok "$out"; else node tools/claims-lint.mjs 2>&1 | sed 's/^/   /'; bad "claims lint"; fi

step "10. Published pages match the registries"
if node tools/gen-pages.mjs >/dev/null 2>&1; then ok "pages regenerated from ontology/"; else bad "gen-pages failed"; fi

step "11. Rebuilding leaves generated files unchanged"
if command -v git >/dev/null && git rev-parse --git-dir >/dev/null 2>&1; then
  AFTER=$(git status --porcelain 2>/dev/null)
  DRIFT=$(comm -13 <(printf '%s\n' "$BEFORE" | sort) <(printf '%s\n' "$AFTER" | sort) | sed '/^$/d')
  if [ -z "$DRIFT" ]; then
    ok "the build is reproducible — regenerating changed nothing"
    [ -n "$BEFORE" ] && ok "note: the working tree had uncommitted edits before this run"
  else
    bad "regenerating produced changes, so a committed artifact is stale:"
    printf '%s\n' "$DRIFT" | sed 's/^/        /'
    ok "commit the regenerated files, or fix the generator that is not deterministic"
  fi
else ok "skipped (not a git checkout)"; fi

step "12. No normative standard text reproduced"
if grep -rInE 'shall be implemented as follows' ontology/ docs/ 2>/dev/null; then
  bad "possible normative text — review"; else ok "clean"; fi

printf '\n'
if [ "$fail" -eq 0 ]; then printf '\033[1mCI OK\033[0m — every check passed\n'; else printf '\033[1mCI FAILED\033[0m\n'; exit 1; fi
