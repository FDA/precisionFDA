#!/bin/sh
#
# Bumps the pfda CLI version across all derived locations.
# The single source of truth is packages/cli/VERSION.
#
# Usage: ./bump-version.sh X.Y.Z
#
# The sync_version calls near the bottom are the list of derived locations.
# Adding one means adding the matching check_location call in
# check-version-consistency.sh: the two lists are kept in step by hand, and a
# location only this script knows about is one nothing verifies.
#
# VERSION is written last, after every derived file has been updated, so an
# interrupted run never leaves VERSION ahead of the files it drives. Each step
# reads the current value out of the file it edits instead of trusting VERSION,
# which makes the whole script idempotent: re-running the same command repairs
# a partially applied bump.
#
# Changelog entries are inserted as TODO stubs. Replace the placeholder text,
# then run ./check-version-consistency.sh, which rejects unedited stubs.

set -eu

cd "$(dirname "$0")"

PLACEHOLDER='TODO: describe this release'

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || (cd ../.. && pwd))
CONTROLLER="$REPO_ROOT/packages/server/apps/api/src/cli/cli.controller.ts"
MDX="$REPO_ROOT/packages/docs/content/docs/guides/cli.mdx"
README="$REPO_ROOT/packages/cli/README.md"

# Colors: respect NO_COLOR; enable on a TTY or in CI (GitHub Actions renders ANSI).
if [ -n "${NO_COLOR:-}" ]; then
    BOLD='' DIM='' GREEN='' RED='' YELLOW='' RESET=''
elif [ -t 1 ] || [ "${CI:-}" = "true" ]; then
    BOLD=$(printf '\033[1m')
    DIM=$(printf '\033[2m')
    GREEN=$(printf '\033[32m')
    RED=$(printf '\033[31m')
    YELLOW=$(printf '\033[33m')
    RESET=$(printf '\033[0m')
else
    BOLD='' DIM='' GREEN='' RED='' YELLOW='' RESET=''
fi

ok() {
    printf '  %s✓%s %-20s %s\n' "$GREEN" "$RESET" "$1" "$2"
}

fatal() {
    printf '  %s✗ %s%s\n' "$RED" "$1" "$RESET" >&2
    exit 1
}

rel() {
    printf '%s' "${1#"$REPO_ROOT"/}"
}

# Trimmed contents of VERSION, or empty when it is unreadable.
read_version() {
    [ -f VERSION ] || return 0
    tr -d '[:space:]' < VERSION
}

is_semver() {
    printf '%s' "$1" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'
}

# True when $1 sorts before $2 as a numeric X.Y.Z triple. Written with explicit
# if/else so a false result never trips `set -e` in the caller.
version_lt() {
    OLDIFS=$IFS
    IFS=.
    # shellcheck disable=SC2086
    set -- $1 $2
    IFS=$OLDIFS
    if [ "$1" -ne "$4" ]; then
        if [ "$1" -lt "$4" ]; then return 0; else return 1; fi
    fi
    if [ "$2" -ne "$5" ]; then
        if [ "$2" -lt "$5" ]; then return 0; else return 1; fi
    fi
    if [ "$3" -lt "$6" ]; then return 0; else return 1; fi
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

usage() {
    CURRENT=$(read_version)
    cat <<EOF
${BOLD}Usage:${RESET} $0 X.Y.Z

Bumps the pfda CLI version everywhere it is referenced. ${DIM}Current: ${CURRENT:-unknown}${RESET}
EOF
}

NEW_VERSION="${1:-}"
case $NEW_VERSION in
    -h | --help)
        usage
        exit 0
        ;;
