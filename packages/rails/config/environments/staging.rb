Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = false

  # Ensures that a master key has been made available in either ENV["RAILS_MASTER_KEY"]
  # or in config/master.key. This key is used to decrypt credentials (and other encrypted files).
  # config.require_master_key = true

  # Disable serving static files from the `/public` folder by default since
  # Apache or NGINX already handles this.
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?

  # Compress JavaScripts and CSS.
  config.assets.js_compressor = :terser
  # config.assets.css_compressor = :sass

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = true

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.action_controller.asset_host = 'http://assets.example.com'

  # Asset digests allow you to set far-future HTTP expiration dates on all assets,
  # yet still be able to expire them through the digest params.
  config.assets.debug = false
  config.assets.digest = true

  # Segmentation fault fix during bundle exec rake assets:precompile
  # https://github.com/rails/sprockets/issues/633
  config.assets.configure do |env|
    env.export_concurrent = false
  end

  # `config.assets.precompile` and `config.assets.version`
  # have moved to config/initializers/assets.rb

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = 'X-Sendfile' # for Apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for NGINX

  # Store uploaded files on the local file system (see config/storage.yml for options)
  config.active_storage.service = :local

  # Mount Action Cable outside main process or domain
  # config.action_cable.mount_path = nil
  # config.action_cable.url = 'wss://example.com/cable'
  # config.action_cable.allowed_request_origins = [ 'http://example.com', /http:\/\/example.*/ ]

  # Use the lowest log level to ensure availability of diagnostic information
  # when problems arise.
  config.log_level = :debug

  # Prepend all log lines with the following tags.
  # config.log_tags = [ :request_id ]

  # Use a different logger for distributed setups.
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)

  # Use a different cache store in production.
  # config.cache_store = :mem_cache_store

  # Use a real queuing backend for Active Job (and separate queues per environment)
  # config.active_job.queue_adapter     = :resque
  # config.active_job.queue_name_prefix = "pfda_#{Rails.env}"

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false
  config.action_mailer.default_url_options = {
    host: "precisionfda-staging.dnanexus.com",
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

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = true

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
      email_prefix: "[PrecisionFDA-Stage] ",
      sender_address: "\"pFDA Staging\" <#{ENV.fetch('SMTP_FROM_ADDRESS')}>",
      exception_recipients: %w(precisionfda-dev@dnanexus.com),
      email_format: :html,
    },
  )
end
