RSpec::Matchers.define :match_schema do |schema|
  match do |response|
    @result = schema.call(JSON.parse(response.body, symbolize_names: true))
    @result.success?
  end

  def failure_message
    @result.errors
  end
end
