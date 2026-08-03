SHELL := bash

# Read VERSION relative to this Makefile, not to make's cwd, so -f from
# elsewhere reads the right file - as build-dist.sh does with $(dirname "$0").
# The error is what makes this safe: $(shell cat) reports a missing file on
# stderr and then expands to nothing, which would otherwise stamp the binary
# with an empty -X main.Version and still exit 0.
CLI_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
VERSION := $(strip $(shell cat $(CLI_DIR)VERSION))
ifeq ($(VERSION),)
$(error cannot read $(CLI_DIR)VERSION, which every build target needs to stamp the binary)
endif
ARCH := amd64
COMMITID := $(shell git rev-parse HEAD)

.PHONY: build-docker test build-darwin build-linux build-windows dist

build-docker:
	docker build -t precisionfda-cli .

test:
	docker run --rm --entrypoint go \
		--mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-w /go/src/dnanexus.com/precision-fda-cli precisionfda-cli test -v ./...

build-darwin:
	$(eval PLATFORM=darwin)
	$(eval BUILDTIME=$(shell date +%Y-%m-%d-%H%M%S))
	docker run --rm --mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-e GOOS="$(PLATFORM)" -e GOARCH="$(ARCH)" -e COMMITID="$(COMMITID)" \
		-e VERSION="$(VERSION)" -e BUILDTIME="$(BUILDTIME)" precisionfda-cli

build-linux:
	$(eval PLATFORM=linux)
	$(eval BUILDTIME=$(shell date +%Y-%m-%d-%H%M%S))
	docker run --rm --mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-e GOOS="$(PLATFORM)" -e GOARCH="$(ARCH)" -e COMMITID="$(COMMITID)" \
		-e VERSION="$(VERSION)" -e BUILDTIME="$(BUILDTIME)" precisionfda-cli

build-windows:
	$(eval PLATFORM=windows)
	$(eval BUILDTIME=$(shell date +%Y-%m-%d-%H%M%S))
	docker run --rm --mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-e GOOS="$(PLATFORM)" -e GOARCH="$(ARCH)" -e COMMITID="$(COMMITID)" \
		-e VERSION="$(VERSION)" -e BUILDTIME="$(BUILDTIME)" precisionfda-cli

dist:
	./build-dist.sh
