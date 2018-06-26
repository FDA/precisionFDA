def without_transactional_fixtures(&block)
  self.use_transactional_fixtures = false

  before(:all) do
    DatabaseCleaner.strategy = :truncation
  end

  yield

  after(:all) do
    DatabaseCleaner.strategy = :transaction
  end
end
