require "rails_helper"

describe AssetSerializer do
  subject(:asset_serializer) { described_class.new(asset) }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:admin) { create(:user, :admin) }
  let(:asset) { create(:asset, created_at: Time.current, user: user) }

  # rubocop:todo RSpec/SubjectStub
  before do
    allow(asset_serializer).to receive(:current_user).and_return(user)
    allow(context).to receive(:user).and_return(user)
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

    context "when user is not authenticated" do
      it "links[show, copy, update] exist" do
        expect(asset_serialized["links"]["show"]).to eq(api_asset_path(asset))
        expect(asset_serialized["links"]["copy"]).to eq(copy_api_files_path)
        expect(asset_serialized["links"]["update"]).to eq(api_files_path(asset))
      end

      it "links[attach_to, add_file, add_folder] exist" do
        expect(asset_serialized["links"]["attach_to"]).to eq(api_attach_to_notes_path)
        expect(asset_serialized["links"]["add_file"]).to eq(api_create_file_path)
        expect(asset_serialized["links"]["add_folder"]).to eq(create_folder_api_files_path)
      end

      it "links[user, download_list] exist" do
        expect(asset_serialized["links"]["user"]).to eq(user_path(user.dxuser))
        expect(asset_serialized["links"]["download_list"]).to eq(download_list_api_files_path)
      end

      it "links[download, link, publish] are nil" do
        expect(asset_serialized["links"]["download"]).to eq(download_api_file_path(asset))
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

    describe "when file is licensing and user logged in" do
      let(:license) { create(:license, :public, user_id: user.id) }

      before do
        allow(user).to receive(:logged_in?).and_return(true)
      end

      context "when file is not licensed" do
        before do
          allow(user).to receive(:logged_in?).and_return(true)
        end

        it "asset has no any license" do
          expect(asset.license).to be_nil
        end

        it "link[show_license] is nil" do
          expect(asset_serialized["links"]["show_license"]).to be_nil
        end

        context "when asset is owned by user" do
          before do
            asset.update(scope: "space-#{review_space.id}")
            allow(asset).to receive(:in_space?).and_return(true)
          end

          let(:guest_lead) { create(:user, dxuser: "user_2") }
          let(:review_space) do
            create(
              :space,
              :review,
              :accepted,
              host_lead_id: user.id,
              guest_lead_id: guest_lead.id,
            )
          end

          it "links[download, copy] exist" do
            expect(asset_serialized["links"]["download"]).
              to eq(download_api_file_path(asset))
            expect(asset_serialized["links"]["copy"]).to eq(copy_api_files_path)
          end

          # rubocop:todo RSpec/NestedGroups
          context "when asset is a space viewer" do
            before do
              allow(user).to receive(:member_viewer?).and_return(false)
              allow(asset).to receive(:licenseable).and_return(true)
              review_space.space_memberships.where(user_id: user.id).first.update(role: "viewer")
            end

            it "asset is owned by user" do
              expect(asset).to be_owned_by_user(user)
            end

            it "links[publish, rename, remove] are nil" do
              expect(asset_serialized["links"]["publish"]).to be_nil
              expect(asset_serialized["links"]["rename"]).to be_nil
              expect(asset_serialized["links"]["remove"]).to be_nil
            end
          end

          context "when asset is a space lead" do
            before { allow(user).to receive(:member_viewer?).and_return(true) }

            it "asset is owned by user" do
              expect(asset).to be_owned_by_user(user)
            end

            it "links[publish, rename] exist" do
              expect(asset_serialized["links"]["publish"]).
                to eq("/publish?id=#{asset.uid}")
              expect(asset_serialized["links"]["rename"]).
                to eq(rename_api_assets_path(asset))
            end

            it "links[remove, organize] exist" do
              expect(asset_serialized["links"]["remove"]).to eq(api_asset_path(asset))
              expect(asset_serialized["links"]["organize"]).to eq(move_api_files_path)
            end
          end

          context "when asset is licenseable" do
            before { allow(asset).to receive(:licenseable).and_return(true) }

            it "asset is licenseable" do
              expect(asset.licenseable).to be_truthy
            end

            it "link[license] exist" do
              expect(asset_serialized["links"]["license"]).
                to eq(license_item_api_license_path(":id", ":item_uid"))
            end
          end
        end
      end

      context "when file is licensed" do
        before { create(:licensed_item, license_id: license.id, licenseable: asset) }

        let(:licensed_item) { LicensedItem.where(license_id: license.id, licenseable: asset) }

        it "asset has proper license of a proper user" do
          expect(asset.license.title).to eq(license.title)
          expect(asset.license.content).to eq(license.content)
          expect(asset.license.user_id).to eq(user.id)
        end

        it "link[show_license] exists" do
          expect(asset_serialized["links"]["show_license"]).to eq("/licenses/#{license.id}")
        end

        context "when license is active" do
          before { create(:accepted_license, :active, license_id: license.id, user_id: user.id) }

          let(:accepted_license) do
            AcceptedLicense.where(license_id: license.id, user_id: user.id).first
          end

          it "asset has active license of a proper user" do
            expect(asset.license.title).to eq(license.title)
            expect(accepted_license.user_id).to eq(user.id)
            expect(accepted_license.state).to eq("active")
          end

          context "when license is owned by user" do
            it "have proper owner" do
              expect(asset.license.user_id).to eq(user.id)
            end

            it "links[object_license, detach_license] exist" do
              expect(asset_serialized["links"]["object_license"]).
                to eq("/api/licenses/#{license.id}")
              expect(asset_serialized["links"]["detach_license"]).
                to eq("/api/licenses/:id/remove_item/:item_uid")
            end
          end

          context "when license does not owned by user" do
            before { asset.license.update(user_id: nil) }

            it "links[download, copy] exist" do
              expect(asset_serialized["links"]["download"]).
                to eq(download_api_file_path(asset))
              expect(asset_serialized["links"]["copy"]).to eq(copy_api_files_path)
            end
          end
        end

        context "when license is not active and approval required" do
          before do
            create(:accepted_license, :pending, license_id: license.id, user_id: user.id)
            asset.license.update(approval_required: true)
          end

          let(:accepted_license) do
            AcceptedLicense.where(license_id: license.id, user_id: user.id).first
          end

          it "asset has inactive license of a proper user with approval required" do
            expect(asset.license.title).to eq(license.title)
            expect(accepted_license.user_id).to eq(user.id)
            expect(accepted_license.state).not_to eq("active")
          end

          it "asset has a license with approval required" do
            expect(asset.license.approval_required).to be_truthy
          end

          context "when license is not pending for approval" do
            it "links[request_approval_license, request_approval_action] are nil" do
              expect(asset_serialized["links"]["request_approval_license"]).to be_nil
              expect(asset_serialized["links"]["request_approval_action"]).to be_nil
            end
          end

          context "when license is not pending approval or not" do
            before { accepted_license.update(state: "not pending") }

            it "links[request_approval_license, request_approval_action] exist" do
              expect(asset_serialized["links"]["request_approval_license"]).
                to eq("/licenses/#{license.id}/request_approval")
              expect(asset_serialized["links"]["request_approval_action"]).
                to eq("api/licenses/:id/request_approval")
            end
          end
        end
        # rubocop:enable RSpec/NestedGroups

        context "when license is not active and approval not required" do
          before do
            create(:accepted_license, :pending, license_id: license.id, user_id: user.id)
            asset.license.update(approval_required: false)
          end

          let(:accepted_license) do
            AcceptedLicense.where(license_id: license.id, user_id: user.id).first
          end

          it "asset has inactive license of a proper user with approval required" do
            expect(accepted_license.user_id).to eq(user.id)
            expect(accepted_license.state).not_to eq("active")
            expect(asset_serialized["links"]["accept_license_action"]).
              to eq(accept_api_license_path(license.id))
          end
        end
      end
    end

    context "when user is authenticated" do
      subject(:admin_asset_serializer) { described_class.new(admin_asset) }

      before do
        allow(user).to receive(:logged_in?).and_return(true)
      end

      it "links[download, publish] exist" do
        expect(asset_serialized["links"]["download"]).to eq(download_api_file_path(asset))
        expect(asset_serialized["links"]["publish"]).to eq("/publish?id=#{asset.uid}")
      end

      it "links[rename, remove] exist" do
        expect(asset_serialized["links"]["rename"]).to eq(rename_api_assets_path(asset))
        expect(asset_serialized["links"]["remove"]).to eq(api_asset_path(asset))
      end

      it "links[license, organize] exist" do
        expect(asset_serialized["links"]["license"]).
          to eq(license_item_api_license_path(":id", ":item_uid"))
        expect(asset_serialized["links"]["organize"]).to eq(move_api_files_path)
      end
    end

    context "when user is admin" do
      let(:asset) { build(:asset, created_at: Time.current, user: admin) }

      before do
        allow(admin).to receive(:logged_in?).and_return(true)
        # rubocop:todo RSpec/SubjectStub
        allow(asset_serializer).to receive(:current_user).and_return(admin)
        # rubocop:enable RSpec/SubjectStub
      end

      it "links[feature] exist" do
        expect(asset_serialized["links"]["feature"]).to eq(feature_api_assets_path)
      end
    end
  end
end
