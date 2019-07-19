require "rails_helper"

RSpec.describe ApiController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }

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

  describe "POST create_file" do
    before do
      authenticate!(user)

      allow_any_instance_of(DNAnexusAPI).to(
        receive(:call).with("file", "new", anything).and_return(
          "id" => "file-Bx46ZqQ04Pz5Bq3x20pkBXP4"
        )
      )
    end

    context "when sends a file with incorrect params" do
      context "with empty name" do
        it "doesn't create a file" do
          post :create_file, description: "some_desc"

          expect(response).to_not have_http_status(200)
        end
      end
    end

    context "when sends a file with correct params" do
      it "creates a file" do
        post :create_file, name: "some_name", description: "some_desc"

        expect(response).to have_http_status(200)

        expect(UserFile.last.attributes).to include(
          "name" => "some_name",
          "description" => "some_desc",
          "dxid" => "file-Bx46ZqQ04Pz5Bq3x20pkBXP4",
          "parent_folder_id" => nil,
        )
      end

      it "creates a private file" do
        post :create_file, name: anything, public_scope: false

        expect(UserFile.last.project).to eq(user.private_files_project)
        expect(UserFile.last.scope).to eq("private")
      end

      it "creates a public file" do
        post :create_file, name: anything, public_scope: true

        expect(UserFile.last.project).to eq(user.public_files_project)
        expect(UserFile.last.scope).to eq("public")
      end

      context "when public_scope param doesn't exist" do
        it "creates a private file" do
          post :create_file, name: anything

          expect(UserFile.last.project).to eq(user.private_files_project)
          expect(UserFile.last.scope).to eq("private")
        end
      end
    end
  end
end
