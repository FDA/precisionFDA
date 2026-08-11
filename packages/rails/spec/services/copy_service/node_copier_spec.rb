require "rails_helper"

RSpec.describe CopyService::NodeApiCopier, type: :service do
  subject(:copier) { described_class.new(api:, user:) }

  let(:user) { create(:user) }
  let(:api) { instance_double(DNAnexusAPI, bearer_token: "challenge-bot-token", project_clone: nil) }
  let(:node_client) { instance_double(HttpsAppsClient) }
  let(:captured_auth_keys) { [] }

  describe "#copy" do
    let(:project_one) { "project-one" }
    let(:file_one) { create(:user_file, name: "file_one", project: project_one, scope: "private", user:) }
    let(:folder_one) { create(:folder, name: "folder_one", project: project_one, scope: "private", user:) }

    before do
      allow(HttpsAppsClient).to receive(:new) do |auth_key:|
        captured_auth_keys << auth_key
        node_client
      end
      allow(node_client).to receive(:nodes_copy).and_return([])
    end

    it "delegates copy to Node API synchronously in a single batch with folders first" do
      nodes = [file_one, folder_one]

      copier.copy(nodes, "public", nil)

      expect(HttpsAppsClient).to have_received(:new).with(auth_key: kind_of(String))
      expect(node_client).to have_received(:nodes_copy).with([folder_one.id, file_one.id], "public", nil, false)
    end

    it "authenticates with a Node API key carrying the acting user and platform token" do
      copier.copy([file_one], "public", nil)

      decrypted = JSON.parse(Rails.configuration.encryptor.decrypt_and_verify(captured_auth_keys.sole))
      context = decrypted.fetch("context")

      expect(context["user_id"]).to eq(user.id)
      expect(context["username"]).to eq(user.dxuser)
      expect(context["token"]).to eq("challenge-bot-token")
      expect(context["org_id"]).to eq(user.org_id)
      expect(context["expiration"]).to be > Time.now.to_i
    end

    it "splits nodes from different source projects into separate API requests" do
      file_two = create(:user_file, name: "file_two", project: "project-two", scope: "private", user:)

      copier.copy([file_one, file_two], "public", nil)

      expect(node_client).to have_received(:nodes_copy).with([file_one.id], "public", nil, false)
      expect(node_client).to have_received(:nodes_copy).with([file_two.id], "public", nil, false)
    end

    it "attaches the folder skeleton to every per-project file batch to preserve hierarchy" do
      # Folders have no project - splitting them from their files would make
      # the Node API resolve file parents against an empty per-request folder
      # map, silently flattening the published tree.
      file_two = create(:user_file, name: "file_two", project: "project-two", scope: "private", user:)

      copier.copy([folder_one, file_one, file_two], "public", nil)

      expect(node_client).to have_received(:nodes_copy).with([folder_one.id, file_one.id], "public", nil, false)
      expect(node_client).to have_received(:nodes_copy).with([folder_one.id, file_two.id], "public", nil, false)
    end

    it "returns empty copies when input is empty" do
      expect(copier.copy([], "public", nil)).to be_empty
      expect(node_client).not_to have_received(:nodes_copy)
    end

    it "maps sources to read-back targets returned by the Node API" do
      target = create(:user_file, name: "file_one_copy", project: "project-space", scope: "space-1", user:)
      allow(node_client).to receive(:nodes_copy).and_return(
        [{ "sourceNodeId" => file_one.id, "targetNodeId" => target.id, "copied" => true }],
      )

      copies = copier.copy([file_one], "space-1")

      copy = copies.copies.sole
      expect(copy.object).to eq(target)
      expect(copy.source).to eq(file_one)
      expect(copy.copied).to be(true)
    end

    it "raises when the Node API reports copied nodes that are not readable" do
      # Simulates snapshot isolation hiding rows committed by the Node API
      # (e.g. when the copier is invoked inside an open transaction).
      allow(node_client).to receive(:nodes_copy).and_return(
        [{ "sourceNodeId" => file_one.id, "targetNodeId" => -1, "copied" => true }],
      )

      expect { copier.copy([file_one], "space-1") }.
        to raise_error(described_class::CopyError, /not visible in the current DB session/)
    end

    it "raises on an unexpected response shape instead of treating it as empty" do
      allow(node_client).to receive(:nodes_copy).and_return("<html>gateway timeout</html>")

      expect { copier.copy([file_one], "space-1") }.
        to raise_error(described_class::CopyError, /expected an Array of mapping entries, got String/)
    end

    it "refuses to run inside an open transaction outside of the test env" do
      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))

      expect { copier.copy([file_one], "public") }.
        to raise_error(described_class::CopyError, /must not be invoked inside a database transaction/)
      expect(node_client).not_to have_received(:nodes_copy)
    end
  end
end
