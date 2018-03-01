source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.7.1'
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
gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

# Annotate models
gem 'annotate', '~> 2.6.6'

# Support for OR queries (needed for UserFile.accessible_by)
gem 'activerecord_any_of'

# Parameter validation for the API
gem 'rails_param'

# WiceGrid is a Rails grid plugin: https://github.com/leikind/wice_grid
gem "wice_grid"

# Page-specific javascript for Rails done right
gem "paloma", "5.0.0"

# Websocket support (for fetching logs)
gem "websocket"

# Semantic versioning parsing
gem "semverly"

# Captcha
gem "humanizer"

# Excel spreadsheet generation
gem "axlsx", git: "https://github.com/randym/axlsx.git", branch: "release-3.0.0"

# Secure headers
gem 'secure_headers'

# Gravatar profile image helper
gem 'gravtastic'

# Adds pagination support to models
gem 'kaminari'
gem 'bootstrap-kaminari-views'

# For getting user's local time
gem 'local_time', '~> 1.0', '>= 1.0.3'

# For reCaptcha
gem "recaptcha", require: "recaptcha/rails"

# Add comments on any model
gem 'acts_as_commentable_with_threading'
gem 'acts_as_votable'
gem 'acts_as_follower'
gem 'acts-as-taggable-on'

# For inline-css in emails
gem 'inky-rb', require: 'inky'
gem 'nokogiri', '~> 1.8', '>= 1.8.2'
gem 'premailer-rails'

gem 'mysql2', '~> 0.3.18'
gem 'gretel'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# View outgoing HTTP requests
gem 'httplog'

group :development do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'

  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console', '~> 2.0'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
end

group :development, :test, :ui_test do
  gem 'thin'

  # Manage environment variables
  gem 'figaro'
  gem 'quiet_assets'

  # Project-wide environment variables
  gem 'dotenv-rails'
end

group :test do
  gem 'rspec-rails', '~> 3.7', '>= 3.7.1'
  gem 'factory_bot_rails', '~> 4.8', '>= 4.8.2'
  gem 'database_cleaner', '~> 1.5', '>= 1.5.3'
  gem 'webmock', '~> 3.1', '>= 3.1.1'
end

group :production do

  # Use Unicorn as the app server
  gem 'unicorn', '~> 4.9.0'
  gem 'exception_notification', '4.1.1'
end
