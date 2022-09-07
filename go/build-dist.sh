#!/bin/sh
#
# N.B. run from precision-fda/go

VERSION=2.1.2
COMMITID=`git rev-parse HEAD`

BuildAndPackage() {
    PLATFORM=$1
    ARCH=$2
    BUILDTIME=$(date +%Y-%m-%d-%H%M%S)
    echo "Building pfda CLI (v$VERSION) for $PLATFORM $ARCH"
    docker run --rm --mount type=bind,source="$(pwd)",target=/go/src/dnanexus.com/precision-fda-cli \
           -e GOOS="$PLATFORM" -e GOARCH="$ARCH" -e COMMITID="$COMMITID" \
           -e VERSION="$VERSION" -e BUILDTIME="$BUILDTIME" precisionfda-cli
    cd ./dist

    OUT_FILE=pfda_${PLATFORM}_${ARCH}
    if [ ! -f "$OUT_FILE" ]; then
        echo
        echo "$OUT_FILE does not exist. Exiting"
        exit 1
    fi

    EXEC_NAME="pfda"
    if [ $PLATFORM = "windows" ]; then
        EXEC_NAME="pfda.exe"
    fi

    mv ${OUT_FILE} ${EXEC_NAME}

    if [ $PLATFORM = "windows" ]; then
        zip -rj pfda-${PLATFORM}-${VERSION}.zip ${EXEC_NAME}
    else
        tar -czvf pfda-${PLATFORM}-${VERSION}.tar.gz ${EXEC_NAME}
    fi
    rm ${EXEC_NAME}

    cd ..
}

BuildAndPackage 'linux' 'amd64'
BuildAndPackage 'darwin' 'amd64' # N.B. darwin is macOS
BuildAndPackage 'windows' 'amd64'
