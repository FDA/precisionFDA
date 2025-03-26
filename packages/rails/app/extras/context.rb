#
# The context of a request -- available in all controllers and views
# once the user is logged in
#

class Context
  INVALID_TOKEN = "INVALID".freeze

  attr_accessor :user_id, :username, :token, :expiration, :org_id

  class << self
    # Build context from request's session
    #
    # @param [ActionDispatch::Request::Session] Session
    #
    # @return [Context] User's context
    def build(session)
      new(
        session["user_id"],
        session["username"],
        session["token"],
        session["expiration"],
        session["org_id"],
      )
    end
  end

  def initialize(user_id, username, token, expiration, org_id, cli_client = false)
    @user_id = user_id
    @username = username
    @token = token
    @expiration = expiration
    @org_id = org_id

    @cli_client = cli_client

    # Cache user, if logged in
    if logged_in?
      @user = User.find(@user_id)

      @user.expiration = @expiration
      @user.save!(validate: false)
    end
  end

  def user
    @user ||= nil
  end

  def cli_client?
    @client_cli
  end

  def gravatar_url
    @user.gravatar_url
  end

  def logged_in?
    @user_id.present? &&
      @username.present? &&
      @token.present? &&
      @expiration.present? &&
      (@expiration - Time.now.to_i) > 5.minutes &&
      @org_id.present? &&
      @user_id != -1 &&
      @token != INVALID_TOKEN &&
      @org_id != -1 &&
      (@user ? @user.enabled? : true)
  end

  def challenge_admin?
    user&.site_or_challenge_admin?
  end

  def challenge_evaluator?
    user&.is_challenge_evaluator?
  end

  def gov_user?
    user&.government_user?
  end

  def api
    @api ||= DNAnexusAPI.new(token)
  end

  delegate :can_create_challenges?, :can_create_spaces?,
           :can_administer_site?, :review_space_admin?,
           to: :user, allow_nil: true
end
