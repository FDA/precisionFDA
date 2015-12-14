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
end
