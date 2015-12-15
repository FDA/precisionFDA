require 'test_helper'

class ProfileControllerTest < ActionController::TestCase
  test "index without auth should redirect to login url" do
    get :index
    assert_redirected_to login_url
  end

end
