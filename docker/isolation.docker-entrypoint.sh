#!/bin/sh

sleep 12

if [ -f ~/db_exists ]; then
  bundle exec rake db:migrate
else
  bundle exec rake db:setup &&
    bundle exec rake user:generate[user_1] &&
    bundle exec rake user:generate[user_2] &&
    bundle exec rake user:generate[user_3] &&
    touch ~/db_exists
fi

bundle exec thin --ssl --debug start
