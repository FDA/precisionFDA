# Defining shell is necessary in order to modify PATH
SHELL := sh
bin := node_modules/.bin/
export PATH := $(bin):$(PATH)

# testflags :=

# node_modules: package.json
# 	npm install && touch node_modules

install:
	yarn --frozen-lockfile

install-test-prod:
	yarn install --production=false --frozen-lockfile

# a demonstration on how to run built API
run-dist:
	node ./packages/api/dist/index.js

run-worker-dist:
	node ./packages/worker/dist/index.js

run-dev-dist:
	node ./packages/api/dist/index.js > ../log/https-api.log

run-worker-dev-dist:
	node ./packages/worker/dist/index.js > ../log/https-worker.log

# run app locally starting from worker API
run-dev:
	$(bin)ts-node -r tsconfig-paths/register --files ./packages/api/src/index.ts

run-worker-dev:
	$(bin)ts-node -r tsconfig-paths/register --files ./packages/worker/src/index.ts

test-worker-task:
	$(bin)ts-node -r tsconfig-paths/register --files ./packages/worker/src/test.ts

watch:
	$(bin)ts-node -r tsconfig-paths/register --files ./packages/api/src/index-dev.ts

watch-worker:
	$(bin)ts-node-dev -r tsconfig-paths/register --files ./packages/worker/src/index.ts

# maps to npm script build commands in every package
build:
	# Build packages/shared first otherwise api will fail
	yarn workspace @pfda/https-apps-shared build && \
	yarn workspaces run build

run-prettier:
	$(bin)prettier --write ./packages/**/src/**/*.ts

run-worker-repl:
	$(bin)bull-repl

test-api:
	NODE_ENV=test $(bin)mocha --config ./packages/api/.mocharc.js \
	--recursive "./packages/api/test/**/*.spec.ts"

test-worker:
	NODE_ENV=test $(bin)mocha --config ./packages/worker/.mocharc.js \
	--recursive "./packages/worker/test/**/*.spec.ts"

test: test-api
	make test-worker

.PHONY:
test-snyk:
	$(bin)snyk test --yarn-workspaces --strict-out-of-sync=false --policy_path=./.snyk

clean:
	yarn workspaces run clean

pristine:
	yarn workspaces run clean
	yarn workspaces run uninstall
	rm -rf ./temp && rm -rf ./node_modules

.PHONY: node_modules install clean pristine compile run-dist run-dev run-worker-dev build watch test-api test-worker run-worker-repl test run-dev-dist run-worker-dev-dist
