#!/bin/sh
#
# Verifies that every location deriving the pfda CLI version matches the
# single source of truth: packages/cli/VERSION.
#
# The check_location calls near the bottom are the list of derived locations.
# Adding one means adding the matching sync_version call in bump-version.sh:
# the two lists are kept in step by hand, and a location only the bumper knows
# about is one nothing verifies.
#
# Run from anywhere, after ./bump-version.sh + manual changelog entries.
# Nothing in CI runs this, so it is on whoever bumps the version to catch what
# it would have.

set -eu

cd "$(dirname "$0")"

PLACEHOLDER='TODO: describe this release'

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || (cd ../.. && pwd))
CONTROLLER="$REPO_ROOT/packages/server/apps/api/src/cli/cli.controller.ts"
MDX="$REPO_ROOT/packages/docs/content/docs/guides/cli.mdx"
README="$REPO_ROOT/packages/cli/README.md"

# Colors: respect NO_COLOR; enable on a TTY or in CI (GitHub Actions renders ANSI).
if [ -n "${NO_COLOR:-}" ]; then
    BOLD='' DIM='' GREEN='' RED='' RESET=''
elif [ -t 1 ] || [ "${CI:-}" = "true" ]; then
    BOLD=$(printf '\033[1m')
    DIM=$(printf '\033[2m')
    GREEN=$(printf '\033[32m')
    RED=$(printf '\033[31m')
    RESET=$(printf '\033[0m')
else
    BOLD='' DIM='' GREEN='' RED='' RESET=''
fi

CHECKS=0
FAILURES=0

fatal() {
    printf '  %s✗ %s%s\n' "$RED" "$1" "$RESET" >&2
    exit 1
}

rel() {
    printf '%s' "${1#"$REPO_ROOT"/}"
}

pass() {
    printf '  %s✓%s %-20s %s\n' "$GREEN" "$RESET" "$1" "$2"
}

fail() {
    FAILURES=$((FAILURES + 1))
    printf '  %s✗ %-20s %s%s — %s\n' "$RED" "$1" "$2" "$RESET" "$3"
}

# Check one derived reference, scoped to its anchor lines: presence anywhere in
# the file is not enough, because a stale canonical line next to an unrelated
# up-to-date mention would pass.
#
# `template` is a printf format holding exactly one %s (the version) and no
# other printf escape. `anchor` is a fixed string that appears on the canonical
# line carrying that reference, and `count` is how many lines must contain it -
# an unexpected number fails loudly rather than letting the script guess which
# occurrence was meant.
#
# $1 label  $2 description  $3 file  $4 template  $5 anchor  $6 expected count
check_location() {
    LABEL=$1
    DESC=$2
    FILE=$3
    FMT=$4
    ANCHOR=$5
    COUNT=$6
    CHECKS=$((CHECKS + 1))

    FOUND=$(grep -cF "$ANCHOR" "$FILE" || true)
    if [ "$FOUND" -ne "$COUNT" ]; then
        fail "$LABEL" "$DESC" \
            "expected $COUNT line(s) containing '$ANCHOR', found $FOUND in $(rel "$FILE")"
        return 0
    fi

    WANT=$(printf "$FMT" "$VERSION")
    STALE=$(grep -F "$ANCHOR" "$FILE" | grep -vcF "$WANT" || true)
    if [ "$STALE" -ne 0 ]; then
        fail "$LABEL" "$DESC" "not at $VERSION in $(rel "$FILE")"
    else
        pass "$LABEL" "$DESC"
    fi
}

check_changelog_present() {
    TEXT=$1
    FILE=$2
    LABEL=$3
    DESC=$4
    CHECKS=$((CHECKS + 1))
    if [ -z "$TEXT" ]; then
        fail "$LABEL" "$DESC" "missing in $(rel "$FILE")"
    else
        pass "$LABEL" "$DESC"
    fi
}

