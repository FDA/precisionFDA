#!/bin/sh
#
# N.B. run from packages/cli

VERSION=2.11.0
COMMITID=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)

if [ "$CI" = "true" ]; then
    export HOME=/go/src/dnanexus.com/precision-fda-cli
    export CGO_ENABLED=0
    USER_ARG="--user $(id -u):$(id -g)"
fi
BuildAndPackage() {
    PLATFORM=$1
    ARCH=$2
    BUILDTIME=$(date +%Y-%m-%d-%H%M%S)
    echo "Building pfda CLI (v$VERSION) for $PLATFORM $ARCH"
    docker run --rm $USER_ARG --mount type=bind,source="$(pwd)",target=/go/src/dnanexus.com/precision-fda-cli \
           -e GOOS="$PLATFORM" -e GOARCH="$ARCH" -e COMMITID="$COMMITID" \
           -e VERSION="$VERSION" -e BUILDTIME="$BUILDTIME" -e HOME="$HOME" -e CGO_ENABLED="$CGO_ENABLED" precisionfda-cli
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