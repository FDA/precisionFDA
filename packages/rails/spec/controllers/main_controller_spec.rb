require "rails_helper"

RSpec.describe MainController, type: :controller do
  let!(:admin_user) { create(:user, dxuser: "admin", admin_groups: [create(:admin_group)]) }
  let!(:user) { create(:user, dxuser: "test") }

  describe "GET return_from_login" do
    before do
      stub_request(:any, %r{#{ENV['HTTPS_APPS_API_URL']}/account/checkup.*}).to_return(status: 200)
    end

    it "doesn't flash an error" do
      get :return_from_login, params: { code: "123" }
      expect(flash[:error]).to be_falsey
    end

    context "when reached the limit of sessions" do
      before do
        SESSIONS_LIMIT.times do
          authenticate!(user)
          reset_session
        end
      end

      it "flashes an error" do
        get :return_from_login, params: { code: "123" }
        expect(flash[:error]).to be_present
      end
    end
  end
end
