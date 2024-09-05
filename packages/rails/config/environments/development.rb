Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  if Rails.root.join("tmp", "caching-dev.txt").exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      "Cache-Control" => "public, max-age=#{2.days.to_i}",
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  # Don't care if the mailer can't send.
  # config.action_mailer.raise_delivery_errors = false
  # config.action_mailer.perform_caching = false

  config.action_mailer.delivery_method = ENV.fetch("DELIVERY_METHOD", :file).to_sym
  config.action_mailer.default_url_options = { host: "localhost", port: 3000, protocol: "https" }

  # debugging
  # config.action_mailer.delivery_method = :salesforce
  # config.action_mailer.perform_deliveries = true

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  config.sass.inline_source_maps = true
  config.sass.line_comments = false

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Asset digests allow you to set far-future HTTP expiration dates on all assets,
  # yet still be able to expire them through the digest params.
  config.assets.digest = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  # Mailers preview path
  config.action_mailer.preview_path = Rails.root.join("spec", "mailers", "preview")

  # Adds additional error checking when serving assets at runtime.
  # Checks for improperly declared sprockets dependencies.
  # Raises helpful error messages.
  config.assets.raise_runtime_errors = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # NOTE - ARM64V8 ENV variable
  # As ruby images have to be emulated on arm64v8 architectures, due to mysql2 not working properly
  # native packages, such as `inotify` won't compile. Ruby uses "ActiveSupport::FileUpdateChecker" by default
  # https://guides.rubyonrails.org/configuring.html#config-file-watcher

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker unless ENV["ARM64V8_DEVELOPMENT_PATCH"]

  # SSL
  config.force_ssl = true

  # Log level
  config.log_level = :debug

  # Allow access from any ip
  config.web_console.whiny_requests = false
end