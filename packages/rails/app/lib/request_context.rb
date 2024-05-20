# Request context class that takes user_id, username and token
# at the begining of the request. These are available for all classes
# during execution of the request.
class RequestContext
  attr_accessor :user_id, :username, :token

  def self.instance
    Thread.current[:request_context]
  end

  # Allows the use of this scope from rake/scripts
  # ContextScope.with_scope do |scope|
  #   # do something
  #   ...
  # end
  def self.with_scope
    # even documentation suggests this style https://guides.rubyonrails.org/action_controller_overview.html
    # rubocop:disable Style/RedundantBegin
    begin
      begin_request
      yield(instance)
    ensure
      end_request
    end
    # rubocop:enable Style/RedundantBegin
  end

  def self.begin_request(user_id = nil, username = nil, token = nil)
    Rails.logger.info("Beginning request with user id: #{user_id}, username: #{username}, "\
                      "token: #{Rails.env.production? ? 'masked' : token}")

    raise "request_context already set" if Thread.current[:request_context]

    Thread.current[:request_context] = RequestContext.new(user_id, username, token) if user_id && username && token
  end

  def self.end_request
    Thread.current[:request_context] = nil
  end

  def initialize(user_id, username, token)
    @user_id = user_id
    @username = username
    @token = token
  end
end
