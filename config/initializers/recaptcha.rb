Recaptcha.configure do |config|
  if Rails.env.production?
    config.site_key  = ENV["RECAPTCHA_SITE_KEY"]
    config.secret_key = ENV["RECAPTCHA_SECRET_KEY"]
  else
    config.site_key  = ENV["RECAPTCHA_SITE_TEST_KEY"]
    config.secret_key = ENV["RECAPTCHA_SECRET_TEST_KEY"]
  end
end

Recaptcha.configuration.skip_verify_env += %w(development ui_test)
