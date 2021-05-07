require "rails_helper"

describe FolderSerializer do
  subject(:folder_serializer) { described_class.new(folder) }

  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:folder) { create(:folder, :private, created_at: Time.current, user: user) }

  # rubocop:todo RSpec/SubjectStub
  before do
    allow(folder_serializer).to receive(:current_user).and_return(user)
  end
  # rubocop:enable RSpec/SubjectStub

  describe "serialize" do
    let(:folder_serialized) { JSON.parse(folder_serializer.to_json) }

    it "common fields[name, type] exist" do
      expect(folder_serialized["name"]).to eq(folder.name)
      expect(folder_serialized["type"]).to eq("Folder")
    end

    it "common fields[location, added_by] exist" do
      expect(folder_serialized["location"]).to eq("Private")
      expect(folder_serialized["added_by"]).to eq(user.full_name)
    end

    context "when user is not authenticated" do
      it "links[show, user, track] exist" do
        expect(folder_serialized["links"]["copy"]).to eq(copy_api_files_path(folder))
        expect(folder_serialized["links"]["user"]).to eq(user_path(user.dxuser))
        expect(folder_serialized["links"]["children"]).to eq(children_api_folders_path(folder))
      end

      it "links[publish] is nil" do
        expect(folder_serialized["links"]["publish"]).to be_nil
        expect(folder_serialized["links"]["organize"]).to be_nil
      end

      it "links[rename, remove, copy] are nil" do
        expect(folder_serialized["links"]["rename_folder"]).to be_nil
        expect(folder_serialized["links"]["remove"]).to be_nil
        expect(folder_serialized["links"]["copy"]).to eq(copy_api_files_path(folder))
      end
    end

    context "when user is authenticated" do
      before do
        allow(user).to receive(:logged_in?).and_return(true)
      end

      it "links[publish, rename_folder, remove] exist" do
        expect(folder_serialized["links"]["publish"]).to be_nil
        expect(folder_serialized["links"]["rename_folder"]).
          to eq(rename_folder_api_folders_path(folder))
        expect(folder_serialized["links"]["remove"]).to eq(remove_api_files_path)
      end
    end

    context "when user is admin" do
      before do
        allow(admin).to receive(:logged_in?).and_return(true)
        # rubocop:todo RSpec/SubjectStub
        allow(folder_serializer).to receive(:current_user).and_return(admin)
        # rubocop:enable RSpec/SubjectStub
      end

      it "links[feature, organize, publish] exist" do
        expect(folder_serialized["links"]["feature"]).to eq(feature_api_files_path)
        expect(folder_serialized["links"]["organize"]).to eq(move_api_files_path)
        expect(folder_serialized["links"]["publish"]).
          to eq(publish_folders_api_folders_path(folder))
      end
    end
  end
end
