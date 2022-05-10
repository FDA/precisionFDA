# Userful docker commands

# NOTE(samuel) run, run-qa (or build, build-qa) are basically same, as I haven't done any of optimizations for Intel workstations

prepare-db:
	docker compose -f docker/isolation.docker-compose.yml up --build web db
prepare-db-qa:
	docker compose -p precision-fda-qa -f docker/isolation.docker-compose.yml up --build web db
prepare-db-arm64v8-dev:
	docker compose -f docker/isolation.arm64v8.docker-compose.yml -f docker/isolation-dev-server.docker-compose.override.yml up --build web db
prepare-db-arm64v8-qa:
	docker compose -p precision-fda-qa -f docker/isolation.arm64v8.docker-compose.yml up --build web db

# Note(samuel) build shouldn't slow down significantly as mostly image layers are cached by docker builder
run:
	docker compose -f docker/isolation.docker-compose.yml up --build web frontend nodejs-api nodejs-worker db redis sidekiq
run-qa:
	docker compose -p precision-fda-qa -f docker/isolation.docker-compose.yml up --build web frontend nodejs-api nodejs-worker db redis sidekiq
run-arm64v8-dev:
	docker compose -f docker/isolation.arm64v8.docker-compose.yml -f docker/isolation-dev-server.docker-compose.override.yml up --build web frontend nodejs-api nodejs-worker db redis sidekiq
run-arm64v8-qa:
	docker compose -p precision-fda-qa -f docker/isolation.arm64v8.docker-compose.yml up --build web frontend nodejs-api nodejs-worker db redis sidekiq

run-all:
	docker compose -f docker/isolation.docker-compose.yml up --build
run-all-qa:
	docker compose -p precision-fda-qa -f docker/isolation.docker-compose.yml up --build
run-all-arm64v8-dev:
	docker compose -f docker/isolation.arm64v8.docker-compose.yml -f docker/isolation-dev-server.docker-compose.override.yml up --build
run-all-arm64v8-qa:
	docker compose -p precision-fda-qa -f docker/isolation.arm64v8.docker-compose.yml up --build

cleanup-compose:
	docker compose -f docker/isolation.docker-compose.yml down
cleanup-compose-qa:
	docker compose -p precision-fda-qa -f docker/isolation.docker-compose.yml down
cleanup-compose-arm64v8-dev:
	docker compose -f docker/isolation.arm64v8.docker-compose.yml -f docker/isolation-dev-server.docker-compose.override.yml down
cleanup-compose-arm64v8-qa:
	docker compose -p precision-fda-qa -f docker/isolation.arm64v8.docker-compose.yml down

cleanup-volumes-qa:
	docker volume rm \
		precision-fda-qa_db-pfda-mysql-volume \
		precision-fda-qa_db-gsrs-mysql-volume \
		precision-fda-qa_webpack-cache-client \
		precision-fda-qa_bundler-deps-cache-ruby

cleanup-qa: cleanup-compose-qa cleanup-volumes-qa
	echo "Cleanup complete"
cleanup-qa-arm64v8: cleanup-compose-arm64v8-qa cleanup-volumes-qa
	echo "Cleanup complete"
