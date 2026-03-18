#!/usr/bin/env python3

import gzip
import logging
import os
import subprocess
import sys
import tarfile
import tempfile
import posixpath

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except ImportError:
    sys.exit("ERROR: boto3 is required. Install it with: pip install boto3")

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

# -- Config from env vars -----------------------------------------------------
DB_HOST = os.getenv("GSRS_DATABASE_HOST").rsplit(":", 1)[0]  # HOST in aws contains port
DB_PORT = os.getenv("GSRS_DATABASE_PORT", "3306")
DB_NAME = os.getenv("GSRS_DATABASE_NAME", "ixginas")
DB_USER = os.getenv("GSRS_DATABASE_USERNAME", "root")
DB_PASS = os.getenv("GSRS_DATABASE_PASSWORD", "password")
os.environ["MYSQL_PWD"] = DB_PASS

# -- S3 buckets & keys --------------------------------------------------------
GSRS_DATA_BUCKET = "gsrs-data-orchestration"
INDEX_DST_BUCKET = "gsrs-data-orchestration"

DB_DUMP_KEY    = f"dumps/{os.getenv('GSRS_DB_DUMP_KEY', '')}"
INDEX_DUMP_KEY = f"dumps/{os.getenv('GSRS_INDEX_DUMP_KEY', '')}"
INDEX_DST_PREFIX = f"indexes/{DB_NAME}"

# -- Behavior flags ------------------------------------------------------------
ENVIRONMENT       = os.getenv("GSRS_ENV", "dev")
SKIP_DB_UPDATE    = os.getenv("GSRS_SKIP_DB_UPDATE", "false").lower()
SKIP_INDEX_UPDATE = os.getenv("GSRS_SKIP_INDEX_UPDATE", "false").lower()


ROLES_TRIGGER_SQL = (
    "DELIMITER //\n"
    "CREATE TRIGGER ix_core_userprof_update_roles "
    "BEFORE UPDATE ON ix_core_userprof "
    "FOR EACH ROW "
    "BEGIN "
    "  IF NEW.roles_json IS NULL THEN "
    "    SET NEW.roles_json = "
    """'["Query","Updater","SuperUpdate","DataEntry","SuperDataEntry"]'; """
    "  END IF; "
    "END//\n"
    "DELIMITER ;\n"
)

# -- Helpers -------------------------------------------------------------------


def run_mysql(*extra_args: str, stdin_data: bytes | None = None) -> None:
    """Execute a mysql command; raise on failure."""
    cmd = ["mariadb", f"-h{DB_HOST}", f"-P{DB_PORT}", f"-u{DB_USER}", *extra_args]
    log.info("Running command: %s", " ".join(cmd))
    result = subprocess.run(cmd, input=stdin_data, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode(errors="replace").strip())


def download_from_s3(bucket: str, key: str, dest: str) -> None:
    """Download an S3 object to a local path."""
    log.info("Downloading s3://%s/%s → %s", bucket, key, dest)
    boto3.client("s3").download_file(bucket, key, dest)


