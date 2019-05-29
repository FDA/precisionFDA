file '/etc/cron.daily/usage_report' do
  content <<-EOF
#!/bin/bash

su -c 'cd /srv/www/precision_fda/current && RAILS_ENV=production bundle exec rake usage_report:generate' -s /bin/bash deploy
EOF

  mode '755'
end
