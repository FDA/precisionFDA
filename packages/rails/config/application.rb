require_relative "boot"
require_relative "../app/middleware/rack/permanent_redirect"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

require_relative "../app/extras/error_logger"

module PrecisionFda
  class Application < Rails::Application
    # Says whether autoload paths have to be added to $LOAD_PATH.
    # This flag is true by default, but it is recommended to be set to false in :zeitwerk mode.
    config.add_autoload_paths_to_load_path = false

    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.0

    config.autoloader = :zeitwerk

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    config.sass.preferred_syntax = :sass

    config.assets.precompile << "next_application.js"

    config.middleware.use Rack::PermanentRedirect

    config.middleware.insert 0,
                             Rack::UTF8Sanitizer,
                             sanitizable_content_types: ["application/x-www-form-urlencoded"],
                             only: %w(rack.input QUERY_STRING PATH_INFO),
                             strategy: :replace

    # Minimum Sass number precision required by bootstrap-sass
    ::SassC::Script::Value::Number.precision = [8, ::SassC::Script::Value::Number.precision].max

    config.active_record.belongs_to_required_by_default = false

    config.active_job.queue_adapter = :sidekiq

    # Don't force requests from old versions of IE to be UTF-8 encoded.
    config.action_view.default_enforce_utf8 = false

    # Embed purpose and expiry metadata inside signed and encrypted
    # cookies for increased security.
    #
    # This option is not backwards compatible with earlier Rails versions.
    # It's best enabled when your entire app is migrated and stable on 6.0.
    config.action_dispatch.use_cookies_with_metadata = true

    # Change the return value of `ActionDispatch::Response#content_type` to Content-Type header
    # without modification.
    config.action_dispatch.return_only_media_type_on_content_type = false

    # Send Active Storage analysis and purge jobs to dedicated queues.
    config.active_storage.queues.analysis = :active_storage_analysis
    config.active_storage.queues.purge    = :active_storage_purge

    # When assigning to a collection of attachments declared via `has_many_attached`, replace
    # existing attachments instead of appending. Use #attach to add new attachments without
    # replacing existing ones.
    config.active_storage.replace_on_assign_to_many = true

    # Use ActionMailer::MailDeliveryJob for sending parameterized and normal mail.
    #
    # The default delivery jobs (ActionMailer::Parameterized::DeliveryJob,
    # ActionMailer::DeliveryJob), will be removed in Rails 6.1. This setting is not backwards
    # compatible with earlier Rails versions.
    # If you send mail in the background, job workers need to have a copy of
    # MailDeliveryJob to ensure all delivery jobs are processed properly.
    # Make sure your entire app is migrated and stable on 6.0 before using this setting.
    config.action_mailer.delivery_job = "ActionMailer::MailDeliveryJob"

    # Enable the same cache key to be reused when the object being cached of type
    # `ActiveRecord::Relation` changes by moving the volatile information (max updated at and count)
    # of the relation's cache key into the cache version to support recycling cache key.
    config.active_record.collection_cache_versioning = true

    # Logging configuration
    log_directory_path = ENV.fetch("RAILS_LOG_DIRECTORY_PATH", "../../log/")
    log_output = File.join(log_directory_path, "backend.log")
    error_log_output = File.join(log_directory_path, "backend_errors.log")

    LOG_TO_STDOUT = ActiveRecord::Type::Boolean.new.cast(ENV["RAILS_LOG_TO_STDOUT"])
    LOG_OUTGOING_HTTP_REQUESTS = ActiveRecord::Type::Boolean.new.cast(ENV["LOG_REQUESTS"])

    if LOG_TO_STDOUT
      $stdout.sync = true
      log_output = $stdout
    end

    # Main logger logs everything either to the STDOUT or to the file specified in the log_output variable
    # The log level can be set differently for every environment in respective environment file (eg. development.rb),
    # variable config.log_level
    main_logger = ActiveSupport::Logger.new(log_output)
    main_logger.formatter = ::Logger::Formatter.new
    config.log_level = :debug

    # Error logger logs only messages having ERROR, FATAL and UNKNOWN severity
    # Log level of this logger cannot be overridden
    # The messages are written in file specified in the error_log_output variable
    err_logger = ErrorLogger.new(error_log_output)
    err_logger.formatter = ::Logger::Formatter.new
    err_logger.progname = "Ruby"

    main_logger.extend(ActiveSupport::Logger.broadcast(err_logger))

    # The logger is tagged, meaning one can tag the log messages, eg. in order ro assign them to a specific topic
    # https://api.rubyonrails.org/classes/ActiveSupport/TaggedLogging.html
    config.logger = ActiveSupport::TaggedLogging.new(main_logger)

    # Logging of outgoing HTTP requests, general logger setup (as configured above) is used
    # Controlled by the LOG_REQUESTS environment variable
    # The requests are logged as DEBUG messages. Make sure the appropriate log level is applied!
    # @see https://github.com/trusche/httplog#configuration
    HttpLog.configure do |httplog_config|
      httplog_config.enabled = false unless LOG_OUTGOING_HTTP_REQUESTS
      httplog_config.logger = config.logger
      httplog_config.log_headers = true
    end
  end
end
