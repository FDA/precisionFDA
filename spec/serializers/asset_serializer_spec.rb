require "rails_helper"

describe AssetSerializer do
  subject(:asset_serializer) { described_class.new(asset) }

  let(:user) { build(:user) }
  let(:admin) { create(:user, :admin) }
  let(:asset) { build(:asset, created_at: Time.current, user: user) }

  # rubocop:disable RSpec/SubjectStub
  before do
    allow(asset_serializer).to receive(:current_user).and_return(user)
  end
  # rubocop:enable RSpec/SubjectStub

  describe "serialize" do
    let(:asset_serialized) { JSON.parse(asset_serializer.to_json) }

    it "common fields[name, type] exist" do
      expect(asset_serialized["name"]).to eq(asset.name)
      expect(asset_serialized["type"]).to eq("Asset")
    end

    it "common fields[state, location, added_by] exist" do
      expect(asset_serialized["state"]).to eq(UserFile::STATE_CLOSED)
      expect(asset_serialized["location"]).to eq("Private")
      expect(asset_serialized["added_by"]).to eq(user.full_name)
    end

    context "when user is not authenticated exist" do
      it "links[show, copy, update]" do
        expect(asset_serialized["links"]["show"]).to eq("/api/assets/#{asset.uid}")
        expect(asset_serialized["links"]["copy"]).to eq("/api/files/copy")
        expect(asset_serialized["links"]["update"]).to eq("/api/files")
      end

      it "links[attach_to, add_file, add_folder] exist" do
        expect(asset_serialized["links"]["attach_to"]).to eq("/api/attach_to_notes")
        expect(asset_serialized["links"]["add_file"]).to eq("/api/create_file")
        expect(asset_serialized["links"]["add_folder"]).to eq("/api/files/create_folder")
      end

      it "links[user, track, download_list] exist" do
        expect(asset_serialized["links"]["user"]).to eq("/users/#{user.dxuser}")
        expect(asset_serialized["links"]["track"]).to eq("/track?id=#{asset.uid}")
        expect(asset_serialized["links"]["download_list"]).to eq("/api/files/download_list")
      end

      it "links[download, link, publish] are nil" do
        expect(asset_serialized["links"]["download"]).to be_nil
        expect(asset_serialized["links"]["link"]).to be_nil
        expect(asset_serialized["links"]["publish"]).to be_nil
      end

      it "links[rename, remove] are nil" do
        expect(asset_serialized["links"]["rename"]).to be_nil
        expect(asset_serialized["links"]["remove"]).to be_nil
      end

      it "links[license, organize, feature] are nil" do
        expect(asset_serialized["links"]["license"]).to be_nil
        expect(asset_serialized["links"]["organize"]).to be_nil
        expect(asset_serialized["links"]["feature"]).to be_nil
      end
    end

    context "when user is authenticated" do
      subject(:admin_asset_serializer) { described_class.new(admin_asset) }

      before do
        allow(user).to receive(:logged_in?).and_return(true)
      end

      it "links[download, link, publish] exist" do
        expect(asset_serialized["links"]["download"]).to eq("/api/files/#{asset.uid}/download")
        expect(asset_serialized["links"]["link"]).to eq("/files/#{asset.uid}/link")
        expect(asset_serialized["links"]["publish"]).to eq("/publish?id=#{asset.uid}")
      end

      it "links[rename, remove] exist" do
        expect(asset_serialized["links"]["rename"]).to eq("/api/assets/rename")
        expect(asset_serialized["links"]["remove"]).to eq("/api/assets/#{asset.uid}")
      end

      it "links[license, organize] exist" do
        expect(asset_serialized["links"]["license"]).
          to eq("/api/licenses/:id/license_item/:item_uid")
        expect(asset_serialized["links"]["organize"]).to eq("/api/files/move")
      end
    end

    context "when user is admin" do
      subject(:asset_serializer) { described_class.new(asset) }

      let(:asset) { build(:asset, created_at: Time.current, user: admin) }

      before do
        allow(admin).to receive(:logged_in?).and_return(true)
        # rubocop:disable RSpec/SubjectStub
        allow(asset_serializer).to receive(:current_user).and_return(admin)
        # rubocop:enable RSpec/SubjectStub
      end

      it "links[feature] exist" do
        expect(asset_serialized["links"]["feature"]).to eq("/api/assets/feature")
      end
    end
  end
end
