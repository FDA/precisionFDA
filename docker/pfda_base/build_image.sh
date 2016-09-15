#!/bin/bash

# copy over tools folder
mkdir tools
cp -r ../../tools/ ./tools

# build the Docker image and tag it
docker build -t precisionfda:ub14 .

# delete local copy of tools folder
rm -r tools
