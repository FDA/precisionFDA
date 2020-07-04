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
  let(:user) { create(:user) }
  let(:file) { create(:user_file, :private, user: user) }

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

  describe "GET download" do
    context "when user is authenticated" do
      let(:redirect_url) { "https://url" }

      before do
        authenticate!(user)

        allow(UserFile).to receive(:exist_refresh_state).and_return(file)
        allow(file).to receive(:file_url).and_return(redirect_url)
      end

      it "redirects to a file download url" do
        get :download, params: { uid: file.uid }

        expect(response).to redirect_to(redirect_url)
      end

      context "when file is not in the closed state" do
        before do
          file.update!(state: UserFile::STATE_OPEN)
        end

        it "responds with an error" do
          get :download, params: { uid: file.uid }

          expect(response).to be_unprocessable
        end
      end

      context "when file license is not accepted by a user" do
        before do
          license = instance_double(License)

          allow(file).to receive(:license).and_return(license)
          allow(file).to receive(:licensed_by?).and_return(false)
        end

        it "responds with an error" do
          get :download, params: { uid: file.uid }

          expect(response).to be_unprocessable
        end
      end
    end

    context "when user is not authenticated" do
      before do
        get :download, params: { uid: file.uid }
      end

      it_behaves_like "unauthenticated"
    end
  end

  describe "POST download_list" do
    pending
  end

  describe "POST copy" do
    context "when user is authenticated" do
      let(:space) { create(:space, :review, :active, host_lead_id: user.id) }

      let(:file_one) { create(:user_file, :private, user: user) }
      let(:folder_one) { create(:folder, :private, user: user) }
      let(:file_two) { create(:user_file, :private, user: user, scoped_parent_folder: folder_one) }
      let(:file_other) { create(:user_file, :private, user: create(:user)) }

      before do
        authenticate!(user)
      end

      it "copies files and folders" do
        node_copier = instance_double(CopyService::NodeCopier, copy: CopyService::Copies.new)
        allow(CopyService::NodeCopier).to receive(:new).and_return(node_copier)

        node_ids = [file_one.id, folder_one.id, file_two.id, file_other.id]

        post :copy, params: {
          scope: space.uid,
          item_ids: node_ids,
        }, format: :json

        expected_nodes = Node.where(id: node_ids[0..-2])

        expect(node_copier).to have_received(:copy).with(
          match_array(expected_nodes),
          space.uid,
        )

        expect(response).to be_successful
      end

      context "when user doesn't have contributor access to a scope" do
        let(:another_user) { create(:user) }
        let(:space) do
          create(
            :space,
            :review,
            :active,
            host_lead_id: another_user.id,
          )
        end

        it "responds with an error" do
          post :copy, params: {
            scope: space.uid,
            item_ids: [1, 2],
          }

          expect(response).to be_unprocessable
        end
      end
    end

    context "when user is not authenticated" do
      before do
        post :copy, params: { scope: "space-1", node_ids: [1, 2] }
      end

      it_behaves_like "unauthenticated"
    end
  end
end
# rubocop:enable RSpec/AnyInstance
