source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "2.3.8"

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem "rails", "~> 5.2.3"
# Use SCSS for stylesheets
gem "sass-rails", "~> 5.0"
# Use Uglifier as compressor for JavaScript assets
gem "uglifier", ">= 1.3.0"
# Use CoffeeScript for .coffee assets and views
gem "coffee-rails", "~> 4.2"

# Use jquery as the JavaScript library
gem "jquery-rails", "~> 4.3", ">= 4.3.1"
# Turbolinks makes navigating your web application faster
gem "turbolinks", "~> 5"
# Build JSON APIs with ease
gem "jbuilder", "~> 2.5"

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", ">= 1.1.0", require: false

# bundle exec rake doc:rails generates the API under doc/api.
gem "sdoc", group: :doc

# Support for bulk inserting data using ActiveRecord
gem "activerecord-import"

# Parameter validation for the API (used only in comparisons controller)
gem "rails_param"

# WiceGrid is a Rails grid plugin: https://github.com/leikind/wice_grid
gem "wice_grid"

# Page-specific javascript for Rails done right
gem "paloma", "~> 5.1.0"

# Websocket support (for fetching logs)
gem "websocket"

# Affix sprocket version as per vuln derscribed in PFDA-495
gem "sprockets", ">= 3.7.2"

gem "hashdiff", [">= 1.0.0.beta1", "< 2.0.0"]

# Captcha
gem "humanizer"

# For reCaptcha
gem "recaptcha", require: "recaptcha/rails"

# Excel spreadsheet generation
gem "axlsx", "3.0.0.pre"

# Secure headers
gem "secure_headers", "~> 6.0"

# Gravatar profile image helper
gem "gravtastic"

# Adds pagination support to models
gem "bootstrap-kaminari-views"
gem "kaminari"

# For getting user's local time
gem "local_time"

# Add comments on any model
gem "acts-as-taggable-on", "~> 6.0"
gem "acts_as_commentable_with_threading"
gem "acts_as_follower", github: "tcocca/acts_as_follower", branch: "master"
gem "acts_as_votable"

# For inline-css in emails
gem "inky-rb", require: "inky"
gem "premailer-rails"

gem "whenever", require: false

gem "mysql2"

gem "gretel"

gem "rack-utf8_sanitizer", "~> 1.6"

# View outgoing HTTP requests
gem "httplog"

gem "simple_form", "~> 5.0.0"

# PDF builder
gem "prawn"

gem "aws-sdk-sns"
gem "execjs"
gem "parallel"
gem "therubyracer"

gem "dry-container"

group :development do
  # Annotate models
  gem "annotate"

  # Access an interactive console on exception pages or by calling 'console' anywhere in the code
  gem "web-console"

  gem "listen", ">= 3.0.5", "< 3.2"

  # Automatic Ruby code checking tool
  gem "rubocop", "~> 0.71.0", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false

  gem "pronto", "~> 0.10.0"
  gem "pronto-rubocop", require: false

  gem "byebug", platforms: %i(mri mingw x64_mingw)

  gem "pry"
  gem "pry-byebug"
  gem "pry-rails"
  gem "pry-remote"
  gem "pry-stack_explorer"

  gem "guard"
  gem "guard-rspec", require: false
end

group :development, :test, :ui_test do
  gem "brakeman"
  gem "dotenv-rails"
  gem "thin"
end

group :test, :ui_test do
  gem "database_cleaner", "~> 1.5", ">= 1.5.3"
  gem "factory_bot_rails", "~> 4.8", ">= 4.8.2"
  gem "ffaker"
  gem "rails-controller-testing"
  gem "rspec-rails", "~> 3.7", ">= 3.7.1"
  gem "shoulda-matchers"
  gem "simplecov", require: false
  gem "webmock", "~> 3.1", ">= 3.1.1"
end

group :production do
  gem "exception_notification", "4.1.1"
  gem "soapforce"
  gem "unicorn", "~> 4.9.0"
end

gem "rubyzip", "=1.3.0"
