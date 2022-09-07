#!/bin/bash

sed -i '/^#/!s/CipherString = DEFAULT@SECLEVEL=2/#CipherString = DEFAULT@SECLEVEL=2/g' /etc/ssl/openssl.cnf

cp config/database.sample.yml config/database.yml

service mysql start

bundle exec rake db:setup
bundle exec rake user:generate_test_users
bundle exec thin --ssl -d start

#warm up
result=7
while [[ "$result" == 7 ]]
do
  curl -k -o /dev/null https://localhost:3000
  result=$?
  sleep 1
done

echo "Server up"

suite=${TEST_SUITE:-fullregression}

echo "Running suite $suite"

cd test/functional && mvn -B test -Dsuite=$suite.xml -Dheadless=true -Denv=loc

#save logs and screenshots
rm -rf /log_storage/docker
mkdir /log_storage/docker
mv /precision-fda/test/functional/target/debug-log/* /log_storage/
chmod -R 777 /log_storage/docker
