require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  test "no route matches user controller index" do
    assert_raises(ActionController::UrlGenerationError) do
      get :index
    end
  end

end
