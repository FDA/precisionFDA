require "rails_helper"

RSpec.describe ApiController, type: :controller do # , focus: true do
  let(:user) { create(:user, dxuser: "user") }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:file_one) { create(:user_file, :private) }
  let(:folder_one) { create(:folder, :private) }
  let(:params) { { "scopes" => ["private"], "parent_folder_id" => "" } }

  describe "GET list_files" do
    context "js api" do
      before { authenticate!(user) }

      it "returns a list of files" do
        post :list_files
        expect(response).to have_http_status(200)
      end

      context "after 15 minutes inactivity" do
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

      context "after 15 minutes inactivity" do
        before { expire_session! }

        it "returns a list of files" do
          post :list_files
          expect(response).to have_http_status(200)
        end
      end
    end
  end

  describe "POST folder_tree" do
    before do
      authenticate!(user)
      file_one.update(user_id: user.id)
      folder_one.update(user_id: user.id)
    end
    context "js api" do
      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response.content_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size" do
        post :folder_tree, params
        expect(parsed_response.size).to eq(2)
      end

      it "returns a tree of folder with proper content" do
        post :folder_tree, params

        expect(parsed_response.first["uid"].first(5)).to eq("file-")
        expect(parsed_response.second["uid"]).to eq(nil)
        expect(parsed_response.second["type"]).to eq("Folder")
      end

      context "after 15 minutes inactivity" do
        before { expire_session! }

        it "returns a response with unauthorized http status" do
          post :folder_tree, params
          expect(response).to have_http_status(401)
        end
      end
    end

    context "api" do
      before { response_with_authorization_key!(user) }

      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response).to have_http_status(200)
      end

      context "after 15 minutes inactivity" do
        before { expire_session! }

        it "returns a http_status 200" do
          post :folder_tree, params
          expect(response.content_type).to eq "application/json"
        end

        it "returns a tree of folder" do
          post :folder_tree, params
          expect(response).to have_http_status(200)
        end

        it "returns a tree of folder of proper size" do
          post :folder_tree, params
          expect(parsed_response.size).to eq(2)
        end

        it "returns a tree of folder with proper content" do
          post :folder_tree, params

          expect(parsed_response.first["uid"].first(5)).to eq("file-")
          expect(parsed_response.second["uid"]).to eq(nil)
          expect(parsed_response.second["type"]).to eq("Folder")
        end
      end
    end
  end
end
