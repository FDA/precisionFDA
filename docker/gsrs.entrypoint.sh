#!/usr/bin/env bash

# init database
if [ ! $(mysql -ppassword -h ginasdb ixginas -sse "SHOW tables like 'ix_core_acl';") ]; then
  cd /srv/GSRSBackend
  ./activator -Dconfig.file=modules/ginas/conf/ginas-dev.conf ginas/dist
  cd /tmp
  jar xf /srv/GSRSBackend/modules/ginas/target/universal/ginas-*.zip
  rm /srv/GSRSBackend/modules/ginas/target/universal/ginas-*.zip
  mv ginas-* gsrs_dist
  cd gsrs_dist
  java -cp "lib/*" -Dconfig.file=conf/ginas-dev.conf ix.ginas.utils.Evolution
  rm -rf /tmp/gsrs_dist
fi

cd /srv/GSRSFrontend
npm run build:gsrs:prod
rsync -av --delete ./dist/browser/ /srv/GSRSBackend/modules/ginas/conf/beta

cd /srv/GSRSBackend
./activator -Dconfig.file=modules/ginas/conf/ginas-dev.conf ginas/run
