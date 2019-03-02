require 'rails_helper'

RSpec.describe MainController, type: :controller do

  let!(:user) { create(:user, dxuser: "test") }
  let!(:attachments) do
    [
      create(:user_file),
      create(:asset),
      create(:app)
    ]
  end
  let!(:discussion) { create(:discussion, :with_attachments, user: user, attachments: attachments) }

  describe "POST publish" do

    before { authenticate!(user) }

    it "doesn't raise an exception" do
      post :publish, id: discussion.uid, scope: "public"
    end

  end

  describe "GET return_from_login" do

    it "doesn't flash an error" do
      get :return_from_login, code: "123"
      expect(flash[:error]).to be_falsey
    end

    context "reached the limit of sessions " do
      before do
        SESSIONS_LIMIT.times do
          authenticate!(user)
          reset_session
        end
      end

      it "flashes an error" do
        get :return_from_login, code: "123"
        expect(flash[:error]).to be_present
      end
    end

  end
end
