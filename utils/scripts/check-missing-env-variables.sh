#!/bin/bash

# Note(samuel) - didn't manage to implement it in makefile
# My efforts ended on redirecting pipeline output '<(...)'
# comm -13 <(grep -v '^#\|^\s*$' "$dotenv_file" | awk -F = '{print $1}' | sort)
# Reason for this bash script

# Formatting util
function print_missing_env_list() {
    max_len=$(awk 'BEGIN {max=0} {if (length>(max + 0)) max=length fi} END {print max}' <(echo "$1"))
    printf '%0.s-' $(seq 1 $max_len) >&2
    echo >&2
    echo "$1" >&2
    printf '%0.s-' $(seq 1 $max_len) >&2
    echo >&2
}

# Expected to be .env
dotenv_file="$1"
# Expected to be .env.spec
spec_file="$2"

if [[ ! -f "$dotenv_file" ]]; then
    echo "File \"$dotenv_file\" not found" >&2
    exit 1
fi
if [[ ! -f "$spec_file" ]]; then
    echo "File \"$spec_file\" not found" >&2
    exit 1
fi

# Pipeline Explanation
# * `grep` - filter out comments from .env file and skip empty line
# * `awk` - extract just variable names - discard values
# * `sort` - sorts
# This is done for both files
comparison_result=$(comm -13 <(grep -v '^#\|^\s*$' "$dotenv_file" | awk -F = '{print $1}' | sort) <(grep -v '^#\|^\s*$' "$spec_file" | awk -F = '{print $1}' | sort))
if [[ $comparison_result ]]; then
    echo "WARNING: Following env variables missing in \"$dotenv_file\" according to \"$spec_file\"" >&2
    print_missing_env_list "$comparison_result"
    exit 1
fi
echo "OK: \"$dotenv_file\" matches \"$spec_file\", no missing config"
