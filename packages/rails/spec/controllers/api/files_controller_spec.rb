# rubocop:disable RSpec/AnyInstance
RSpec.shared_examples "not_editable" do
  context "when file is not editable by a user" do
    before do
      allow_any_instance_of(UserFile).to receive(:editable_by?).and_return(false)
      request_proc.call
    end

    it "responds with forbidden" do
      expect(response).to be_forbidden
    end
  end
end

RSpec.describe Api::FilesController, type: :controller do
  let(:user) { create(
    :user,
    total_limit: CloudResourceDefaults::TOTAL_LIMIT,
    job_limit: CloudResourceDefaults::JOB_LIMIT,
    resources: CloudResourceDefaults::RESOURCES,
    ) }
  let(:admin) { create(:user, :admin) }
  let(:file) { create(:user_file, :private, user: user) }
  let(:node_client) { instance_double(HttpsAppsClient) }

  describe "PUT update" do
    context "when user is authenticated" do
      before do
        authenticate!(user)
      end

      context "when renaming succeeds" do
        it "responds with a success" do
          allow_any_instance_of(UserFile).to receive(:rename).and_return(true)

          put :update, params: { uid: file.uid, file: { name: "name", description: "desc" } }

          expect(response).to be_successful
        end
      end

      context "when renaming fails" do
        it "responds with an error" do
          allow_any_instance_of(UserFile).to receive(:rename).and_return(false)

          put :update, params: { uid: file.uid, file: { name: "name", description: "desc" } }

          expect(response).to be_unprocessable
        end
      end

      it_behaves_like "not_editable" do
        let(:request_proc) do
          -> { put :update, params: { uid: file.uid, file: { name: "name" } } }
        end
      end
    end

    context "when user is not authenticated" do
      before do
        put :update, params: { uid: file.uid }
      end

      it_behaves_like "unauthenticated"
    end
  end

  describe "PUT feature files and folders" do
    context "when user is authenticated" do
      let(:folder_one) { create(:folder, :public, user: admin) }
      let(:file_other) { create(:user_file, :public, user: admin) }

      before do
        create(:user_file, :private, user: user, parent_folder_id: folder_one.id)
        create(:user_file, :public, user: admin, parent_folder_id: folder_one.id)

        authenticate!(admin)
      end

      it "response is success" do
        put :invert_feature, params: { item_ids: [file_other.uid, folder_one.id],
                                       featured: true }, format: :json

        expect(response).to be_successful
      end

      it "feature file and folder in one response" do
        put :invert_feature, params: { item_ids: [file_other.uid, folder_one.id],
                                       featured: true }, format: :json

        expect(response).to be_successful
        expect { folder_one.reload }.to change(folder_one, :featured).from(false).to(true)
        expect { file_other.reload }.to change(file_other, :featured).from(false).to(true)
      end
    end

    context "when user is not authenticated" do
      let(:folder_one) { create(:folder, :public, user: admin) }

      it "un-feature folder" do
        put :invert_feature, params: { item_ids: folder_one.id,
                                       featured: true }, format: :json

        expect(response).to be_unauthorized
      end
    end

    context "when user is not an admin" do
      let(:folder_one) { create(:folder, :public, user: user) }

      it "un-feature folder" do
        put :invert_feature, params: { item_ids: folder_one.id,
                                       featured: true }, format: :json

        expect(response).to be_unauthorized
      end
    end
  end

  describe "POST download_list" do
    context "with delete task" do
      let(:public_file) { create(:user_file, :public, user:) }

      context "when user is a site admin" do
        before { authenticate!(admin) }

        it "includes public files owned by other users" do
          post :download_list, params: { task: "delete", ids: [public_file.id], scope: "public" },
                               format: :json

          expect(response).to be_successful
          ids = JSON.parse(response.body).pluck("id")
          expect(ids).to include(public_file.id)
        end
      end

      context "when user is not an admin" do
        let(:other_user) { create(:user, dxuser: "other.user") }

        before { authenticate!(other_user) }

        it "does not include public files owned by other users" do
          post :download_list, params: { task: "delete", ids: [public_file.id], scope: "public" },
                               format: :json

          expect(response).to be_successful
          ids = JSON.parse(response.body).pluck("id")
          expect(ids).not_to include(public_file.id)
        end
      end

      context "when user is a non-admin owner of a public file" do
        before { authenticate!(user) }

        it "does not include the user's own public files" do
          post :download_list, params: { task: "delete", ids: [public_file.id], scope: "public" },
                               format: :json

          expect(response).to be_successful
          ids = JSON.parse(response.body).pluck("id")
          expect(ids).not_to include(public_file.id)
        end
      end
    end
  end
end
# rubocop:enable RSpec/AnyInstance
