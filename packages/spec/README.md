# precisionFDA Usage of Platform APIs

This packages covers spec of DNAnexus platform APIs that precisionFDA is using.

## Structures

### auth.yaml

APIs called to Auth server:
- https://auth.dnanexus.com (production)
- https://stagingauth.dnanexus.com (staging)

### platform.yaml

APIs called to Cloud server (file, app, etc)
- https://api.dnanexus.com (production)
- https://stagingapi.dnanexus.com (staging)

## Run spec

- Run command `make run-spec`
- Access to http://localhost:8080
- Search for /platform.yaml or /auth.yaml