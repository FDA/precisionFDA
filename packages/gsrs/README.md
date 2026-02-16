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
| `GSRS3_MAIN_BRANCH` | `GSRSv3.1.2PUB` | Branch or tag for the backend repository (`ncats/gsrs3-main-deployment`) |
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
