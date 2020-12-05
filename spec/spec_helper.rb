require "sidekiq/testing"
require "simplecov"
require "webmock/rspec"

SimpleCov.start "rails" do
  add_filter "/app/errors/"
  add_filter "/app/extras/audit_log_user.rb"
  add_filter "/app/mailers/application_mailer.rb"
  add_filter "/bin/"
  add_filter "/db/"
  add_filter "/config/"
  add_filter "/spec/"
end

Dir["#{File.dirname(__FILE__)}/support/**/*.rb"].each { |f| require f }

RSpec.configure do |config|
  config.filter_run focus: true
  config.run_all_when_everything_filtered = true

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