# Versions whose README entry body still carries the placeholder, one per line.
readme_stub_versions() {
    awk -v ph="$PLACEHOLDER" '
        /^### [0-9]+\.[0-9]+\.[0-9]+/ { v = $2; next }
        /^### / { v = ""; next }
        v != "" && index($0, ph) { print v; v = "" }
    ' "$README"
}

# Versions whose cli.mdx changelog note is still the placeholder.
mdx_stub_versions() {
    awk -v ph="$PLACEHOLDER" '
        /^\| Version [0-9]+\.[0-9]+\.[0-9]+/ && index($0, ph) { print $3 }
    ' "$MDX"
}

# Swept across every entry, not just the version being released: a stub left
# behind by an earlier bump is otherwise never reported again and ships as the
# published release note.
check_no_stubs() {
    VERSIONS=$1
    LABEL=$2
    CHECKS=$((CHECKS + 1))
    if [ -n "$VERSIONS" ]; then
        fail "$LABEL" 'changelog wording' "unedited '$PLACEHOLDER' for: $VERSIONS"
    else
        pass "$LABEL" 'changelog wording'
    fi
}

# VERSION drives every check, so a missing or malformed value has to be its own
# error: reported as unrelated "missing reference" failures it sends the reader
# looking in the wrong files.
[ -f VERSION ] || fatal "packages/cli/VERSION does not exist"
VERSION=$(tr -d '[:space:]' < VERSION)
[ -n "$VERSION" ] || fatal "packages/cli/VERSION is empty (expected X.Y.Z)"
printf '%s' "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' \
    || fatal "packages/cli/VERSION reads '$VERSION' (expected X.Y.Z)"

for FILE in "$CONTROLLER" "$MDX" "$README"; do
    [ -f "$FILE" ] || fatal "missing $(rel "$FILE")"
done

printf '%sChecking CLI version references against VERSION %s%s\n\n' "$BOLD" "$VERSION" "$RESET"

check_location 'cli.controller.ts' 'version endpoint' \
    "$CONTROLLER" "version: '%s'" "return { version: '" 1
check_location 'cli.mdx' 'linux download link' \
    "$MDX" 'pfda-linux-%s.tar.gz' 's3.amazonaws.com/cli/pfda-linux-' 1
check_location 'cli.mdx' 'darwin download link' \
    "$MDX" 'pfda-darwin-%s.tar.gz' 's3.amazonaws.com/cli/pfda-darwin-' 1
check_location 'cli.mdx' 'windows download link' \
    "$MDX" 'pfda-windows-%s.zip' 's3.amazonaws.com/cli/pfda-windows-' 1

MDX_ROW=$(grep -F "| Version $VERSION (" "$MDX" || true)
README_ENTRY=$(awk -v v="### $VERSION (" '
    index($0, v) == 1 { found = 1; next }
    found && /^### / { exit }
    found { print }
' "$README")

check_changelog_present "$MDX_ROW"      "$MDX"    'cli.mdx'   'changelog table row'
check_changelog_present "$README_ENTRY" "$README" 'README.md' 'changelog entry'

check_no_stubs "$(readme_stub_versions | sort -u | tr '\n' ' ' | sed 's/ $//')" 'README.md'
check_no_stubs "$(mdx_stub_versions | sort -u | tr '\n' ' ' | sed 's/ $//')" 'cli.mdx'

echo
if [ "$FAILURES" -gt 0 ]; then
    printf '%s%s✗ %d of %d checks failed%s\n' "$BOLD" "$RED" "$FAILURES" "$CHECKS" "$RESET" >&2
    printf '%sRun packages/cli/bump-version.sh, then replace the TODO changelog stubs it inserts.%s\n' "$DIM" "$RESET" >&2
    exit 1
fi

printf '%s%s✓ All %d version references are consistent.%s\n' "$BOLD" "$GREEN" "$CHECKS" "$RESET"
