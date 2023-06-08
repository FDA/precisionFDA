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
	NODE_ENV=development \
	NODE_REDIS_URL=redis://0.0.0.0:6379/0 \
	NODE_PATH_KEY_CERT=../key.pem \
	NODE_PATH_CERT=../cert.pem \
	NODE_DATABASE_URL=mysql://root:password@0.0.0.0:32800/precision-fda \
	$(bin)ts-node-dev --transpile-only -r tsconfig-paths/register --files ./packages/api/src/index.ts

run-dev-local:
	NODE_REDIS_URL=redis://0.0.0.0:6379/0 \
	NODE_PATH_KEY_CERT=../../../key.pem \
	NODE_PATH_CERT=../../../cert.pem \
	NODE_DATABASE_URL=mysql://root:password@0.0.0.0:32800/precision-fda \
	yarn workspace @pfda/https-apps-api dev

run-worker-dev:
	NODE_REDIS_URL=redis://0.0.0.0:6379/0 \
	NODE_PATH_KEY_CERT=../../../key.pem \
	NODE_PATH_CERT=../../../cert.pem \
	NODE_DATABASE_URL=mysql://root:password@0.0.0.0:32800/precision-fda \
	$(bin)ts-node-dev -r tsconfig-paths/register --files ./packages/worker/src/index.ts

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

test-shared:
	NODE_ENV=test $(bin)mocha --config ./packages/shared/.mocharc.js \
	--recursive "./packages/shared/test/**/*.spec.ts"

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
