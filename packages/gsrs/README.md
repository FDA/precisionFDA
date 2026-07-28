# GSRS

This folder contains the **GSRS package**, which consists of two main components:

- **web** – The main web application
- **nginx** – The web server configuration

The web application is built from the GSRS source code along with our configuration overrides.

---

## Build

The Dockerfile clones the backend and frontend repositories and builds them.

### Build Arguments

You can override the default build branches/tags using Docker build arguments:

| Argument | Default | Description |
|----------|---------|-------------|
| `GSRS3_MAIN_BRANCH` | `GSRSv3.2.0PUB` | Branch or tag for the backend repository (`ncats/gsrs3-main-deployment`) |
| `FRONTEND_TAG` | `pfda` | Branch or tag for the frontend repository (`ncats/GSRSFrontend`) |

### Example Build Command

```bash
docker build \
  --build-arg GSRS3_MAIN_BRANCH=GSRSv3.2.0BETA \
  --build-arg FRONTEND_TAG=feature-frontend \
  -t gsrs_web:latest .
```

### Image Rebuild Triggers

**gsrs_web** images are rebuilt if:
- The local `gsrs_web` code changes
- A new commit is pushed to `GSRS3_MAIN_BRANCH`
- A new commit is pushed to `FRONTEND_TAG`

**gsrs_nginx** images are rebuilt if:
- The local `gsrs_nginx` configuration changes

If an image with the computed tag already exists, it is reused to avoid unnecessary rebuilds.

## Run

Some parameters need to be specified to run this container. These are typically pulled from AWS Parameter Store during deployment:

| Parameter | Example |
|-----------|---------|
| `HOST` | `https://dev.pfda.dnanexus.com` |
| `GSRS_DATABASE_HOST` | (database hostname) |
| `GSRS_DATABASE_USERNAME` | (database user) |
| `GSRS_DATABASE_PASSWORD` | (database password) |
| `GSRS_DATABASE_NAME` | (database name) |

## Local Development Setup

Before running GSRS locally, you can download the seed data (Lucene index + DB dump) from S3, but the GSRS runs without populated db and index as well:

```bash
make gsrs-seed-data
```

This downloads:
- **Lucene index** → `packages/gsrs/seed-data/ginas.ix/`
- **DB data dump** → `docker/misc/gsrs-db-init/02-gsrsdb-data.sql`

The repo already ships a schema-only file (`docker/misc/gsrs-db-init/01-gsrsdb-schema.sql`), so GSRS can start with an empty DB even without running this script. The seed data adds ~18 substances for a fully populated local instance.

**Prerequisites**: AWS CLI configured with access to the `gsrs-database-dumps-dev` bucket.

You can override the S3 source with environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `GSRS_SEED_S3_BUCKET` | `gsrs-database-dumps-dev` | S3 bucket name |
| `GSRS_SEED_INDEX_KEY` | `local/ginas_ix.tar.gz` | S3 key for the Lucene index archive |
| `GSRS_SEED_DB_DUMP_KEY` | `local/gsrsdb.sql.gz` | S3 key for the gzipped SQL dump |

The script is idempotent — it skips downloads if the files already exist. Delete the local files to force a re-download.

---
## Database & Index Restore Workflow

Within the data_update folder, we have the dockerfile and script for restoring the database and index.
The corresponding workflow is defined in the `data_update.yml` file.

It performs two main steps:

### 1. Database Restore
- Downloads a gzipped SQL dump from S3  
- Creates the target database  
- Imports the dump into MariaDB/MySQL  
- Ensures a required roles trigger exists  

### 2. Index Transfer
- Downloads a compressed index archive from S3  
- Extracts the contents  
- Uploads the index files to the target S3 bucket under the configured prefix  

---

## Optional Skip Flags

You can control execution using the following environment variables:

- `GSRS_SKIP_DB_UPDATE`  
  Set to `"true"` to skip the database restore step.  
  Defaults to `"false"`.

- `GSRS_SKIP_INDEX_UPDATE`  
  Set to `"true"` to skip the index transfer step.  
  Defaults to `"false"`.

This allows you to restore only the database, only the index, or both, depending on your use case.