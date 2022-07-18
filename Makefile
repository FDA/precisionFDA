# Userful docker commands

# NOTE(samuel) run, run-qa (or build, build-qa) are basically same, as I haven't done any of optimizations for Intel workstations
# NOTE(samuel) prepare-db is a temporary command mostly useful for QAs, until db waiting for nodejs-api containers is implemented
prepare-db:
	docker compose -f docker/dev.docker-compose.yml up --build web db
prepare-db-qa:
	docker compose -p precision-fda-qa -f docker/qa.docker-compose.yml up --build web db
prepare-db-arm64v8-dev:
	docker compose -f docker/arm64v8.dev.docker-compose.yml up --build web db
prepare-db-arm64v8-qa:
	docker compose -p precision-fda-qa -f docker/arm64v8.qa.docker-compose.yml up --build web db

run:
	docker compose -f docker/dev.docker-compose.yml up --build
run-qa:
	docker compose -p precision-fda-qa -f docker/qa.docker-compose.yml up --build
run-arm64v8-dev:
	docker compose -f docker/arm64v8.dev.docker-compose.yml up --build
run-arm64v8-qa:
	docker compose -p precision-fda-qa -f docker/arm64v8.qa.docker-compose.yml up --build

run-all:
	docker compose -f docker/dev.docker-compose.yml -f docker/external.docker-compose.yml up --build
run-all-qa:
	docker compose -p precision-fda-qa -f docker/qa.docker-compose.yml -f docker/external.docker-compose.yml up --build
run-all-arm64v8-dev:
	docker compose -f docker/arm64v8.dev.docker-compose.yml -f docker/external.arm64v8.docker-compose.yml up --build
run-all-arm64v8-qa:
	docker compose -p precision-fda-qa -f docker/arm64v8.qa.docker-compose.yml -f docker/external.arm64v8.docker-compose.yml up --build

# cleanup-volumes-qa:
# 	docker volume rm \
# 		precision-fda-qa_db-pfda-mysql-volume \
# 		precision-fda-qa_db-gsrs-mysql-volume \
# 		precision-fda-qa_webpack-cache-client \
# 		precision-fda-qa_bundler-deps-cache-ruby

# cleanup-qa: cleanup-compose-qa cleanup-volumes-qa
# 	echo "Cleanup complete"
# cleanup-qa-arm64v8: cleanup-compose-arm64v8-qa cleanup-volumes-qa
# 	echo "Cleanup complete"
