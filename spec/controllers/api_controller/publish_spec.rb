require 'rails_helper'

RSpec.describe ApiController, type: :controller do

  let(:user) { create(:user, dxuser: "user") }
  let(:app) { create(:app, user_id: user.id) }


  describe "POST publish" do

    before { authenticate!(user) }

    it "publishes an app" do
      expect(Event::AppPublished).to receive(:create_for)

      post :publish , params: {
        scope: "public",
        uids: [app.uid],
      }

      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}system/greet")
      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{app.dxid}/addAuthorizedUsers").with(body: {
        authorizedUsers: [ORG_EVERYONE]
      })

      expect(WebMock).to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{app.dxid}/publish").with(body: {})
      expect(parsed_response["published"]).to eql(1)
    end

  end
end
