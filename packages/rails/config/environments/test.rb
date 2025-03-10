# The test environment is used exclusively to run your application's
# test suite. You never need to work with it otherwise. Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs. Don't rely on the data there!

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  config.cache_classes = true

  # Do not eager load code on boot. This avoids loading your whole application
  # just for the purpose of running a single test. If you are using a tool that
  # preloads Rails for running tests, you may have to set it to true.
  config.eager_load = false

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    "Cache-Control" => "public, max-age=#{1.hour.to_i}",
  }

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Store uploaded files on the local file system in a temporary directory
  config.active_storage.service = :test

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false
  config.action_mailer.default_url_options = {
    host: "precisionfda-dev.dnanexus.com",
    protocol: "https",
  }

  config.action_mailer.smtp_settings = {
    address: ENV.fetch("SMTP_HOST"),
    port: ENV.fetch("SMTP_PORT"),
    user_name: ENV.fetch("SMTP_USER"),
    password: ENV.fetch("SMTP_PASSWORD"),
    tls: true,
  }

  config.action_mailer.delivery_method = :smtp
  config.action_mailer.perform_deliveries = true
  config.action_mailer.default_options = { from: ENV.fetch("SMTP_FROM_ADDRESS") }
  config.action_mailer.raise_delivery_errors = true

  # Randomize the order test cases are executed.
  config.active_support.test_order = :random

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Email us when an exception occurs
  Rails.application.config.middleware.use(
    ExceptionNotification::Rack,
    ignore_if: lambda do |env, _exception|
      ip = env["HTTP_X_FORWARDED_FOR"]

      begin
        ip.in?(%w(73.158.44.186 76.191.184.242)) ||
          IPAddr.new("64.39.96.0/20").include?(IPAddr.new(ip))
      rescue IPAddr::Error
        false
      end
    end,
    email: {
      email_prefix: "[PrecisionFDA-Dev] ",
      sender_address: "\"pFDA Dev\" <#{ENV.fetch('SMTP_FROM_ADDRESS')}>",
      exception_recipients: %w(precisionfda-dev@dnanexus.com),
      email_format: :html,
    },
  )
end
