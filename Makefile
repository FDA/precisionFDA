# ! BEFORE EDITING: Reflect changes to `docs/SUMMARY_OF_MAKEFILE_COMMANDS.md`
# ! BEFORE EDITING: Reflect changes to confluence as well - namely https://confluence.internal.dnanexus.com/display/XVGEN/Docker+troubleshooting+guide

SHELL := /bin/bash
DOCKER_COMPOSE ?= docker compose

repo-env-files-init:
	echo Setting up .env files
	cp -n docker/.env.example docker/.env
	cp -n packages/server/.env.example packages/server/.env
	cp -n packages/rails/.env.example packages/rails/.env

# ┌─────────────────┐
# │                 │
# │ dotenv commands │
# │                 │
# └─────────────────┘

check-missing-env-variables:
	@echo "Checking for env variables missing from .env files..."
	@status=0; \
	./utils/scripts/check-missing-env-variables.sh packages/rails/.env packages/rails/.env.example || status=1; \
	./utils/scripts/check-missing-env-variables.sh docker/.env docker/.env.example || status=1; \
	./utils/scripts/check-missing-env-variables.sh packages/server/.env packages/server/.env.example || status=1; \
	exit $$status

check-unpublished-env-variables:
	@echo "Checking for env variables not published in .env.example files..."
	@status=0; \
	./utils/scripts/check-unpublished-env-variables.sh packages/rails/.env packages/rails/.env.example || status=1; \
	./utils/scripts/check-unpublished-env-variables.sh docker/.env docker/.env.example || status=1; \
	./utils/scripts/check-unpublished-env-variables.sh packages/server/.env packages/server/.env.example || status=1; \
	exit $$status


# ┌───────────────────────┐
# │                       │
# │ .bashrc (.zshrc) envs │
# │                       │
# └───────────────────────┘

PFDA_SHOULD_RUN_GSRS ?= 0

# ┌───────────┐
# │           │
# │ Constants │
# │           │
# └───────────┘

EXTERNAL_DOCKER_COMPOSE_FILE := docker/external.docker-compose.yml

DOCKER_COMPOSE_FILE := docker/dev.docker-compose.yml
DOCKER_ENV_FILE := docker/.env
DOCKER_ENV_FILE_FLAGS := $(if $(wildcard $(DOCKER_ENV_FILE)),--env-file $(DOCKER_ENV_FILE),)
DOCKER_COMPOSE_FILE_FLAGS= $(DOCKER_ENV_FILE_FLAGS) -f $(DOCKER_COMPOSE_FILE)

DOCKER_COMPOSE_PREFIX := precision-fda

SERVICES := web frontend nodejs-api nodejs-worker nodejs-admin-platform-client db redis nginx docs
# Rails dev entrypoint only waits on db (mysqladmin ping) for migrations.
# Redis is unused at db:prepare time, so it's intentionally not in this list.
PREPARE_DB_DEPENDENCY_SERVICES := db
PREPARE_DB_TEST_SERVICES := web db nodejs-api nodejs-worker nodejs-admin-platform-client nginx redis
DB_WIPE_SERVICES := db
DB_WIPE_VOLUMES := db-pfda-mysql-volume

# Conditionally defined if gsrs should be included in the stack
ifneq (,$(filter-out 0,$(PFDA_SHOULD_RUN_GSRS)))
DOCKER_COMPOSE_FILE_FLAGS := $(DOCKER_COMPOSE_FILE_FLAGS) -f $(EXTERNAL_DOCKER_COMPOSE_FILE)
SERVICES := $(SERVICES) gsrs gsrsdb
DB_WIPE_SERVICES := $(DB_WIPE_SERVICES) gsrsdb
DB_WIPE_VOLUMES := $(DB_WIPE_VOLUMES) db-gsrs-mariadb-volume
endif

# Recursive `=` so DOCKER_COMPOSE_FILE_FLAGS is re-expanded at every call
# site — needed because the GSRS block above appends to it conditionally.
COMPOSE = $(DOCKER_COMPOSE) -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS)

# ┌─────────────────────────────────┐
# │                                 │
# │ Basic Docker - startup commands │
# │                                 │
# └─────────────────────────────────┘

prepare-db:
	@set -e; \
	cleanup() { status=$$?; $(COMPOSE) down; exit $$status; }; \
	trap cleanup EXIT; \
	$(COMPOSE) up -d --build --wait $(PREPARE_DB_DEPENDENCY_SERVICES); \
	$(COMPOSE) run -T --rm --no-deps --build -e PFDA_DB_INIT_ONLY=1 web
prepare-db-test:
	$(COMPOSE) up --build $(PREPARE_DB_TEST_SERVICES)
run:
	$(COMPOSE) up --build
stop:
	$(COMPOSE) down
run-spec:
	$(DOCKER_COMPOSE) -p $(DOCKER_COMPOSE_PREFIX) -f docker/spec.docker-compose.yml up

# ┌───────────────────────────────────┐
# │                                   │
# │ Basic Docker - debugging commands │
# │                                   │
# └───────────────────────────────────┘

debug-config:
	$(COMPOSE) config

# Per-service fan-out: generates an image-cleanup-X target for every entry
# in SERVICES. Use `$(COMPOSE) restart <svc>` or `$(COMPOSE) exec <svc> bash`
# directly when you need to restart or shell into a single service.
define DYNAMIC__SERVICE_TARGETS
image-cleanup-$(1):
	$(COMPOSE) stop $(1)
	$(COMPOSE) rm -f $(1)
endef

$(foreach service,$(SERVICES),$(eval $(call DYNAMIC__SERVICE_TARGETS,$(service))))

