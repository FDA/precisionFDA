# Colima Guide

To avoid using Docker Desktop and the licensing issues that come with using it. Colima is an alternative that works in the same way, however there is no user interface software for the container runtime. Colima may be slower than Docker Desktop 

This guide contains steps to get started with colima on PFDA

https://github.com/abiosoft/colima

_Last updated: 19.06.2024_

## Install
- `brew install docker`
- `brew install colima`

## Start Colima
- `colima start -f --cpu 4 --memory 12 --disk 20`

## Run PFDA
- From inside the project root `make run`

## Docker Viewers
- VSCode Extension for Docker - https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker
  - restart/remove containers
  - inspect files
  - view logs
  - ssh into containers
