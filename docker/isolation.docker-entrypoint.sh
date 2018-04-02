#!/bin/sh

sleep 12

if [ -f ~/db_exists ]; then
  bundle exec rake db:migrate
else
  bundle exec rake db:setup &&
   bundle exec rake user:generate_test_users
fi

bundle exec thin --ssl --debug start
