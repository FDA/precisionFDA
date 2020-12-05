require_relative 'boot'
require_relative "../app/middleware/rack/permanent_redirect"

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

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

    # Bower asset paths
    root.join('vendor', 'assets', 'bower_components').to_s.tap do |bower_path|
      config.sass.load_paths << bower_path
      config.assets.paths << bower_path
    end

    # Precompile icon fonts
    config.assets.precompile << %r(bootstrap-sass/assets/fonts/bootstrap/[\w-]+\.(?:eot|svg|ttf|woff2?)$)

    config.middleware.use Rack::PermanentRedirect

    config.middleware.insert 0,
        Rack::UTF8Sanitizer,
        sanitizable_content_types: ['application/x-www-form-urlencoded'],
        only: ['rack.input', 'QUERY_STRING', 'PATH_INFO'],
        strategy: :replace

    # Minimum Sass number precision required by bootstrap-sass
    ::SassC::Script::Value::Number.precision = [8, ::SassC::Script::Value::Number.precision].max

    config.active_record.belongs_to_required_by_default = false

    config.active_job.queue_adapter = :sidekiq
  end
end
