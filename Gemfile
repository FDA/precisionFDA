source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.11'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.1.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
gem 'therubyracer', platforms: :ruby

# Turnout gem is used to manage maintenance pages
gem 'turnout', '~> 2.2.0'

# Use jquery as the JavaScript library
gem 'jquery-rails', '~> 4.3', '>= 4.3.1'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks', '= 5.0.0'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

# Support for OR queries (needed for UserFile.accessible_by)
gem 'activerecord_any_of'

# Support for bulk inserting data using ActiveRecord
gem 'activerecord-import'

# Parameter validation for the API
gem 'rails_param'

# WiceGrid is a Rails grid plugin: https://github.com/leikind/wice_grid
gem 'wice_grid'

# Page-specific javascript for Rails done right
gem 'paloma', '5.0.0'

# Websocket support (for fetching logs)
gem 'websocket'

# Affix sprocket version as per vuln derscribed in PFDA-495
gem 'sprockets', '> 3.7.1'

# Semantic versioning parsing
gem 'semverly'

# Captcha
gem 'humanizer'

# Excel spreadsheet generation
gem 'axlsx', '3.0.0.pre'

# Secure headers
gem 'secure_headers', '~> 6.0'

# Gravatar profile image helper
gem 'gravtastic'

# Adds pagination support to models
gem 'bootstrap-kaminari-views'
gem 'kaminari'

# For getting user's local time
gem 'local_time', '~> 1.0', '>= 1.0.3'

# For reCaptcha
gem 'recaptcha', require: 'recaptcha/rails'

# Add comments on any model
gem 'acts-as-taggable-on'
gem 'acts_as_commentable_with_threading'
gem 'acts_as_follower'
gem 'acts_as_votable'

# For inline-css in emails
gem 'inky-rb', require: 'inky'
gem 'nokogiri', '~> 1.8', '>= 1.8.5'
gem 'premailer-rails'

gem 'whenever', require: false

gem 'mysql2'

gem 'gretel'

gem 'rack-utf8_sanitizer', '~> 1.6'

# View outgoing HTTP requests
gem 'httplog'

gem 'simple_form'

# PDF builder
gem 'prawn'

gem 'aws-sdk-sns'
gem 'parallel'

group :development do
  # Annotate models
  gem 'annotate', '~> 2.6.6'

  gem 'letter_opener'

  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console', '~> 2.0'

  # Spring speeds up development by keeping your application running
  # in the background. Read more: https://github.com/rails/spring
  gem 'spring'

  # Automatic Ruby code checking tool
  gem 'rubocop', require: false

  gem 'pronto', '~> 0.9.5'
  gem 'pronto-rubocop', '~> 0.9.0', require: false
end

group :development, :test, :ui_test do
  gem 'byebug'
  gem 'pry'
  gem 'pry-rails'
  gem 'pry-remote'
  gem 'pry-stack_explorer'
  gem 'pry-byebug'
  # Project-wide environment variables
  gem 'dotenv-rails'
  # Manage environment variables
  gem 'figaro'
  gem 'quiet_assets'
  gem 'thin'
  gem 'brakeman', '~> 3.3.3'

end

group :test, :ui_test do
  gem 'database_cleaner', '~> 1.5', '>= 1.5.3'
  gem 'factory_bot_rails', '~> 4.8', '>= 4.8.2'
  gem 'rspec-rails', '~> 3.7', '>= 3.7.1'
  gem 'webmock', '~> 3.1', '>= 3.1.1'
  gem 'shoulda-matchers'
  gem 'ffaker'
  gem 'simplecov', require: false
  gem 'ruby_dep', '~> 1.3.1'
  gem 'guard', '2.13.0'
  gem 'guard-rspec', require: false
end

group :production do
  gem 'exception_notification', '4.1.1'
  # Use Unicorn as the app server
  gem 'unicorn', '~> 4.9.0'
  gem 'soapforce'
end

gem 'rubyzip', '=1.2.2'