esac
if [ $# -ne 1 ] || ! is_semver "$NEW_VERSION"; then
    usage >&2
    exit 1
fi

# VERSION drives the whole run, so a missing or malformed value has to be its
# own error: reported as unrelated failures it sends the reader looking in the
# wrong files.
OLD_VERSION=$(read_version)
[ -f VERSION ] || fatal "packages/cli/VERSION does not exist"
[ -n "$OLD_VERSION" ] || fatal "packages/cli/VERSION is empty (expected X.Y.Z)"
is_semver "$OLD_VERSION" || fatal "packages/cli/VERSION reads '$OLD_VERSION' (expected X.Y.Z)"

for FILE in "$CONTROLLER" "$MDX" "$README"; do
    [ -f "$FILE" ] || fatal "missing $(rel "$FILE")"
done

# A mistyped version would otherwise rewrite every reference downwards and
# leave a bogus changelog entry behind. Equality stays allowed: that is the
# documented way to re-sync derived files after a partial run - and the way to
# go backwards deliberately, by editing VERSION down by hand first.
if version_lt "$NEW_VERSION" "$OLD_VERSION"; then
    fatal "$NEW_VERSION is lower than the current $OLD_VERSION"
fi

# Bumping over somebody else's unedited stub buries it: the consistency check
# only inspects the version being released, so an older placeholder would never
# be reported again and would ship as the published release note.
STALE=$(
    { readme_stub_versions; mdx_stub_versions; } \
        | grep -v "^$NEW_VERSION$" | sort -u | tr '\n' ' ' | sed 's/ $//'
)
if [ -n "$STALE" ]; then
    fatal "unedited '$PLACEHOLDER' left for: $STALE (write those notes first)"
fi

trap 'rm -f "$CONTROLLER.bak" "$MDX.bak" "$README.bak" "$MDX.tmp" "$README.tmp"' EXIT

# Escape BRE metacharacters so a literal string is safe as a sed pattern
# ('|' is the s||| delimiter used below).
esc_pattern() {
    printf '%s' "$1" | sed 's/[\\.^$*[|]/\\&/g'
}

# Escape the characters that are special on the replacement side of sed s|||.
esc_replacement() {
    printf '%s' "$1" | sed 's/[\\&|]/\\&/g'
}

# Point one kind of version reference at $NEW_VERSION.
#
# Only the anchor lines are touched, and the current value is read back out of
# each one rather than assumed to equal VERSION, so this repairs drift, is safe
# to re-run, and cannot rewrite an unrelated version elsewhere in the file.
#
# `template` is a printf format holding exactly one %s (the version) and no
# other printf escape. `anchor` is a fixed string that appears on the canonical
# line carrying that reference, and `count` is how many lines must contain it -
# an unexpected number fails loudly rather than letting the script guess which
# occurrence was meant.
#
# $1 label  $2 description  $3 file  $4 template  $5 anchor  $6 expected count
sync_version() {
    LABEL=$1
    DESC=$2
    FILE=$3
    FMT=$4
    ANCHOR=$5
    COUNT=$6

    FOUND=$(grep -cF "$ANCHOR" "$FILE" || true)
    if [ "$FOUND" -ne "$COUNT" ]; then
        fatal "$(rel "$FILE"): expected $COUNT line(s) containing '$ANCHOR', found $FOUND"
    fi

    WANT=$(printf "$FMT" "$NEW_VERSION")

    # Turn the template into a capturing regex to discover the current value.
    PROBE=$(esc_pattern "$(printf "$FMT" '@V@')")
    PROBE=$(printf '%s' "$PROBE" \
        | sed 's/@V@/\\([0-9][0-9]*\\.[0-9][0-9]*\\.[0-9][0-9]*\\)/')

    # LNO, not LINENO: the shell owns that name and would overwrite it.
    CHANGED=''
    for LNO in $(grep -nF "$ANCHOR" "$FILE" | cut -d: -f1); do
        LINE=$(sed -n "${LNO}p" "$FILE")
        case $LINE in
            *"$WANT"*) continue ;;
        esac

        CUR=$(printf '%s' "$LINE" | sed -n "s|.*$PROBE.*|\1|p")
        [ -n "$CUR" ] || fatal \
            "$(rel "$FILE"):$LNO matches the anchor but holds no $(printf "$FMT" 'X.Y.Z')"

        FROM=$(esc_pattern "$(printf "$FMT" "$CUR")")
        TO=$(esc_replacement "$WANT")
        sed -i.bak "${LNO}s|$FROM|$TO|g" "$FILE"
        rm -f "$FILE.bak"

        case $(sed -n "${LNO}p" "$FILE") in
            *"$WANT"*) ;;
            *) fatal "failed to update $(rel "$FILE"):$LNO" ;;
        esac
        CHANGED=$CUR
    done

    if [ -n "$CHANGED" ]; then
        ok "$LABEL" "$DESC ${DIM}($CHANGED → $NEW_VERSION)${RESET}"
    else
        ok "$LABEL" "$DESC ${DIM}(already $NEW_VERSION)${RESET}"
    fi
}

