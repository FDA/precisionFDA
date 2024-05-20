Recaptcha.configure do |config|
  config.enterprise = true
  config.site_key = ENV["RECAPTCHA_SITE_KEY"]
  config.enterprise_api_key = ENV["RECAPTCHA_API_KEY"]
  config.enterprise_project_id = ENV["RECAPTCHA_PROJECT_ID"]
end

Recaptcha.configuration.skip_verify_env += %w(development ui_test)
