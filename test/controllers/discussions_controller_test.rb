require 'test_helper'

class DiscussionsControllerTest < ActionController::TestCase
  test "should get featured" do
    get :featured
    assert_response :success
  end

  test "should get explore" do
    get :explore
    assert_response :success
  end

end
