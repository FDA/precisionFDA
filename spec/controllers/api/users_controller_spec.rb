require "rails_helper"

RSpec.describe Api::UsersController, type: :controller do
  describe "GET show" do
    let(:user) { create(:user, dxuser: "user-1") }

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

    context "when user is allowed to create a space" do
      let(:user) { create(:user, :review_admin) }

      it "responds with a link to a new space page" do
        expect(parsed_response).to include(
          "meta" => hash_including(
            "links" => hash_including(
              "space_info" => anything,
              "space_create" => anything,
            ),
          ),
        )
      end
    end

    context "when user isn't allowed to create a space" do
      it "doesn't respond with a link to a new space page and space info" do
        expect(parsed_response).not_to include(
          "meta" => hash_including(
            "links" => hash_including(
              "space_info" => anything,
              "space_create" => anything,
            ),
          ),
        )
      end
    end
  end
end
