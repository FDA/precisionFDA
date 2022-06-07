SHELL := bash
VERSION := 2.1
ARCH := amd64
COMMITID := $(shell git rev-parse HEAD)

build-docker:
	docker build -t precisionfda-cli .

test:
	pwd = $(shell pwd)
	docker run --rm --entrypoint go \
		--mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-w /go/src/dnanexus.com/precision-fda-cli precisionfda-cli test -v ./...

build-darwin:
	pwd = $(shell pwd)
	$(eval PLATFORM=darwin)
	$(eval BUILDTIME=$(shell date +%Y-%m-%d-%H%M%S))
	docker run --rm --mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-e GOOS="$(PLATFORM)" -e GOARCH="$(ARCH)" -e COMMITID="$(COMMITID)" \
		-e VERSION="$(VERSION)" -e BUILDTIME="$(BUILDTIME)" precisionfda-cli

build-linux:
	pwd = $(shell pwd)
	$(eval PLATFORM=linux)
	$(eval BUILDTIME=$(shell date +%Y-%m-%d-%H%M%S))
	docker run --rm --mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-e GOOS="$(PLATFORM)" -e GOARCH="$(ARCH)" -e COMMITID="$(COMMITID)" \
		-e VERSION="$(VERSION)" -e BUILDTIME="$(BUILDTIME)" precisionfda-cli

build-windows:
	pwd = $(shell pwd)
	$(eval PLATFORM=windows)
	$(eval BUILDTIME=$(shell date +%Y-%m-%d-%H%M%S))
	docker run --rm --mount type=bind,source="$(CURDIR)",target=/go/src/dnanexus.com/precision-fda-cli \
		-e GOOS="$(PLATFORM)" -e GOARCH="$(ARCH)" -e COMMITID="$(COMMITID)" \
		-e VERSION="$(VERSION)" -e BUILDTIME="$(BUILDTIME)" precisionfda-cli

dist:
	./build-dist.sh
