#!/bin/bash
docker build -t pfda_ui -f docker/build/ui_test.Dockerfile . && \
docker run \
-e PFDA_AT_USER_1_PASSWORD_LOC=$PFDA_PASSWORD \
-e PFDA_AT_USER_2_PASSWORD_LOC=$PFDA_PASSWORD \
-e PFDA_AT_USER_ADMIN_PASSWORD_LOC=$PFDA_PASSWORD \
-e PFDA_BASIC_AUTH_DNX_PASSWORD_LOC=$DNX_STAGING_PASSWORD \
-e TEST_SUITE=$TEST_SUITE \
--mount type=bind,source="$(pwd)"/tmp/,target=/log_storage \
pfda_ui
