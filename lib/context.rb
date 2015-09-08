#
# The context of a request -- available in all controllers and views
# once the user is logged in
#

class Context
  attr_accessor :username, :token, :expiration

  def initialize(username, token, expiration)
    @username = username
    @token = token
    @expiration = expiration
  end

  def logged_in?
    return (@username.present? && @token.present? && @expiration.present? && ((@expiration - Time.now.to_i) > 5.minutes))
  end
end
