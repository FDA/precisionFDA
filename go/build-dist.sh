#!/bin/sh
#
# N.B. run this as the repo root

VERSION=2.0.1

BuildAndPackage() {
    PLATFORM=$1
    ARCH=$2
    BUILDTIME=$(date +%Y-%m-%d-%H%M%S)
    echo "Building pfda CLI (v$VERSION) for $PLATFORM $ARCH"
    docker run --rm --mount type=bind,source="$(pwd)/go",target=/go/src/dnanexus.com/precision-fda-cli \
           -e GOOS="$PLATFORM" -e GOARCH="$ARCH" \
           -e VERSION="$VERSION" -e BUILDTIME="$BUILDTIME" goboring
    cd ./go/dist
    mv pfda_${PLATFORM}_${ARCH} pfda
    tar -czvf pfda-${PLATFORM}-${VERSION}.tar.gz pfda
    rm pfda
    cd ../..
}

BuildAndPackage 'linux' 'amd64'
BuildAndPackage 'darwin' 'amd64'
BuildAndPackage 'windows' 'amd64'
