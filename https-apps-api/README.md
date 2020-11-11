# PFDA HTTPS apps module

## API

### Run for development

- make sure you have all the components from root `docker-compose` up and running.
- make sure you have the basic `.env` file prepared.
- `https-apps-api` folder contains a Makefile with all the necessary commands.
- run from within the folder:

```bash
$ make install
$ make run-dev
```

### Run tests

Tests should use the configuration environment specified in `@shared/config/envs`.

```bash
$ make test-api
```

## Worker

## Implementation notes

- worker-api communicates (on dev env) via HTTPS. It uses self-generated certificate. For staging/production a CA-authorized certificate should be provided.
