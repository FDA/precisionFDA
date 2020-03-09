set :bundle_command, "/usr/local/bin/bundle exec"
set :output, "log/cron.log"

%w(
  DNANEXUS_BACKEND
  SALESFORCE_USERNAME
  SALESFORCE_PASSWORD
  SALESFORCE_SECRET_TOKEN
  SALESFORCE_HOST
  SALESFORCE_FDA_EMAIL_ID
  SALESFORCE_NOTIFIER_EMAIL_ID
  SECRET_KEY_BASE
).each do |name|
  env name, ENV[name]
end

every 1.hour do
  runner "TasksChecker.check_tasks_for_failed_response_deadline"
  runner "TasksChecker.check_tasks_for_failed_completion_deadline"
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
