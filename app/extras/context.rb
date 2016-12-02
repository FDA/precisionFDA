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
    return @user
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

  def logged_in_or_guest?
    return logged_in? || guest?
  end

  def valid_publish_targets_for(item)
    targets = ["public"]
    if logged_in?
      targets += @user.active_spaces.map(&:uid)
    end
    return targets.select { |t| item.publishable_by?(self, t) }
  end
end
