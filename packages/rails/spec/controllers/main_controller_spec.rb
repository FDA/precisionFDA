require "rails_helper"

RSpec.describe MainController, type: :controller do
  let!(:admin_user) { create(:user, dxuser: "admin", admin_groups: [create(:admin_group)]) }
  let!(:user) { create(:user, dxuser: "test") }
  let!(:attachments) do
    [
      create(:user_file),
      create(:asset),
      create(:app),
    ]
  end

  let!(:discussion) { create(:discussion, :with_attachments, user: user, attachments: attachments) }

  describe "POST publish admin" do
    before { authenticate!(admin_user) }

    it "doesn't raise an exception" do
      post :publish, params: { id: discussion.uid, scope: "public" }
    end
  end

  describe "POST publish regular user" do
    before { authenticate!(user) }

    it "does raise an exception" do
      expect { post :publish, params: { id: discussion.uid, scope: "public" } }.to raise_error("User is not allowed to publish any data objects")
    end
  end

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