printf '%sBumping pfda CLI version %s → %s%s\n\n' \
    "$BOLD" "$OLD_VERSION" "$NEW_VERSION" "$RESET"
if [ "$NEW_VERSION" = "$OLD_VERSION" ]; then
    printf '%sVERSION already reads %s — re-syncing derived files.%s\n\n' \
        "$DIM" "$NEW_VERSION" "$RESET"
fi

# Derived files first; VERSION is written last so a failure here never leaves
# VERSION pointing at a version the rest of the tree has not adopted.
sync_version 'cli.controller.ts' 'version endpoint' \
    "$CONTROLLER" "version: '%s'" "return { version: '" 1
sync_version 'cli.mdx' 'linux download link' \
    "$MDX" 'pfda-linux-%s.tar.gz' 's3.amazonaws.com/cli/pfda-linux-' 1
sync_version 'cli.mdx' 'darwin download link' \
    "$MDX" 'pfda-darwin-%s.tar.gz' 's3.amazonaws.com/cli/pfda-darwin-' 1
sync_version 'cli.mdx' 'windows download link' \
    "$MDX" 'pfda-windows-%s.zip' 's3.amazonaws.com/cli/pfda-windows-' 1

# Changelog stubs. The wording is always a human's job, but the entry itself is
# scaffolded so a bump can never silently omit one.
STUBS_INSERTED=0

if grep -qF "### $NEW_VERSION (" "$README"; then
    ok 'README.md' "changelog entry ${DIM}(already present)${RESET}"
else
    awk -v entry="### $NEW_VERSION ($(date +%Y-%m-%d))\n\n- $PLACEHOLDER" '
        !inserted && /^# Version History$/ { print; print ""; print entry; inserted=1; next }
        { print }
        END { exit !inserted }
    ' "$README" > "$README.tmp" || fatal "no '# Version History' heading in $(rel "$README")"
    mv "$README.tmp" "$README"
    STUBS_INSERTED=1
    ok 'README.md' "changelog stub ${DIM}($PLACEHOLDER)${RESET}"
fi

if grep -qF "| Version $NEW_VERSION (" "$MDX"; then
    ok 'cli.mdx' "changelog row ${DIM}(already present)${RESET}"
else
    awk -v row="| Version $NEW_VERSION ($(date +%m/%d/%Y)) | $PLACEHOLDER |" '
        { print }
        /^## pFDA CLI Changelog$/ { seen=1 }
        seen && !inserted && /^\|---\|---\|$/ { print row; inserted=1 }
        END { exit !inserted }
    ' "$MDX" > "$MDX.tmp" || fatal "no '## pFDA CLI Changelog' table in $(rel "$MDX")"
    mv "$MDX.tmp" "$MDX"
    STUBS_INSERTED=1
    ok 'cli.mdx' "changelog stub ${DIM}($PLACEHOLDER)${RESET}"
fi

# Written last: every derived file above is now consistent with this value.
printf '%s\n' "$NEW_VERSION" > VERSION
ok 'VERSION' "$OLD_VERSION → $NEW_VERSION"

if [ "$STUBS_INSERTED" -eq 1 ]; then
    printf '\n%sManual step remaining%s %s(changelog wording is never generated)%s\n' \
        "$BOLD$YELLOW" "$RESET" "$DIM" "$RESET"
    printf "  Replace the '%s' stubs in:\n" "$PLACEHOLDER"
    printf '    packages/cli/README.md\n'
    printf '    packages/docs/content/docs/guides/cli.mdx\n'
fi

printf '\n%sThen verify with%s ./check-version-consistency.sh\n' "$DIM" "$RESET"
