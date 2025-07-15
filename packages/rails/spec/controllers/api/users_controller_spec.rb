require "rails_helper"

RSpec.describe Api::UsersController, type: :controller do
  let(:user) { create(:user, dxuser: "user-1") }

  describe "GET show" do
    before do
      authenticate!(user)

      get :show
    end

    it "responds with a success" do
      expect(response).to have_http_status(:success)
    end

    it "responds with the current user" do
      expect(parsed_response).to include("user" => hash_including("dxuser" => "user-1"))
    end

  end

end
