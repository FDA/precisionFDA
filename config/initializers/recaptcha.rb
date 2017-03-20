Recaptcha.configure do |config|
  if ENV["DNANEXUS_BACKEND"] == "production"
    config.site_key  = ENV["RECAPTCHA_SITE_KEY"]
    config.secret_key = ENV["RECAPTCHA_SECRET_KEY"]
  else
    config.site_key  = ENV["RECAPTCHA_SITE_TEST_KEY"]
    config.secret_key = ENV["RECAPTCHA_SECRET_TEST_KEY"]
  end
end
