require 'rails_helper'

RSpec.describe MainController, type: :controller do

  let!(:user) { create(:user, dxuser: "user_1") }
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

    it "doesn't raise a exception" do
      post :publish, id: discussion.uid, scope: "public"
    end

  end

end
