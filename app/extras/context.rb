#
# The context of a request -- available in all controllers and views
# once the user is logged in
#

class Context
  attr_accessor :user_id, :username, :token, :expiration, :org_id

  def initialize(user_id, username, token, expiration, org_id)
    @user_id = user_id
    @username = username
    @token = token
    @expiration = expiration
    @org_id = org_id

    # Cache user, if logged in
    if logged_in?
      @user = User.find(@user_id)
    end
  end

  def user
    raise "context.user called for guest context" if guest?
    @user
  end

  def gravatar_url
    guest? ? "https://secure.gravatar.com/avatar/00000000000000000000000000000000.png?d=mm&r=PG" : @user.gravatar_url
  end

  def logged_in?
    return (@user_id.present? && @username.present? && @token.present? && @expiration.present? && ((@expiration - Time.now.to_i) > 5.minutes) && @org_id.present?) && (@user_id != -1 && @token != "INVALID" && @org_id != -1)
  end

  def guest?
    return (@user_id == -1 && @username.start_with?("Guest-") && @token == "INVALID" && @expiration.present? && ((@expiration - Time.now.to_i) > 5.minutes) && @org_id == -1)
  end

  def can_create_spaces?
    return false unless logged_in?
    user.can_administer_site? || review_space_admin?
  end

  def can_administer_site?
    logged_in? && user.can_administer_site?
  end

  def challenge_admin?
    logged_in? && user.is_challenge_admin?
  end

  def challenge_evaluator?
    logged_in? && user.is_challenge_evaluator?
  end

  def logged_in_or_guest?
    return logged_in? || guest?
  end

  def valid_publish_targets_for(item)
    targets = item.is_a?(Workflow) ? [] : ["public"]
    if logged_in?
      targets += active_spaces_for(item).map(&:uid)
    end
    targets.select { |t| item.publishable_by?(self, t) }
  end

  def active_spaces_for(item)
    if item.is_a?(Workflow)
      @user.active_spaces.review
    else
      @user.active_spaces
    end
  end

  def api
    @api ||= DNAnexusAPI.new(token)
  end

  def review_space_admin?
    logged_in? && user.review_space_admin?
  end
end
