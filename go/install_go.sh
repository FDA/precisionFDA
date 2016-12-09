#!/bin/bash

VERSION="1.7.1"
LOCALPATH="/usr/local"

if [ "$#" -ge 1 ] && [ "$1" == "linux" ]; then
  FILENAME="go${VERSION}.linux-amd64.tar.gz"
else
  FILENAME="go${VERSION}.darwin-amd64.tar.gz"
fi

echo ">>Retrieving go${VERSION} source archive: $FILENAME"
curl -O "https://storage.googleapis.com/golang/${FILENAME}"

echo ">>Extracting files from archive..."
tar -C "$LOCALPATH" -xzf "$FILENAME"

echo ">>Writing env settings to '${HOME}/.bash_profile'"
EXPORT_PATH="export PATH=\"\$PATH:${LOCALPATH}/go/bin:\$HOME/go/bin\""
if ! grep "$EXPORT_PATH" "${HOME}/.bash_profile"
then
  echo "$EXPORT_PATH" >> "${HOME}/.bash_profile"
fi
EXPORT_GOPATH="export GOPATH=\"\$HOME/go\""
if ! grep "$EXPORT_GOPATH" "${HOME}/.bash_profile"
then
  echo "$EXPORT_GOPATH" >> "${HOME}/.bash_profile"
fi

echo ">>Setting current session env"
export PATH="${PATH}:${LOCALPATH}/go/bin:${HOME}/go/bin"
export GOPATH="${HOME}/go"

echo ">>Adding additional go packages..."
echo "  + go get github.com/hashicorp/go-retryablehttp"
go get github.com/hashicorp/go-retryablehttp
echo "  + go get github.com/golang/lint/golint"
go get github.com/golang/lint/golint

echo ">>Cleaning up..."
rm "$FILENAME"

echo ">>Done! Installed version: go${VERSION}. Confirm your installation by running 'go version' in a new terminal or first running 'source ~/.bash_profile'."
