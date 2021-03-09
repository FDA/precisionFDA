require "rails_helper"
# rubocop:disable RSpec/AnyInstance

RSpec.describe ApiController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
  let(:user_two) { create(:user, dxuser: "user_two") }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:challenge_bot) { create(:user, dxuser: "challenge.bot") }
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
    context "with js api" do
      before { authenticate!(user) }

      it "returns a list of files" do
        post :list_files
        expect(response).to have_http_status(200)
      end

      context "when after 15 minutes inactivity" do
        before { expire_session! }

        it "returns a response with unauthorized http status" do
          post :list_files
          expect(response).to have_http_status(401)
        end
      end
    end

    context "with api" do
      before { response_with_authorization_key!(user) }

      it "returns a list of files" do
        post :list_files
        expect(response).to have_http_status(200)
      end

      context "when after 15 minutes inactivity" do
        before { expire_session! }

        it "returns a list of files" do
          post :list_files
          expect(response).to have_http_status(200)
        end
      end
    end
  end

  describe "POST related_to_publish" do
    let(:app_series) { create(:app_series) }
    let(:app) { create(:app, app_series_id: app_series.id) }
    let(:job) { create(:job, app_id: app.id, app_series_id: app_series.id) }

    before do
      authenticate!(user)
      allow_any_instance_of(SpaceService::Publishing).
        to receive(:scope_check).
        with(params[:scope]).
        and_return(scope: params[:scope])
    end

    context "when api call with app" do
      let(:params) do
        {
          uid: app.uid,
          scope: review_space_uid,
        }
      end

      before do
        allow_any_instance_of(App).to receive(:accessible_by?).and_return(true)
      end

      it "returns a content_type 'json'" do
        post :related_to_publish, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :related_to_publish, params: params
        expect(response).to have_http_status 200
      end

      it "returns an empty array of children for the App object" do
        post :related_to_publish, params: params
        expect(parsed_response).to eq []
      end
    end

    context "when api call with job" do
      let(:params) do
        {
          uid: job.uid,
          scope: review_space_uid,
        }
      end

      before do
        allow_any_instance_of(Job).to receive(:accessible_by?).and_return(true)
        allow_any_instance_of(App).to receive(:accessible_by?).and_return(true)
      end

      it "returns a content_type 'json'" do
        post :related_to_publish, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :related_to_publish, params: params
        expect(response).to have_http_status 200
      end

      it "returns a non empty array of children for the Job object" do
        post :related_to_publish, params: params
        expect(parsed_response).not_to eq []
      end

      it "returns an array of children contains an App object" do
        post :related_to_publish, params: params
        expect(parsed_response[0]["uid"]).to eq app.uid
      end

      it "returns an array where child contains path and fa_class of an App object" do
        post :related_to_publish, params: params
        child = parsed_response[0]
        expect(child["path"]).to eq "/apps/".concat(app.uid)
        expect(child["fa_class"]).to eq "fa-cube"
      end

      context "when app is public" do
        before do
          app.update(scope: "public")
        end

        it "returns an empty array of children for the App object" do
          post :related_to_publish, params: params
          expect(parsed_response).to eq []
        end
      end

      context "when app is published in a space" do
        before do
          app.update(scope: review_space_uid)
        end

        it "returns an empty array of children for the App object" do
          post :related_to_publish, params: params
          expect(parsed_response).to eq []
        end
      end
    end
  end

  describe "POST folder_tree has no user's files and folders" do
    let(:params) do
      {
        "parent_folder_id" => "",
        "scoped_parent_folder_id" => "",
        "scopes" => %w(private),
      }
    end

    before do
      authenticate!(user)
    end

    context "with js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params: params
        expect(response).to have_http_status(200)
      end

      it "returns an empty tree of zero size" do
        allow_any_instance_of(User).to receive(:space_uids).and_return([review_space_uid])
        post :folder_tree, params: params
        expect(parsed_response.size).to eq 0
        expect(parsed_response).to eq([])
      end
    end
  end

  describe "POST folder_tree for 'private' scope" do
    let(:params) { { "parent_folder_id" => "", "scopes" => %w(private) } }

    before do
      authenticate!(user)
      file_one.update(user_id: user.id)
      file_two.update(user_id: user.id)
      file_three.update(user_id: user.id, scope: verified_space_uid)
      file_four.update(user_id: user.id, scope: verified_space_uid)
      folder_one.update(user_id: user.id)
      folder_two.update(user_id: user.id, scope: verified_space_uid)
    end

    context "with js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params: params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size" do
        allow_any_instance_of(User).to receive(:space_uids).and_return([verified_space_uid])
        post :folder_tree, params: params
        expect(parsed_response.size).to eq 2
      end

      it "returns a tree of folder with proper content" do
        allow_any_instance_of(User).to receive(:space_uids).and_return([verified_space_uid])
        post :folder_tree, params: params

        expect(parsed_response.first["uid"].first(5)).to eq("file-")
        expect(parsed_response.first["type"]).to eq("UserFile")
        expect(parsed_response.first["scope"]).to eq("private")

        expect(parsed_response.second["uid"]).to be_nil
        expect(parsed_response.second["type"]).to eq("Folder")
        expect(parsed_response.second["scope"]).to eq("private")
      end

      context "when after 15 minutes inactivity" do
        before { expire_session! }

        it "returns a response with unauthorized http status" do
          post :folder_tree, params: params
          expect(response).to have_http_status(401)
        end
      end
    end

    context "with api" do
      before { response_with_authorization_key!(user) }

      it "returns a http_status 200" do
        post :folder_tree, params: params
        expect(response).to have_http_status(200)
      end

      context "when after 15 minutes inactivity" do
        before { expire_session! }

        it "returns a content_type 'json'" do
          post :folder_tree, params: params
          expect(response.media_type).to eq "application/json"
        end

        it "returns a tree of folder" do
          post :folder_tree, params: params
          expect(response).to have_http_status(200)
        end

        it "returns a tree of folder of proper size" do
          allow_any_instance_of(User).to receive(:space_uids).and_return([review_space_uid])
          post :folder_tree, params: params
          expect(parsed_response.size).to eq 2
        end

        it "returns a tree of folder with proper content" do
          allow_any_instance_of(User).to receive(:space_uids).and_return([review_space_uid])
          post :folder_tree, params: params

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
      allow_any_instance_of(User).
        to receive(:space_uids).
        with([review_space_uid]).
        and_return([review_space_uid])
      allow(Space).to receive(:space_members_ids).and_return([user.id])
    end

    context "js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params: params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size" do
        post :folder_tree, params: params
        expect(parsed_response.size).to eq 3
      end

      it "returns a tree of folder with proper content" do
        post :folder_tree, params: params

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

  describe "POST create_challenge_card_image" do
    let(:file_card) { create(:user_file, :private, description: "description") }
    let(:params) { { name: file_card.name, description: file_card.description } }
    let(:opts) { { name: params[:name], project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT } }
    let(:dxid) { rand(10_000).to_s }

    before do
      authenticate!(user)
      file_card.update(id: dxid)
      allow_any_instance_of(DNAnexusAPI).to receive(:call).
        with("file", "new", opts).and_return(file_card)
      allow_any_instance_of(UserFile).to receive(:id).and_return(dxid)
    end

    context "when user is site admin" do
      before { allow_any_instance_of(User).to receive(:can_administer_site?).and_return(true) }

      context "with js api" do
        it "returns a content_type 'json'" do
          post :create_challenge_card_image, params: params
          expect(response.media_type).to eq "application/json"
        end

        it "returns a http_status 200" do
          post :create_challenge_card_image, params: params
          expect(response).to have_http_status 200
        end

        it "returns a challenge card image file uid" do
          post :create_challenge_card_image, params: params
          expect(parsed_response["id"]).to eq dxid.concat("-1")
        end

        it "returns a public challenge card image file" do
          post :create_challenge_card_image, params: params
          file = UserFile.find_by(uid: parsed_response["id"])
          expect(file.scope).to eq "public"
        end
      end
    end

    context "when user can not administer site" do
      it "returns a http_status 204 with no content" do
        post :create_challenge_card_image, params: params
        expect(response).to have_http_status 204
      end
    end

    context "when name is not valid" do
      context "when name is not a String" do
        before { params[:name] = 1 }

        it "returns a http_status 204 with no content" do
          post :create_challenge_card_image, params: params
          expect(response).to have_http_status 204
        end
      end

      context "when name is an empty string" do
        before { params[:name] = "" }

        it "returns a http_status 204 with no content" do
          post :create_challenge_card_image, params: params
          expect(response).to have_http_status 204
        end
      end
    end

    context "when description is not valid" do
      context "when description is not a String" do
        before { params[:description] = 1 }

        it "returns a http_status 204 with no content" do
          post :create_challenge_card_image, params: params
          expect(response).to have_http_status 204
        end
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
      allow_any_instance_of(User).
        to receive(:space_uids).
        with([review_space_uid]).
        and_return([review_space_uid])
      allow(Space).to receive(:space_members_ids).and_return([user.id, user_two.id])
    end

    context "with js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params: params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size with space member file" do
        post :folder_tree, params: params
        expect(parsed_response.size).to eq 4
      end

      it "returns a tree of folder with proper content with space member file" do
        post :folder_tree, params: params

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

    context "with js api" do
      it "returns a content_type 'json'" do
        post :folder_tree, params: params
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        post :folder_tree, params: params
        expect(response).to have_http_status(200)
      end

      it "returns a tree of folder of proper size with space member file" do
        post :folder_tree, params: params
        expect(parsed_response.size).to eq 4
      end

      it "returns a tree of folder with proper content with space member file" do
        post :folder_tree, params: params

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

  describe "POST files_regex_search" do
    before do
      authenticate!(user)
    end

    context "with valid search RegEx string" do
      let(:params) do
        {
          page: 1,
          search_string: "abc",
          flag: "ig",
          scopes: %w(private),
          order_by_name: "asc",
        }
      end

      before { post :files_regex_search, params: params }

      it "returns a content_type 'json'" do
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 200" do
        expect(response).to have_http_status(200)
      end
    end

    context "with invalid search RegEx string" do
      let(:params) do
        {
          page: 1,
          search_string: "*",
          flag: "ig",
          scopes: %w(private),
          order_by_name: "asc",
        }
      end

      before { post :files_regex_search, params: params }

      it "returns a content_type 'json'" do
        expect(response.media_type).to eq "application/json"
      end

      it "returns a http_status 422" do
        expect(response).to have_http_status(422)
      end

      it "returns an error message" do
        expect(parsed_response["error"]["message"]).to include "RegEx Invalid:"
        expect(parsed_response["error"]["type"]).to eq "API Error"
      end
    end

    context "when user has no any user's files" do
      let(:params) do
        {
          page: 1,
          search_string: "abc",
          flag: "ig",
          scopes: %w(private),
          order_by_name: "asc",
        }
      end

      before do
        allow_any_instance_of(User).to receive(:space_uids).and_return([review_space_uid])
        post :files_regex_search, params: params
      end

      context "with js api" do
        it "returns a content_type 'json'" do
          expect(response.media_type).to eq "application/json"
        end

        it "returns a http_status 200" do
          expect(response).to have_http_status(200)
        end

        it "has no any files and folders" do
          expect(UserFile.all.count).to eq 0
          expect(Folder.all.count).to eq 0
        end

        it "returns an empty tree of zero size" do
          expect(parsed_response["search_result"]).to eq []
        end
      end
    end

    context "when user has user's files in 'private' scope in folders and 'desc' order selected" do
      let(:params) do
        {
          page: 1,
          search_string: "fil",
          flag: "ig",
          scopes: %w(private),
          order_by_name: "desc",
        }
      end

      before do
        allow_any_instance_of(User).to receive(:space_uids).and_return([verified_space_uid])
        file_one.update(user_id: user.id)
        file_two.update(user_id: user.id, parent_folder_id: folder_one.id)
        file_three.update(user_id: user.id, parent_folder_id: folder_two.id)
        file_four.update(user_id: user.id, parent_folder_id: folder_two.id)
        folder_one.update(user_id: user.id)
        folder_two.update(user_id: user.id, scope: verified_space_uid)

        post :files_regex_search, params: params
      end

      context "with js api" do
        let(:result) { parsed_response["search_result"] }

        it "returns a content_type 'json'" do
          expect(response.media_type).to eq "application/json"
        end

        it "returns a http_status 200" do
          expect(response).to have_http_status(200)
        end

        it "returns a search result of proper size" do
          expect(result.size).to eq 3
        end

        it "returns a search result with a proper content of first result" do
          expect(result.first["title"]).to eq(file_three.name)
          expect(result.first["path"]).to eq("/#{folder_two.name}/")
        end

        it "returns a search result with a proper content of second result" do
          expect(result.second["title"]).to eq(file_four.name)
          expect(result.second["path"]).to eq("/#{folder_two.name}/")
        end

        it "returns a search result with a proper content of third result" do
          expect(result.third["title"]).to eq(file_one.name)
          expect(result.third["path"]).to eq("/")
        end
      end

      context "with no request to return found files uids" do
        let(:params) do
          {
            page: 1,
            search_string: "fil",
            flag: "ig",
            scopes: %w(private),
            order_by_name: "asc",
            uids: nil,
          }
        end

        it "returns a content_type 'json' with http status 200" do
          expect(response.media_type).to eq "application/json"
          expect(response).to have_http_status(200)
        end

        it "do not return an array of found files uids" do
          expect(parsed_response["uids"]).to eq []
        end
      end

      context "with request to return found files uids array" do
        let(:params) do
          {
            page: 1,
            search_string: "fil",
            flag: "ig",
            scopes: %w(private),
            order_by_name: "asc",
            uids: true,
          }
        end

        it "returns a content_type 'json' with http status 200" do
          expect(response.media_type).to eq "application/json"
          expect(response).to have_http_status(200)
        end

        it "returns an array of found files uids" do
          expect(parsed_response["uids"]).to include(file_one.uid && file_two.uid && file_three.uid)
        end
      end
    end

    context "when user has user's files in a space scope and 'desc' order selected" do
      let(:params) do
        {
          page: 1,
          search_string: "fil",
          flag: "ig",
          scopes: [review_space_uid, verified_space_uid],
          order_by_name: "desc",
        }
      end

      before do
        allow_any_instance_of(User).
          to receive(:space_uids).and_return([review_space_uid, verified_space_uid])
        file_one.update(user_id: user.id)
        file_two.update(user_id: user.id, parent_folder_id: folder_one.id)
        file_three.update(
          user_id: user.id,
          scoped_parent_folder_id: folder_two.id,
          scope: review_space_uid,
        )
        file_four.update(
          user_id: user.id,
          scoped_parent_folder_id: folder_two.id,
          scope: verified_space_uid,
        )
        folder_one.update(user_id: user.id)
        folder_two.update(user_id: user.id, scope: verified_space_uid)

        post :files_regex_search, params: params
      end

      context "with js api" do
        let(:result) { parsed_response["search_result"] }

        it "returns a content_type 'json'" do
          expect(response.media_type).to eq "application/json"
        end

        it "returns a http_status 200" do
          expect(response).to have_http_status(200)
        end

        it "returns a search result of proper size" do
          expect(result.size).to eq 2
        end

        it "returns a search result with a proper content" do
          expect(result.first["title"]).to eq(file_three.name)
          expect(result.second["title"]).to eq(file_four.name)
          expect(result.second["path"]).to eq("/#{folder_two.name}/")
        end
      end
    end
  end

  describe "POST create_file" do
    before do
      authenticate!(user)

      allow_any_instance_of(DNAnexusAPI).to(
        receive(:call).with("file", "new", anything).and_return(
          "id" => "file-Bx46ZqQ04Pz5Bq3x20pkBXP4",
        )
      )
    end

    context "when sends a file with incorrect params" do
      context "with empty name" do
        it "doesn't create a file" do
          post :create_file, params: { description: "some_desc" }

          expect(response).not_to have_http_status(200)
        end
      end
    end

    context "when sends a file with correct params" do
      it "creates a file" do
        post :create_file, params: { name: "some_name", description: "some_desc" }

        expect(response).to have_http_status(200)

        expect(UserFile.last.attributes).to include(
          "name" => "some_name",
          "description" => "some_desc",
          "dxid" => "file-Bx46ZqQ04Pz5Bq3x20pkBXP4",
          "parent_folder_id" => nil,
        )
      end

      it "creates a private file" do
        post :create_file, params: { name: anything, public_scope: false }

        expect(UserFile.last.project).to eq(user.private_files_project)
        expect(UserFile.last.scope).to eq("private")
      end

      it "creates a public file" do
        post :create_file, params: { name: anything, public_scope: true }

        expect(UserFile.last.project).to eq(user.public_files_project)
        expect(UserFile.last.scope).to eq("public")
      end

      context "when public_scope param doesn't exist" do
        it "creates a private file" do
          post :create_file, params: { name: anything }

          expect(UserFile.last.project).to eq(user.private_files_project)
          expect(UserFile.last.scope).to eq("private")
        end
      end
    end
  end

  describe "POST #set_tags" do
    context "when logged in" do
      let(:host_lead) { create(:user, dxuser: "user_1") }
      let(:guest_lead) { create(:user, dxuser: "user_2") }
      let(:user_member) { create(:user, dxuser: "user_3") }
      let(:review) do
        create(
          :space,
          :review,
          :accepted,
          host_lead_id: host_lead.id,
          guest_lead_id: guest_lead.id,
        )
      end
      let(:workflow) { create(:workflow, user: host_lead) }
      let(:tag_list) { ["Simulation", "Read Mapping", "Variation Calling"] }
      let(:set_tags_payload) do
        {
          "taggable_uid": workflow.uid,
          "tags": "",
          "suggested_tags": tag_list,
        }
      end

      before do
        authenticate!(host_lead)
      end

      it "updates tags" do
        post :set_tags, params: set_tags_payload

        aggregate_failures do
          expect(response.content_type).to eq "application/json; charset=utf-8"
          expect(response).to be_successful
          expect(workflow.tags.map(&:name)).to eq(tag_list)
        end
      end
    end
  end
  # rubocop:enable RSpec/AnyInstance
end
