#!/bin/bash

API_URL="https://precision.fda.gov/api/v2/cli/version/latest"
VERSION=$(curl -s "$API_URL" | jq -r '.version')
echo "Installing pfda CLI version ${VERSION}"
cd /tmp
curl -O https://pfda-production-static-files.s3.amazonaws.com/cli/pfda-linux-${VERSION}.tar.gz
tar xvf pfda-linux-${VERSION}.tar.gz
chmod +x pfda
sudo mv pfda /usr/bin
