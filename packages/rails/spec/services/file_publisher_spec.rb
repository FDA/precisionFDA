require "rails_helper"

RSpec.describe FilePublisher, type: :service do
  subject(:publisher) { described_class.new(api:, user:) }

  let(:user) { create(:user) }
  let(:api) { instance_double(DNAnexusAPI) }
  let(:node_copier) { instance_double(CopyService::NodeApiCopier) }

  let(:closed_file) do
    create(:user_file, :private, user:, state: UserFile::STATE_CLOSED, project: "project-source")
  end
  let(:other_closed_file) do
    create(:user_file, :private, user:, state: UserFile::STATE_CLOSED, project: "project-source")
  end
  let(:copying_file) do
    create(:user_file, :private, user:, state: UserFile::STATE_COPYING, project: "project-source")
  end

  before do
    allow(CopyService::NodeApiCopier).to receive(:new).and_return(node_copier)
  end

  describe "#publish" do
    def copies_of(mapping)
      copies = CopyService::Copies.new
      mapping.each { |source, copied| copies.push(object: source.dup, source:, copied:) }
      copies
    end

    it "does not count files silently skipped by the Node API as published" do
      # Simulates a state race: the file passed the Rails-side check but the
      # facade skipped it (e.g. its state changed server-side) and omitted it
      # from the returned mapping.
      allow(node_copier).to receive(:copy).and_return(copies_of(closed_file => true))
      allow(Rails.logger).to receive(:warn)

      count = publisher.publish([closed_file, other_closed_file], "public")

      expect(count).to eq(1)
      expect(Rails.logger).to have_received(:warn).with(/skipped 1 file.*#{other_closed_file.uid}/m)
    end

    it "returns the full count when every file is copied" do
      allow(node_copier).to receive(:copy).
        and_return(copies_of(closed_file => true, other_closed_file => true))

      expect(publisher.publish([closed_file, other_closed_file], "public")).to eq(2)
    end

    it "counts files that already existed in the destination (copied: false) as published" do
      allow(node_copier).to receive(:copy).and_return(copies_of(closed_file => false))

      expect(publisher.publish([closed_file], "public")).to eq(1)
    end

    it "returns 0 when the Node API copies nothing" do
      allow(node_copier).to receive(:copy).and_return(CopyService::Copies.new)
      allow(Rails.logger).to receive(:warn)

      expect(publisher.publish([closed_file], "public")).to eq(0)
    end

    it "returns 0 and does not call the copier when nothing is publishable" do
      allow(node_copier).to receive(:copy)
      public_file = create(:user_file, :public, user:, state: UserFile::STATE_CLOSED)

      expect(publisher.publish([public_file], "public")).to eq(0)
      expect(node_copier).not_to have_received(:copy)
    end

    it "raises when a file is in a non-publishable state" do
      open_file = create(:user_file, :private, user:, state: "open", project: "project-source")

      expect { publisher.publish([open_file], "public") }.
        to raise_error(/file is not closed/)
    end

    it "rejects regular files in the copying state instead of silently dropping them" do
      # The Node API skips non-closed files, so admitting "copying" files
      # here would report success while the file is never published.
      expect { publisher.publish([copying_file], "public") }.
        to raise_error(/#{copying_file.name} - file is not closed/)
    end

    it "still accepts challenge files in the copying state via the legacy force-publish path" do
      allow(copying_file).to receive(:challenge_file?).and_return(true)

      # Legacy force-publish path: resolve the bot-owned source project and
      # clone directly, then create the new record as closed.
      bot_api = instance_double(DNAnexusAPI)
      allow(DNAnexusAPI).to receive(:new).and_return(bot_api)
      allow(bot_api).to receive(:call).and_return(
        "results" => [{ "describe" => { "project" => "project-challenge-bot" } }],
      )
      allow(api).to receive(:project_clone)

      count = publisher.publish([copying_file], "public")

      expect(count).to eq(1)
      expect(api).to have_received(:project_clone).
        with("project-challenge-bot", user.public_files_project, { objects: [copying_file.dxid] })

      published_copy = UserFile.find_by(dxid: copying_file.dxid, project: user.public_files_project)
      expect(published_copy.state).to eq(UserFile::STATE_CLOSED)
    end
  end
end
