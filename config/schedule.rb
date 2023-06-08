set :bundle_command, "/usr/local/bin/bundle exec"
set :output, "log/cron.log"

%w(
  SMTP_USER
  SMTP_PASSWORD
  SMTP_PORT
  SMTP_HOST
  SMTP_FROM_ADDRESS
).each do |name|
  env name, ENV[name]
end

every 1.day do
  rake "spaces:check_inactivity"
end

every 1.week do
  runner "PhoneConfirmationService.check_expired_phone_confirmations"
end

every 1.day do
  rake "usage_report:generate"
end
