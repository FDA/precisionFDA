file '/etc/cron.daily/usage_report' do
  content <<-EOF
  #!/bin/bash
  sudo su - deploy
  cd /srv/www/precision_fda/current && bundle exec rake usage_report:generate
  EOF

  mode '755'
end
