require "rails_helper"

RSpec.describe CopyService::NodeApiCopier, type: :service do
  subject(:copier) { described_class.new(api:, user:) }

  let(:user) { create(:user) }
  let(:api) { instance_double(DNAnexusAPI, bearer_token: "challenge-bot-token") }
  let(:node_client) { instance_double(HttpsAppsClient) }
  let(:file) { create(:user_file, user:, scope: "private", state: UserFile::STATE_CLOSED) }
  let(:captured_auth_keys) { [] }

  before do
    allow(HttpsAppsClient).to receive(:new) do |auth_key:|
      captured_auth_keys << auth_key
      node_client
    end
    allow(node_client).to receive(:nodes_copy).and_return([])
  end

  describe "#copy" do
    it "forwards copy to Node API" do
      copies = copier.copy(file, "public")

      expect(HttpsAppsClient).to have_received(:new).with(auth_key: kind_of(String))
      expect(node_client).to have_received(:nodes_copy).with([file.id], "public", nil, false)
      expect(copies).to be_empty
    end

    it "sends an auth key that decrypts to the acting user with the api token" do
      copier.copy(file, "public")

      decrypted = JSON.parse(Rails.configuration.encryptor.decrypt_and_verify(captured_auth_keys.sole))
      context = decrypted.fetch("context")

      expect(context["user_id"]).to eq(user.id)
      expect(context["token"]).to eq("challenge-bot-token")
    end

    it "returns empty copies when no nodes are provided" do
      copies = copier.copy([], "public")
      expect(copies).to be_empty
      expect(node_client).not_to have_received(:nodes_copy)
    end
  end
end
