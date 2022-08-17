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
              "challenge_new" => anything,
            ),
          ),
        )
      end
    end
  end

  describe "GET cloud_resources" do
    context "when user is authenticated" do
      let(:current_charges) do
        {
          computeCharges: 1.10,
          storageCharges: 0.35,
          dataEgressCharges: 0.15,
          totalCharges: 1.6,
        }
      end

      before do
        user.update(job_limit: 50, total_limit: 10)

        authenticate!(user)

        allow(Users::ChargesFetcher).to \
          receive(:fetch).and_return(current_charges)
      end

      it "responds with cloud resources properties" do
        get :cloud_resources

        expect(parsed_response).to include \
          current_charges.merge(jobLimit: 50, usageLimit: 10, usageAvailable: 8.4)
      end
    end

    context "when user is not authenticated" do
      before { get :cloud_resources }

      it_behaves_like "unauthenticated"
    end
  end
end