restart-full:
	$(COMPOSE) restart

# ┌─────────────────────────────────────────┐
# │                                         │
# │ Docker cleanup commands - Image cleanup │
# │                                         │
# └─────────────────────────────────────────┘

image-cleanup-full:
	$(COMPOSE) down
	docker container prune -f
	docker image prune -f
	docker builder prune -f

# ┌─────────────────────────────────────────┐
# │                                         │
# │ Docker cleanup commands - cache cleanup │
# │                                         │
# └─────────────────────────────────────────┘

WEB_SIDEKIQ__TARGET_SUFFIX := ruby-sidekiq
WEB_SIDEKIQ__SERVICES := web
WEB_SIDEKIQ__VOLUME_CLEANUPS := BUNDLER_DEPS
WEB_SIDEKIQ__BUNDLER_DEPS__VOLUME := bundler-deps-cache-ruby

# Note: the pnpm content-addressed store is shared across all Node services
# (single `pnpm-store-cache` volume). It's cleaned by `make cache-cleanup-pnpm-store`
# below — per-service cache cleanups only nuke that service's node_modules tree.
FRONTEND__TARGET_SUFFIX := frontend
FRONTEND__SERVICES := frontend
FRONTEND__VOLUME_CLEANUPS := VITE_CACHE PNPM_DEPS
FRONTEND__VITE_CACHE__VOLUME := vite-cache-client
FRONTEND__PNPM_DEPS__VOLUME := pnpm-deps-cache-client

NODEJS_API__TARGET_SUFFIX := nodejs-api
NODEJS_API__SERVICES := nodejs-api
NODEJS_API__VOLUME_CLEANUPS := PNPM_DEPS
NODEJS_API__PNPM_DEPS__VOLUME := pnpm-deps-cache-nodejs-api

NODEJS_WORKER__TARGET_SUFFIX := nodejs-worker
NODEJS_WORKER__SERVICES := nodejs-worker
NODEJS_WORKER__VOLUME_CLEANUPS := PNPM_DEPS
NODEJS_WORKER__PNPM_DEPS__VOLUME := pnpm-deps-cache-nodejs-worker

NODEJS_ADMIN__TARGET_SUFFIX := nodejs-admin-platform-client
NODEJS_ADMIN__SERVICES := nodejs-admin-platform-client
NODEJS_ADMIN__VOLUME_CLEANUPS := PNPM_DEPS
NODEJS_ADMIN__PNPM_DEPS__VOLUME := pnpm-deps-cache-nodejs-admin-platform-client

DOCS__TARGET_SUFFIX := docs
DOCS__SERVICES := docs
DOCS__VOLUME_CLEANUPS := PNPM_DEPS
DOCS__PNPM_DEPS__VOLUME := pnpm-deps-cache-docs

define FRAGMENT__VOLUME_CLEANUP
	docker volume rm -f $(foreach volume,$($(1)__VOLUME),$(DOCKER_COMPOSE_PREFIX)_$(volume));
endef

define FRAGMENT__CACHE_CLEANUP
	$(COMPOSE) stop $($(1)__SERVICES)
	$(COMPOSE) rm -f $($(1)__SERVICES)
	$(foreach volume_cleanup,$($(1)__VOLUME_CLEANUPS),$(call FRAGMENT__VOLUME_CLEANUP,$(1)__$(volume_cleanup)))
endef

define DYNAMIC__CACHE_CLEANUP
cache-cleanup-$($(1)__TARGET_SUFFIX):
	$(call FRAGMENT__CACHE_CLEANUP,$(1))
	$(COMPOSE) down
endef

POSSIBLE_CACHE_CLEANUPS := WEB_SIDEKIQ FRONTEND NODEJS_API NODEJS_WORKER NODEJS_ADMIN DOCS

$(foreach cache_cleanup,$(POSSIBLE_CACHE_CLEANUPS),$(eval $(call DYNAMIC__CACHE_CLEANUP,$(cache_cleanup))))

# Clears the shared pnpm content-addressed store used by all Node services.
# Safe to run any time — pnpm will re-download tarballs on the next install.
cache-cleanup-pnpm-store:
	docker volume rm -f $(DOCKER_COMPOSE_PREFIX)_pnpm-store-cache

# ┌───────────────────────────────────┐
# │                                   │
# │ Docker cleanup commands - db wipe │
# │                                   │
# └───────────────────────────────────┘

# Fragment with DB wipe snippet
define FRAGMENT__DB_WIPE
	$(COMPOSE) stop $(DB_WIPE_SERVICES)
	$(COMPOSE) rm -f $(DB_WIPE_SERVICES)
	docker volume rm -f $(foreach db_wipe_volume,$(DB_WIPE_VOLUMES),$(DOCKER_COMPOSE_PREFIX)_$(db_wipe_volume))
endef

db-wipe:
	$(call FRAGMENT__DB_WIPE)
	$(COMPOSE) down


define DYNAMIC__CACHE_CLEANUP_WITH_DB_WIPE
cache-cleanup-$($(1)__TARGET_SUFFIX)-with-db-wipe:
	$(call FRAGMENT__CACHE_CLEANUP,$(1))
	$(call FRAGMENT__DB_WIPE)
	$(COMPOSE) down
endef

# Dictionary workaround
# Inspiration - https://stackoverflow.com/questions/62005888/key-value-pair-in-makefile

$(foreach cache_cleanup,$(POSSIBLE_CACHE_CLEANUPS),$(eval $(call DYNAMIC__CACHE_CLEANUP_WITH_DB_WIPE,$(cache_cleanup))))