def restore_dump(dump_path: str) -> None:
    """Create the database and load the gzipped SQL dump."""
    log.info("Creating database '%s'...", DB_NAME)
    run_mysql("-e", f"CREATE DATABASE {DB_NAME};")

    log.info("Loading dump into '%s' (this may take a while)...", DB_NAME)

    mysql_cmd = ["mariadb", f"-h{DB_HOST}", f"-P{DB_PORT}", f"-u{DB_USER}", "--skip-ssl", "--binary-mode", DB_NAME]
    log.info("Running command: gunzip -c %s | %s", dump_path, " ".join(mysql_cmd))

    gunzip = subprocess.Popen(["gunzip", "-c", dump_path], stdout=subprocess.PIPE)
    mysql = subprocess.Popen(mysql_cmd, stdin=gunzip.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    gunzip.stdout.close()  # allow gunzip to receive SIGPIPE if mysql exits

    _, stderr = mysql.communicate()
    gunzip.wait()

    if mysql.returncode != 0:
        raise RuntimeError(stderr.decode(errors="replace").strip())


def create_roles_trigger() -> None:
    """Create the roles-assignment trigger (ignored if it already exists)."""
    log.info("Creating roles trigger...")
    try:
        run_mysql(DB_NAME, stdin_data=ROLES_TRIGGER_SQL.encode())
    except RuntimeError as exc:
        if "already exists" in str(exc).lower():
            log.info("Trigger already exists — skipping.")
        else:
            log.error("Failed to create roles trigger: %s", exc)


# -- Index transfer ------------------------------------------------------------


def transfer_index() -> None:
    """Download index archive, extract it, and upload files to dest bucket."""

    if not INDEX_DUMP_KEY:
        raise RuntimeError("INDEX_DUMP_KEY env var is required")

    log.info("Index source: s3://%s/%s", GSRS_DATA_BUCKET, INDEX_DUMP_KEY)

    s3 = boto3.client("s3")

    prefix = INDEX_DST_PREFIX.rstrip("/") + "/"

    # 1) Check if destination prefix already has objects
    log.info(
        "Checking if index path exists at s3://%s/%s",
        INDEX_DST_BUCKET,
        prefix,
    )
    resp = s3.list_objects_v2(Bucket=INDEX_DST_BUCKET, Prefix=prefix, MaxKeys=1)
    if resp.get("KeyCount", 0) > 0:
        log.info(
            "Index path s3://%s/%s already exists, skipping index transfer.",
            INDEX_DST_BUCKET,
            prefix,
        )
        return

    if ENVIRONMENT != "dev":
        raise RuntimeError("Index does not exist. Please re-run workflow with environment set to dev.")

    with tempfile.TemporaryDirectory() as tmp_dir:
        archive_path = os.path.join(tmp_dir, os.path.basename(INDEX_DUMP_KEY))

        # Download
        log.info("Downloading index archive...")
        s3.download_file(GSRS_DATA_BUCKET, INDEX_DUMP_KEY, archive_path)

        # Extract
        log.info("Extracting archive...")
        with tarfile.open(archive_path, "r:gz") as tar:
            tar.extractall(path=tmp_dir)
        os.remove(archive_path)

        # Strip the top-level "ginas.ix" folder
        content_root = os.path.join(tmp_dir, "ginas.ix")
        if not os.path.isdir(content_root):
            raise RuntimeError("Expected 'ginas.ix' folder not found in archive")

        # Upload extracted files
        uploaded = 0
        for root, _dirs, files in os.walk(content_root):
            for fname in files:
                local_path = os.path.join(root, fname)

                # relative to ginas.ix root
                rel_path = os.path.relpath(local_path, content_root)

                rel_path = rel_path.replace("\\", "/")

                dst_key = posixpath.join(prefix, rel_path)

                log.info(
                    "Uploading %s → s3://%s/%s",
                    rel_path,
                    INDEX_DST_BUCKET,
                    dst_key,
                )
                s3.upload_file(local_path, INDEX_DST_BUCKET, dst_key)
                uploaded += 1

        log.info(
            "Uploaded %d file(s) to s3://%s/%s",
            uploaded,
            INDEX_DST_BUCKET,
            prefix,
        )


# -- Main ----------------------------------------------------------------------


def main() -> int:
    dump_path = None
    try:
        # --- Step 1: DB import ---
        if not DB_DUMP_KEY:
            raise RuntimeError("DB_DUMP_KEY env var is required")

        if SKIP_DB_UPDATE.lower() == "false":
            log.info("DATABASE Dump key: %s", DB_DUMP_KEY)
            dump_path = os.path.basename(DB_DUMP_KEY)
            download_from_s3(GSRS_DATA_BUCKET, DB_DUMP_KEY, dump_path)

            restore_dump(dump_path)
            create_roles_trigger()

        # --- Step 2: Index transfer ---
        if SKIP_INDEX_UPDATE.lower() == "false":
            log.info("Starting index transfer...")
            transfer_index()

            log.info("Done.")
        return 0

    except (BotoCoreError, ClientError) as exc:
        log.error("AWS error: %s", exc)
        return 1
    except RuntimeError as exc:
        log.error("Error: %s", exc)
        return 1
    except (tarfile.TarError, gzip.BadGzipFile) as exc:
        log.error("Archive error: %s", exc)
        return 1
    except Exception as exc:
        log.error("Unexpected error: %s", exc)
        return 1
    finally:
        if dump_path and os.path.isfile(dump_path):
            os.remove(dump_path)
            log.info("Cleaned up %s", dump_path)


if __name__ == "__main__":
    sys.exit(main())
