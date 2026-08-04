#!/bin/sh
#
# N.B. run from packages/cli

set -eu

# Single source of truth for the CLI version lives in the VERSION file.
VERSION=$(tr -d '[:space:]' < "$(dirname "$0")/VERSION")
COMMITID=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)

# Native Go FIPS builds don't need CGO; keep binaries statically linked everywhere.
export CGO_ENABLED=0

USER_ARG=""
GOMODCACHE_DIR=""
GOCACHE_DIR=""
if [ "${CI:-}" = "true" ]; then
    export HOME=/go/src/dnanexus.com/precision-fda-cli
    export GOMODCACHE_DIR="/go/src/dnanexus.com/precision-fda-cli/.go_cache/pkg/mod"
    export GOCACHE_DIR="/go/src/dnanexus.com/precision-fda-cli/.go_cache/cache"
    USER_ARG="--user $(id -u):$(id -g)"
fi
BuildAndPackage() {
    PLATFORM=$1
    ARCH=$2
    BUILDTIME=$(date +%Y-%m-%d-%H%M%S)
    echo "Building pfda CLI (v$VERSION) for $PLATFORM $ARCH"
    docker run --rm $USER_ARG --mount type=bind,source="$(pwd)",target=/go/src/dnanexus.com/precision-fda-cli \
           -e GOOS="$PLATFORM" -e GOARCH="$ARCH" -e COMMITID="$COMMITID" \
           -e VERSION="$VERSION" -e BUILDTIME="$BUILDTIME" -e HOME="$HOME" -e CGO_ENABLED="$CGO_ENABLED" \
           -e GOMODCACHE="$GOMODCACHE_DIR" -e GOCACHE="$GOCACHE_DIR" precisionfda-cli
    cd ./dist

    OUT_FILE=pfda_${PLATFORM}_${ARCH}
    if [ ! -f "$OUT_FILE" ]; then
        echo
        echo "$OUT_FILE does not exist. Exiting"
        exit 1
    fi

    EXEC_NAME="pfda"
    [ "$PLATFORM" = "windows" ] && EXEC_NAME="pfda.exe"

    mv ${OUT_FILE} ${EXEC_NAME}

    PKG_SUFFIX="${SHORT_SHA}"

    if [ "$PLATFORM" = "windows" ]; then
        zip -rj pfda-${PLATFORM}-${VERSION}-${PKG_SUFFIX}.zip ${EXEC_NAME}
    else
        tar -czvf pfda-${PLATFORM}-${VERSION}-${PKG_SUFFIX}.tar.gz ${EXEC_NAME}
    fi
    rm ${EXEC_NAME}

    cd ..
}

BuildAndPackage 'linux' 'amd64'
BuildAndPackage 'darwin' 'amd64'
BuildAndPackage 'windows' 'amd64'