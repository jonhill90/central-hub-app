#!/usr/bin/env bash
# Keeps real notebook content out of this public repository.
# 1. Every PNG under docs/evidence/ must be listed, with its sha256, in docs/evidence/allowed.sha256.
#    A new or changed image therefore needs a reviewed change to that list, made from the fixture notebook.
# 2. No file outside tests/ and the two agent-rule files may name the real notebook or its folders.
# Usage: scripts/check-evidence.sh [repository root]
set -u
root="${1:-.}"
cd "$root" || exit 2
bad=0
list=docs/evidence/allowed.sha256
test -f "$list" || { echo "missing $list"; exit 1; }
while IFS= read -r f; do
  sum=$(sha256sum "$f" | cut -d' ' -f1)
  grep -q "^$sum  $f\$" "$list" || { echo "image not on the allowed list: $f ($sum)"; bad=1; }
done < <(find docs -type f -name '*.png' | sort)
while read -r sum f; do
  test -f "$f" || { echo "allowed list names a missing image: $f"; bad=1; }
done < <(grep -v '^#' "$list" | grep -v '^$')
markers='agent-notebook|01-notes|00-inbox|99-meta|02-projects|03-areas|04-resources|/home/user/'
hits=$(grep -RIEn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next \
  --exclude-dir=tests --exclude=CLAUDE.md --exclude=AGENTS.md --exclude=check-evidence.sh \
  --exclude=ci.yml "$markers" . || true)
if [ -n "$hits" ]; then echo "real-notebook markers outside tests/:"; echo "$hits"; bad=1; fi
test "$bad" = 0 && echo "evidence check passed"
exit "$bad"
