require "rails_helper"

describe UserFileSerializer do
  subject(:user_file_serializer) { described_class.new(user_file) }

  # let(:user) { build(:user) }
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  # let(:user_file) { build(:user_file, :private, created_at: Time.current, user: user) }
  let(:user_file) { create(:user_file, :private, created_at: Time.current, user: user) }

  before do
    allow(user_file_serializer).to receive(:current_user).and_return(user)
  end

  describe "serialize" do
    it "common fields[name, type]" do
      user_file_serialized = JSON.parse(user_file_serializer.to_json)

      expect(user_file_serialized["name"]).to eq(user_file.name)
      expect(user_file_serialized["type"]).to eq("UserFile")
    end

    it "common fields[state, location, added_by]" do
      user_file_serialized = JSON.parse(user_file_serializer.to_json)

      expect(user_file_serialized["state"]).to eq(UserFile::STATE_CLOSED)
      expect(user_file_serialized["location"]).to eq("Private")
      expect(user_file_serialized["added_by"]).to eq(user.full_name)
    end

    context "when user is authenticated" do
      it "links[show, user, track]" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["show"]).to eq("/files/#{user_file.uid}")
        expect(user_file_serialized["links"]["user"]).to eq("/users/#{user.dxuser}")
        expect(user_file_serialized["links"]["track"]).to eq("/track?id=#{user_file.uid}")
      end

      it "links[download_list, attach_to]" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["download_list"]).to eq("/api/files/download_list")
        expect(user_file_serialized["links"]["attach_to"]).to eq("/api/attach_to_notes")
      end

      it "links[add_file, add_folder, update]" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["add_file"]).to eq("/api/create_file")
        expect(user_file_serialized["links"]["add_folder"]).to eq("/api/files/create_folder")
        expect(user_file_serialized["links"]["update"]).to eq("/api/files")
      end

      it "links[download, link, publish] are nil" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["download"]).to be_nil
        expect(user_file_serialized["links"]["link"]).to be_nil
        expect(user_file_serialized["links"]["publish"]).to be_nil
      end

      it "links[rename, remove, copy] are nil" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["rename"]).to be_nil
        expect(user_file_serialized["links"]["remove"]).to be_nil
        expect(user_file_serialized["links"]["copy"]).to be_nil
      end

      it "links[license, organize, feature] are nil" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["license"]).to be_nil
        expect(user_file_serialized["links"]["organize"]).to be_nil
        expect(user_file_serialized["links"]["feature"]).to be_nil
      end
    end

    describe "when file licensing", focus: true do
      let(:license) { create(:license, :public, user_id: user.id) }
      let(:licensed_item) { create(:licensed_item, license_id: license.id, licenseable: user_file) }
      # let(:licensed_item) { create(:licensed_item, license_id: license.id) }
      let(:user_file_serialized) { JSON.parse(user_file_serializer.to_json) }

      context "when file is not licensed" do
        it "link[show_license] is nil" do
          expect(user_file_serialized["links"]["show_license"]).to be_nil
        end
      end

      context "when file is licensed" do
        it "link[show_license] exists" do
          p "TEST: user_file = #{user_file.inspect}"
          p "TEST: user_file_serialized = #{user_file_serialized.inspect}"
          p "TEST: license = #{license.inspect}"
          p "TEST: licensed_item = #{licensed_item.inspect}"
          p "TEST: user = #{user.inspect}"
          p "TEST: user_file_serialized['file_license'] = #{user_file_serialized["file_license"].inspect}"
          p "TEST: user_file_serialized[license] = #{user_file_serialized["license"].inspect}"
          p "TEST: user_file.license = #{user_file.license.inspect}"

          expect(user_file_serialized["links"]["show_license"]).to eq("/licenses/#{license.id}")
        end
      end
    end

    context "when user is authenticated" do
      before do
        allow(user).to receive(:logged_in?).and_return(true)
      end

      it "links[download, link, publish]" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["download"]).
          to eq("/api/files/#{user_file.uid}/download")
        expect(user_file_serialized["links"]["link"]).to eq("/files/#{user_file.uid}/link")
        expect(user_file_serialized["links"]["publish"]).to eq("/publish?id=#{user_file.uid}")
      end

      it "links[rename, remove]" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["rename"]).to eq("/files/#{user_file.uid}/rename")
        expect(user_file_serialized["links"]["remove"]).to eq("/api/files/remove")
      end

      it "links[license, organize, copy]" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["license"]).
          to eq("/api/licenses/:id/license_item/:item_uid")
        expect(user_file_serialized["links"]["organize"]).to eq("/api/files/move")
        expect(user_file_serialized["links"]["copy"]).to eq("/api/files/copy")
      end
    end

    context "when user is admin" do
      before do
        allow(admin).to receive(:logged_in?).and_return(true)
        allow(user_file_serializer).to receive(:current_user).and_return(admin)
      end

      it "links[feature]" do
        user_file_serialized = JSON.parse(user_file_serializer.to_json)

        expect(user_file_serialized["links"]["feature"]).to eq("/api/files/feature")
        expect(user_file_serialized["links"]["organize"]).to eq("/api/files/move")
      end
    end
  end
end
