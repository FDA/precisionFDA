require 'rails_helper'

RSpec.describe ApiController, type: :controller do

  let(:user) { create(:user, dxuser: "user") }

  describe "GET list_files" do

    context "js api" do
      before { authenticate!(user) }

      it "returns a list of files" do
        post :list_files
        expect(response).to have_http_status(200)
      end

      context "after 20 minutes inactivity" do
        before { expire_session! }

        it "returns a response with unauthorized http status" do
          post :list_files
          expect(response).to have_http_status(401)
        end
      end

    end

    context "api" do
      before { response_with_authorization_key!(user) }


      it "returns a list of files" do
        post :list_files
        expect(response).to have_http_status(200)
      end

      context "after 20 minutes inactivity" do
        before { expire_session! }

        it "returns a list of files" do
          post :list_files
          expect(response).to have_http_status(200)
        end
      end

    end
  end
end
