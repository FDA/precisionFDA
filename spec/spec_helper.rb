require "sidekiq/testing"
require "simplecov"
require "webmock/rspec"
require "database_cleaner"
require "ffaker"

SimpleCov.start "rails" do
  add_filter "/app/errors/"
  add_filter "/app/extras/audit_log_user.rb"
  add_filter "/app/mailers/application_mailer.rb"
  add_filter "/bin/"
  add_filter "/db/"
  add_filter "/config/"
  add_filter "/spec/"
  add_filter "/https-apps-api/"
end

Dir["#{File.dirname(__FILE__)}/support/**/*.rb"].each { |f| require f }

RSpec.configure do |config|
  # we always want to run tests in test configuration
  # if developer does set env tests delete whole dev database
  ENV["RAILS_ENV"] = "test"
  ENV["HTTPS_APPS_API_URL"] = "https://localhost:3001"
  ENV["SMTP_HOST"] = "host"
  ENV["SMTP_PORT"] = "1"
  ENV["SMTP_USER"] = "user"
  ENV["SMTP_PASSWORD"] = "password"
  ENV["SMTP_FROM_ADDRESS"] = "from@address.com"

  config.filter_run focus: true
  config.run_all_when_everything_filtered = true
  config.include JsonResponse, type: :controller
  config.include UserContext

  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(
      :truncation,
      except: %w(ar_internal_metadata),
    )
    Rails.application.load_seed
  end

  config.around do |example|
    DatabaseCleaner.cleaning { example.run }
  end

  config.expect_with :rspec do |expectations|
    expectations.syntax = :expect
  end

  config.mock_with :rspec
  config.filter_run_when_matching :focus

  config.before do
    Sidekiq::Worker.clear_all

    stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{ORG_DUMMY}/invite").to_return(status: 404)
  end

  config.after { WebMock.reset! }
end
