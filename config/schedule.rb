set :bundle_command, "/usr/local/bin/bundle exec"

[
  "DNANEXUS_BACKEND",
  "SALESFORCE_USERNAME",
  "SALESFORCE_PASSWORD",
  "SALESFORCE_SECRET_TOKEN",
  "SALESFORCE_HOST",
  "SALESFORCE_FDA_EMAIL_ID",
  "SALESFORCE_NOTIFIER_EMAIL_ID",
].each do |name|
  env name, ENV[name]
end

every 1.hour do
  runner "TasksChecker.check_tasks_for_failed_response_deadline"
  runner "TasksChecker.check_tasks_for_failed_completion_deadline"
end

every 1.day do
  rake "spaces:check_inactivity"
end
