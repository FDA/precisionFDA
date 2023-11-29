# Defining shell is necessary in order to modify PATH
SHELL := sh
bin := node_modules/.bin/
export PATH := $(bin):$(PATH)

# testflags :=

# node_modules: package.json
# 	npm install && touch node_modules

install:
	pnpm install --frozen-lockfile

install-test-prod:
	pnpm install --production=false --frozen-lockfile

# a demonstration on how to run built API
run-dist:
	pnpm run start:prod:api

run-worker-dist:
	pnpm run start:prod:worker

run-dev-dist:
	pnpm run start:prod:api > ../log/https-api.log

run-worker-dev-dist:
	pnpm run start:prod:worker > ../log/https-worker.log

# run app locally starting from worker API
run-dev:
	NODE_ENV=development \
	NODE_REDIS_URL=redis://0.0.0.0:6379/0 \
	NODE_PATH_KEY_CERT=../key.pem \
	NODE_PATH_CERT=../cert.pem \
	NODE_DATABASE_URL=mysql://root:password@0.0.0.0:32800/precision-fda \
	pnpm run start:dev:api

run-dev-local:
	NODE_REDIS_URL=redis://0.0.0.0:6379/0 \
	NODE_PATH_KEY_CERT=../key.pem \
	NODE_PATH_CERT=../cert.pem \
	NODE_DATABASE_URL=mysql://root:password@0.0.0.0:32800/precision-fda \
	pnpm run start:dev:api

run-worker-dev:
	NODE_REDIS_URL=redis://0.0.0.0:6379/0 \
	NODE_PATH_KEY_CERT=../key.pem \
	NODE_PATH_CERT=../cert.pem \
	NODE_DATABASE_URL=mysql://root:password@0.0.0.0:32800/precision-fda \
	pnpm run start:dev:worker

test-worker-task:
	$(bin)ts-node -r tsconfig-paths/register --files ./apps/worker/src/test.ts

watch:
	pnpm run start:dev:api

watch-worker:
	pnpm run start:dev:worker

# maps to npm script build commands in every package
build:
	pnpm run build

run-prettier:
	$(bin)prettier --write ./apps/**/src/**/*.ts

run-worker-repl:
	$(bin)bull-repl

test-shared:
	NODE_ENV=test $(bin)mocha --config ./libs/shared/.mocharc.js \
	--recursive "./libs/shared/test/**/*.spec.ts"

test-api:
	NODE_ENV=test $(bin)mocha --config ./apps/api/.mocharc.js \
	--recursive "./apps/api/test/**/*.spec.ts"

test-worker:
	NODE_ENV=test $(bin)mocha --config ./apps/worker/.mocharc.js \
	--recursive "./apps/worker/test/**/*.spec.ts"

test: test-api
	make test-worker

.PHONY:
clean:
	pnpm run clean

pristine:
	pnpm run clean
	pnpm run uninstall
	rm -rf ./temp

.PHONY: node_modules install clean pristine compile run-dist run-dev run-worker-dev build watch test-api test-worker run-worker-repl test run-dev-dist run-worker-dev-dist
