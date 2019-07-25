require "rails_helper"

RSpec.describe ApiController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
  let(:user_two) { create(:user, dxuser: "user_two") }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:file_one) { create(:user_file, :private) }
  let(:file_two) { create(:user_file, :public) }
  let(:file_three) { create(:user_file, :private) }
  let(:file_four) { create(:user_file, :private) }
  let(:file_space_member_one) { create(:user_file, :private) }
  let(:folder_one) { create(:folder, :private) }
  let(:folder_two) { create(:folder) }
  let(:verified_space) do
    FactoryBot.create(:space, :verification, :verified, host_lead_id: user.id)
  end
  let(:verified_space_uid) { verified_space.uid }
  let(:review_space) do
    FactoryBot.create(:space, :review, host_lead_id: user.id, guest_lead_id: user_two.id)
  end
  let(:review_space_uid) { review_space.uid }

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

  describe "POST folder_tree has no user's files and folders" do
    let(:params) do
      {
        "parent_folder_id" => "",
        "scoped_parent_folder_id" => "",
        "scopes" => ["private"],
      }
    end

    before do
      authenticate!(user)
    end

    context "js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params
        expect(response.content_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response).to have_http_status(200)
      end

      it "returns an empty tree of zero size" do
        allow_any_instance_of(User).to receive(:space_uids).and_return([review_space_uid])
        post :folder_tree, params
        expect(parsed_response.size).to eq 0
        expect(parsed_response).to eq([])
      end
    end
  end

  describe "POST folder_tree for 'private' scope" do
    let(:params) { { "parent_folder_id" => "", "scopes" => ["private"] } }

    before do
      authenticate!(user)
      file_one.update(user_id: user.id)
      file_two.update(user_id: user.id)
      file_three.update(user_id: user.id, scope: verified_space_uid)
      file_four.update(user_id: user.id, scope: verified_space_uid)
      folder_one.update(user_id: user.id)
      folder_two.update(user_id: user.id, scope: verified_space_uid)
    end

    context "js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params
        expect(response.content_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size" do
        allow_any_instance_of(User).to receive(:space_uids).and_return([verified_space_uid])
        post :folder_tree, params
        expect(parsed_response.size).to eq 2
      end

      it "returns a tree of folder with proper content" do
        allow_any_instance_of(User).to receive(:space_uids).and_return([verified_space_uid])
        post :folder_tree, params

        expect(parsed_response.first["uid"].first(5)).to eq("file-")
        expect(parsed_response.first["type"]).to eq("UserFile")
        expect(parsed_response.first["scope"]).to eq("private")

        expect(parsed_response.second["uid"]).to be_nil
        expect(parsed_response.second["type"]).to eq("Folder")
        expect(parsed_response.second["scope"]).to eq("private")
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

        it "returns a content_type 'json'" do
          post :folder_tree, params
          expect(response.content_type).to eq "application/json"
        end

        it "returns a tree of folder" do
          post :folder_tree, params
          expect(response).to have_http_status(200)
        end

        it "returns a tree of folder of proper size" do
          allow_any_instance_of(User).to receive(:space_uids).and_return([review_space_uid])
          post :folder_tree, params
          expect(parsed_response.size).to eq 2
        end

        it "returns a tree of folder with proper content" do
          allow_any_instance_of(User).to receive(:space_uids).and_return([review_space_uid])
          post :folder_tree, params

          expect(parsed_response.first["uid"].first(5)).to eq("file-")
          expect(parsed_response.first["type"]).to eq("UserFile")
          expect(parsed_response.first["scope"]).to eq("private")

          expect(parsed_response.second["uid"]).to be_nil
          expect(parsed_response.second["type"]).to eq("Folder")
          expect(parsed_response.second["scope"]).to eq("private")
        end
      end
    end
  end

  describe "POST folder_tree for 'space-XXX' scope" do
    let(:params) do
      {
        "parent_folder_id" => "",
        "scoped_parent_folder_id" => "",
        "scopes" => [review_space_uid],
      }
    end

    before do
      authenticate!(user)
      file_one.update(user_id: user.id)
      file_two.update(user_id: user.id)
      file_three.update(user_id: user.id, scope: review_space_uid)
      file_four.update(user_id: user.id, scope: review_space_uid)
      folder_one.update(user_id: user.id)
      folder_two.update(user_id: user.id, scope: review_space_uid)
      allow_any_instance_of(User)
        .to receive(:space_uids)
        .with([review_space_uid])
        .and_return([review_space_uid])
      allow(Space).to receive(:space_members_ids).and_return([user.id])
    end

    context "js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params
        expect(response.content_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size" do
        post :folder_tree, params
        expect(parsed_response.size).to eq 3
      end

      it "returns a tree of folder with proper content" do
        post :folder_tree, params

        expect(parsed_response.first["uid"].first(5)).to eq("file-")
        expect(parsed_response.first["type"]).to eq("UserFile")
        expect(parsed_response.first["scope"]).to eq(review_space_uid)

        expect(parsed_response.second["uid"].first(5)).to eq("file-")
        expect(parsed_response.second["type"]).to eq("UserFile")
        expect(parsed_response.second["scope"]).to eq(review_space_uid)

        expect(parsed_response.third["uid"]).to be_nil
        expect(parsed_response.third["type"]).to eq("Folder")
        expect(parsed_response.third["scope"]).to eq(review_space_uid)
      end
    end
  end

  describe "POST folder_tree for 'space-XXX' scope with space member's files" do
    let(:params) do
      {
        "parent_folder_id" => "",
        "scoped_parent_folder_id" => "",
        "scopes" => [review_space_uid],
      }
    end

    before do
      authenticate!(user)
      file_one.update(user_id: user.id)
      file_two.update(user_id: user.id)
      file_three.update(user_id: user.id, scope: review_space_uid)
      file_four.update(user_id: user.id, scope: review_space_uid)
      file_space_member_one.update(user_id: user_two.id, scope: review_space_uid)
      folder_one.update(user_id: user.id)
      folder_two.update(user_id: user.id, scope: review_space_uid)
      allow_any_instance_of(User)
        .to receive(:space_uids)
        .with([review_space_uid])
        .and_return([review_space_uid])
      allow(Space).to receive(:space_members_ids).and_return([user.id, user_two.id])
    end

    context "js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params
        expect(response.content_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size with space member file" do
        post :folder_tree, params
        expect(parsed_response.size).to eq 4
      end

      it "returns a tree of folder with proper content with space member file" do
        post :folder_tree, params

        expect(parsed_response.first["uid"].first(5)).to eq("file-")
        expect(parsed_response.first["type"]).to eq("UserFile")
        expect(parsed_response.first["scope"]).to eq(review_space_uid)

        expect(parsed_response.second["uid"].first(5)).to eq("file-")
        expect(parsed_response.second["type"]).to eq("UserFile")
        expect(parsed_response.second["scope"]).to eq(review_space_uid)

        expect(parsed_response.third["uid"].first(5)).to eq("file-")
        expect(parsed_response.third["type"]).to eq("UserFile")
        expect(parsed_response.third["scope"]).to eq(review_space_uid)

        expect(parsed_response[3]["uid"]).to be_nil
        expect(parsed_response[3]["type"]).to eq("Folder")
        expect(parsed_response[3]["scope"]).to eq(review_space_uid)
      end
    end
  end

  describe "POST folder_tree for multiple scopes with space member's files" do
    let(:params) do
      {
        "parent_folder_id" => "",
        "scoped_parent_folder_id" => "",
        "scopes" => [review_space_uid, verified_space_uid],
      }
    end

    before do
      authenticate!(user)
      file_one.update(user_id: user.id)
      file_two.update(user_id: user.id)
      file_three.update(user_id: user.id, scope: review_space_uid)
      file_four.update(user_id: user.id, scope: verified_space_uid)
      file_space_member_one.update(user_id: user_two.id, scope: verified_space_uid)
      folder_one.update(user_id: user.id)
      folder_two.update(user_id: user.id, scope: verified_space_uid)

      allow_any_instance_of(User)
        .to receive(:space_uids).and_return([review_space_uid, verified_space_uid])
      allow(Space).to receive(:space_members_ids).and_return([user.id, user_two.id])
    end

    context "js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params
        expect(response.content_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size with space member file" do
        post :folder_tree, params
        expect(parsed_response.size).to eq 4
      end

      it "returns a tree of folder with proper content with space member file" do
        post :folder_tree, params

        expect(parsed_response.first["uid"].first(5)).to eq("file-")
        expect(parsed_response.first["type"]).to eq("UserFile")
        expect(parsed_response.first["scope"]).to eq(review_space_uid)

        expect(parsed_response.second["uid"].first(5)).to eq("file-")
        expect(parsed_response.second["type"]).to eq("UserFile")
        expect(parsed_response.second["scope"]).to eq(verified_space_uid)

        expect(parsed_response.third["uid"].first(5)).to eq("file-")
        expect(parsed_response.third["type"]).to eq("UserFile")
        expect(parsed_response.third["scope"]).to eq(verified_space_uid)

        expect(parsed_response[3]["uid"]).to be_nil
        expect(parsed_response[3]["type"]).to eq("Folder")
        expect(parsed_response[3]["scope"]).to eq(verified_space_uid)
      end
    end
  end

  describe "POST create_file"  do
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
