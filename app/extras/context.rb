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
    return (@user_id.present? && @username.present? && @token.present? && @expiration.present? && ((@expiration - Time.now.to_i) > 5.minutes) && @org_id.present?)
  end
end
