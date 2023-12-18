# ! BEFORE EDITING: Reflect changes to `docs/SUMMARY_OF_MAKEFILE_COMMANDS.md`
# ! BEFORE EDITING: Reflect changes to confluence as well - namely https://confluence.internal.dnanexus.com/display/XVGEN/Docker+troubleshooting+guide

repo-env-files-init:
	echo Setting up .env files
	cp -n docker/.env.example docker/.env || echo Skipping docker .env
	cp -n server/.env.example server/.env || echo Skipping server .env
	cp -n .env.example .env || echo Skipping root directory .env

repo-db-config-init:
	echo Setting up db config
	cp config/database.sample.yml config/database.yml

repo-githooks-init:
	chmod +x utils/githooks/*
	ln -f utils/githooks/* .git/hooks

repo-init: repo-db-config-init repo-env-files-init repo-githooks-init
	echo Repo setup complete


# ┌─────────────────┐
# │                 │
# │ dotenv commands │
# │                 │
# └─────────────────┘

check-missing-env-variables:
	./utils/scripts/check-missing-env-variables.sh .env .env.example
	./utils/scripts/check-missing-env-variables.sh docker/.env docker/.env.example
	./utils/scripts/check-missing-env-variables.sh server/.env server/.env.example

check-unpublished-env-variables:
	./utils/scripts/check-unpublished-env-variables.sh .env .env.example
	./utils/scripts/check-unpublished-env-variables.sh docker/.env docker/.env.example
	./utils/scripts/check-unpublished-env-variables.sh server/.env server/.env.example


# ┌───────────────────────┐
# │                       │
# │ .bashrc (.zshrc) envs │
# │                       │
# └───────────────────────┘

PFDA_ROLE ?= dev
PFDA_SHOULD_RUN_GSRS ?= 0

# ┌───────────┐
# │           │
# │ Constants │
# │           │
# └───────────┘

DOCKER_CONFIGURATION := $(PFDA_ROLE)
EXTERNAL_DOCKER_COMPOSE_FILE := docker/external.docker-compose.yml
# Conditionally defined for M1-sillicon
ifeq (arm64,$(shell uname -m))
DOCKER_CONFIGURATION := arm64v8.$(DOCKER_CONFIGURATION)
EXTERNAL_DOCKER_COMPOSE_FILE := docker/external.arm64v8.docker-compose.yml
endif

DOCKER_COMPOSE_FILE := docker/$(DOCKER_CONFIGURATION).docker-compose.yml
DOCKER_COMPOSE_FILE_FLAGS= -f $(DOCKER_COMPOSE_FILE)

# Conditionally define for role
# for dev - precision-fda
# for qa - precision-fda-qa
DOCKER_COMPOSE_PREFIX := precision-fda$(subst -dev,,-$(PFDA_ROLE))

SERVICES := web frontend nodejs-api nodejs-worker db redis sidekiq
PREPARE_DB_SERVICES := web db
# NOTE - web container needs to be stopped as well as db volume is mounted in web container for some reason
# TODO - investigate if it can be removed
DB_WIPE_SERVICES := web db
DB_WIPE_VOLUMES := db-pfda-mysql-volume

# Conditionally defined if gsrs should be included in the stack
ifneq (0,$(PFDA_SHOULD_RUN_GSRS))
ifneq (,$(PFDA_SHOULD_RUN_GSRS))
DOCKER_COMPOSE_FILE_FLAGS := $(DOCKER_COMPOSE_FILE_FLAGS) -f $(EXTERNAL_DOCKER_COMPOSE_FILE)
SERVICES := $(SERVICES) gsrs gsrsdb
PREPARE_DB_SERVICES := $(PREPARE_DB_SERVICES) gsrs gsrsdb
DB_WIPE_SERVICES := $(DB_WIPE_SERVICES) gsrsdb
DB_WIPE_VOLUMES := $(DB_WIPE_VOLUMES) db-gsrs-mysql-volume
endif
endif

# ┌─────────────────────────────────┐
# │                                 │
# │ Basic Docker - startup commands │
# │                                 │
# └─────────────────────────────────┘

# NOTE(samuel) run, run-qa (or build, build-qa) are basically same, as I haven't done any of optimizations for Intel workstations
# NOTE(samuel) prepare-db is a temporary command mostly useful for QAs, until db waiting for nodejs-api containers is implemented
prepare-db:
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) up --build $(PREPARE_DB_SERVICES)
prepare-db-test:
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) run -e RAILS_ENV=test --name web_prepare-db-test --rm $(PREPARE_DB_SERVICES)
run:
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) up --build
stop:
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) down
	echo Stopped

# ┌───────────────────────────────────┐
# │                                   │
# │ Basic Docker - debugging commands │
# │                                   │
# └───────────────────────────────────┘

define DYNAMIC__SERVICE_RESTART
restart-$(1):
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) restart $(1)
endef
define DYNAMIC__SERVICE_HOOK_INTO
hook-into-$(1):
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) exec -it $(1) bash
endef

debug-config:
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) config

$(foreach service,$(SERVICES),$(eval $(call DYNAMIC__SERVICE_RESTART,$(service))))
$(foreach service,$(SERVICES),$(eval $(call DYNAMIC__SERVICE_HOOK_INTO,$(service))))

restart-full:
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) restart

# ┌─────────────────────────────────────────┐
# │                                         │
# │ Docker cleanup commands - Image cleanup │
# │                                         │
# └─────────────────────────────────────────┘

# Dynamic macro for service cleanup

define DYNAMIC__IMAGE_CLEANUP
image-cleanup-$(1):
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) stop $(1)
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) rm -f $(1)
	docker image prune
	docker builder prune
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) down
	echo Image cleanup complete
endef

# Dynamic macro for service restart


$(foreach service,$(SERVICES),$(eval $(call DYNAMIC__IMAGE_CLEANUP,$(service))))

image-cleanup-full:
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) down
	docker container prune
	docker image prune
	docker builder prune
	echo Image cleanup complete

# ┌─────────────────────────────────────────┐
# │                                         │
# │ Docker cleanup commands - cache cleanup │
# │                                         │
# └─────────────────────────────────────────┘

WEB_SIDEKIQ__TARGET_SUFFIX := ruby-sidekiq
WEB_SIDEKIQ__SERVICES := web sidekiq
WEB_SIDEKIQ__VOLUME_CLEANUPS := BUNDLER_DEPS
WEB_SIDEKIQ__BUNDLER_DEPS__VOLUME := bundler-deps-cache-ruby
WEB_SIDEKIQ__BUNDLER_DEPS__ALLOWED_CONFIGURATIONS := dev qa arm64v8.dev arm64v8.qa

FRONTEND__TARGET_SUFFIX := frontend
FRONTEND__SERVICES := frontend
FRONTEND__VOLUME_CLEANUPS := WEBPACK_CACHE YARN_DEPS
FRONTEND__WEBPACK_CACHE__VOLUME := webpack-cache-client
FRONTEND__WEBPACK_CACHE__ALLOWED_CONFIGURATIONS := dev qa arm64v8.dev arm64v8.qa
FRONTEND__YARN_DEPS__VOLUME := yarn-deps-cache-client
FRONTEND__YARN_DEPS__ALLOWED_CONFIGURATIONS := arm64v8.dev

NODEJS_API__TARGET_SUFFIX := nodejs-api
NODEJS_API__SERVICES := nodejs-api
NODEJS_API__VOLUME_CLEANUPS := YARN_DEPS
NODEJS_API__YARN_DEPS__VOLUME := yarn-deps-cache-nodejs-api
NODEJS_API__YARN_DEPS__ALLOWED_CONFIGURATIONS := arm64v8.dev

NODEJS_WORKER__TARGET_SUFFIX := nodejs-worker
NODEJS_WORKER__SERVICES := nodejs-worker
NODEJS_WORKER__VOLUME_CLEANUPS := YARN_DEPS
NODEJS_WORKER__YARN_DEPS__VOLUME := yarn-deps-cache-nodejs-worker
NODEJS_WORKER__YARN_DEPS__ALLOWED_CONFIGURATIONS := arm64v8.dev

define FRAGMENT__VOLUME_CLEANUP
	if [[ "$($(1)__ALLOWED_CONFIGURATIONS)" == *"$(DOCKER_CONFIGURATION)"* ]]; then \
	docker volume rm -f $(foreach volume,$($(1)__VOLUME),$(DOCKER_COMPOSE_PREFIX)_$(volume)); \
	else \
	echo Skipping volume $($(1)__VOLUME) for "$(DOCKER_CONFIGURATION)" configuration; \
	fi;
endef

define FRAGMENT__CACHE_CLEANUP
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) stop $($($1)__SERVICES)
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) rm -f $($($1)__SERVICES)
	$(foreach volume_cleanup,$($(1)__VOLUME_CLEANUPS),$(call FRAGMENT__VOLUME_CLEANUP,$(1)__$(volume_cleanup)))
endef

define DYNAMIC__CACHE_CLEANUP
cache-cleanup-$($(1)__TARGET_SUFFIX):
	$(call FRAGMENT__CACHE_CLEANUP,$(1))
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) down
	echo Cache cleanup complete
endef

POSSIBLE_CACHE_CLEANUPS := WEB_SIDEKIQ FRONTEND NODEJS_API NODEJS_WORKER

$(foreach cache_cleanup,$(POSSIBLE_CACHE_CLEANUPS),$(eval $(call DYNAMIC__CACHE_CLEANUP,$(cache_cleanup))))

# ┌───────────────────────────────────┐
# │                                   │
# │ Docker cleanup commands - db wipe │
# │                                   │
# └───────────────────────────────────┘

# Fragment with DB wipe snippet
define FRAGMENT__DB_WIPE
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) stop $(DB_WIPE_SERVICES)
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) rm -f $(DB_WIPE_SERVICES)
	docker volume rm -f $(foreach db_wipe_volume,$(DB_WIPE_VOLUMES),$(DOCKER_COMPOSE_PREFIX)_$(db_wipe_volume))
endef

db-wipe:
	$(call FRAGMENT__DB_WIPE)
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) down
	echo Db wipe complete


define DYNAMIC__CACHE_CLEANUP_WITH_DB_WIPE
cache-cleanup-$($(1)__TARGET_SUFFIX)-with-db-wipe:
	$(call FRAGMENT__CACHE_CLEANUP,$(1))
	$(call FRAGMENT__DB_WIPE)
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) down
	echo Cache cleanup with db wipe complete
endef


define DYNAMIC__CACHE_CLEANUP_WITH_DB_WIPE
cache-cleanup-$($(1)__TARGET_SUFFIX)-with-db-wipe:
	$(call FRAGMENT__CACHE_CLEANUP,$(1))
	$(call FRAGMENT__DB_WIPE)
	docker compose -p $(DOCKER_COMPOSE_PREFIX) $(DOCKER_COMPOSE_FILE_FLAGS) down
	echo Cache cleanup with db wipe complete
endef

# Dictionary workaroud
# Inspiration - https://stackoverflow.com/questions/62005888/key-value-pair-in-makefile

$(foreach cache_cleanup,$(POSSIBLE_CACHE_CLEANUPS),$(eval $(call DYNAMIC__CACHE_CLEANUP_WITH_DB_WIPE,$(cache_cleanup))))

