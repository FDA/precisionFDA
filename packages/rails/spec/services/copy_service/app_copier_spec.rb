require "rails_helper"

RSpec.describe CopyService::AppCopier, type: :service do
  subject(:copier) { described_class.new(api:, user:, file_copier:) }

  let(:user) { create(:user) }
  let(:api) { instance_double(DNAnexusAPI) }
  let(:file_copier) { instance_double(CopyService::NodeApiCopier) }
  let(:app) { create(:app, user:) }
  let(:source_asset) { create(:asset, user:) }
  let(:target_asset) { create(:asset, user:, scope: "public") }
  let!(:source_entry) { ArchiveEntry.create!(asset: source_asset, name: "entry.txt", path: "/entry.txt") }

  before do
    app.assets << source_asset
  end

  describe "#copy_assets" do
    it "duplicates archive entries without moving them from source assets" do
      copies = CopyService::Copies.new
      copies.push(object: target_asset, source: source_asset)
      allow(file_copier).to receive(:copy).and_return(copies)

      copied_assets = copier.send(:copy_assets, app, "public")

      expect(copied_assets).to eq([target_asset])
      expect(source_asset.reload.archive_entries).to contain_exactly(source_entry)

      copied_entry = target_asset.reload.archive_entries.sole
      expect(copied_entry).to have_attributes(name: source_entry.name, path: source_entry.path)
      expect(copied_entry.id).not_to eq(source_entry.id)
      expect(copied_entry.asset_id).to eq(target_asset.id)
    end

    it "does not duplicate archive entries for an existing destination asset" do
      existing_entry = ArchiveEntry.create!(asset: target_asset, name: "existing.txt", path: "/existing.txt")
      copies = CopyService::Copies.new
      copies.push(object: target_asset, source: source_asset, copied: false)
      allow(file_copier).to receive(:copy).and_return(copies)

      copier.send(:copy_assets, app, "public")

      expect(source_asset.reload.archive_entries).to contain_exactly(source_entry)
      expect(target_asset.reload.archive_entries).to contain_exactly(existing_entry)
    end
  end
end
