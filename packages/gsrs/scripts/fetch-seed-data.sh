#!/bin/bash
set -euo pipefail

# Downloads GSRS seed data (Lucene index + full DB dump) from S3.
#
# The repo ships a schema-only SQL file so GSRS can start with an empty DB.
# Running this script downloads the data dump (18 substances) and the Lucene index for a fully populated local instance.
#
# Prerequisites:
#   - AWS CLI configured with access to the gsrs-database-dumps-dev bucket
#   - tar, gunzip available (standard on macOS/Linux)
#
# Usage:
#   ./packages/gsrs/scripts/fetch-seed-data.sh
#   make gsrs-seed-data

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GSRS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$GSRS_DIR/../.." && pwd)"

S3_BUCKET="${GSRS_SEED_S3_BUCKET:-gsrs-database-dumps-dev}"
S3_INDEX_KEY="${GSRS_SEED_INDEX_KEY:-local/ginas_ix.tar.gz}"
S3_DB_DUMP_KEY="${GSRS_SEED_DB_DUMP_KEY:-local/gsrsdb.sql.gz}"

INDEX_DIR="$GSRS_DIR/seed-data/ginas.ix"
DB_INIT_DIR="$REPO_ROOT/docker/misc/gsrs-db-init"

echo "=== GSRS Seed Data Download ==="
echo "S3 bucket: $S3_BUCKET"
echo ""

# --- Lucene Index ---
if [ -d "$INDEX_DIR" ] && [ "$(ls -A "$INDEX_DIR" 2>/dev/null)" ]; then
  echo "[index] Already exists at $INDEX_DIR — skipping (delete to re-download)"
else
  echo "[index] Downloading Lucene index from s3://$S3_BUCKET/$S3_INDEX_KEY ..."
  mkdir -p "$INDEX_DIR"

  TMP_ARCHIVE=$(mktemp /tmp/ginas_ix.XXXXXX.tar.gz)
  trap 'rm -f "$TMP_ARCHIVE"' EXIT

  aws s3 cp "s3://$S3_BUCKET/$S3_INDEX_KEY" "$TMP_ARCHIVE"

  echo "[index] Extracting to $INDEX_DIR ..."
  tar -xzf "$TMP_ARCHIVE" -C "$GSRS_DIR/seed-data"

  rm -f "$TMP_ARCHIVE"
  echo "[index] Done."
fi

echo ""

# --- Database Dump (full data — runs after schema via numerical ordering) ---
DB_DUMP_FILE="$DB_INIT_DIR/02-gsrsdb-data.sql"
if [ -f "$DB_DUMP_FILE" ]; then
  echo "[db] Full dump already exists at $DB_DUMP_FILE — skipping (delete to re-download)"
else
  echo "[db] Downloading full DB dump from s3://$S3_BUCKET/$S3_DB_DUMP_KEY ..."
  mkdir -p "$DB_INIT_DIR"

  TMP_DUMP=$(mktemp /tmp/gsrsdb.XXXXXX.sql.gz)
  trap 'rm -f "$TMP_DUMP"' EXIT

  aws s3 cp "s3://$S3_BUCKET/$S3_DB_DUMP_KEY" "$TMP_DUMP"

  echo "[db] Decompressing to $DB_DUMP_FILE ..."
  gunzip -c "$TMP_DUMP" > "$DB_DUMP_FILE"

  rm -f "$TMP_DUMP"
  echo "[db] Done."
fi

echo ""
echo "=== Seed data ready. You can now run: make run ==="
