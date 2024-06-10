require "rails_helper"

describe UserFileSerializer do
  subject(:user_file_serializer) { described_class.new(user_file) }

  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:user_file) { create(:user_file, :private, created_at: Time.current, user: user) }

  # rubocop:todo RSpec/SubjectStub
  before do
    allow(user_file_serializer).to receive(:current_user).and_return(user)
  end
  # rubocop:enable RSpec/SubjectStub

  describe "serialize" do
    let(:user_file_serialized) { JSON.parse(user_file_serializer.to_json) }

    it "common fields[name, type] exist" do
      expect(user_file_serialized["name"]).to eq(user_file.name)
      expect(user_file_serialized["type"]).to eq("UserFile")
    end

    it "common fields[state, location, added_by] exist" do
      expect(user_file_serialized["state"]).to eq(UserFile::STATE_CLOSED)
      expect(user_file_serialized["location"]).to eq("Private")
      expect(user_file_serialized["added_by"]).to eq(user.full_name)
    end

    context "when user is not authenticated" do
      it "links[show, user] exist" do
        expect(user_file_serialized["links"]["show"]).to eq("/files/#{user_file.uid}")
        expect(user_file_serialized["links"]["user"]).to eq(user_path(user.dxuser))
      end

      it "links[download_list, attach_to] exist" do
        expect(user_file_serialized["links"]["download_list"]).to eq(download_list_api_files_path)
        expect(user_file_serialized["links"]["attach_to"]).to eq(api_attach_to_notes_path)
      end

      it "links[add_file, add_folder, update] exist" do
        expect(user_file_serialized["links"]["add_file"]).to eq(api_create_file_path)
        expect(user_file_serialized["links"]["add_folder"]).to eq(create_folder_api_files_path)
        expect(user_file_serialized["links"]["update"]).to eq(api_files_path)
      end

      it "links[download, publish] are nil" do
        expect(user_file_serialized["links"]["download"]).to eq(download_api_file_path(user_file))
        expect(user_file_serialized["links"]["publish"]).to be_nil
      end

      it "links[rename, remove, copy] are nil" do
        expect(user_file_serialized["links"]["rename"]).to be_nil
        expect(user_file_serialized["links"]["remove"]).to be_nil
        expect(user_file_serialized["links"]["copy"]).to eq(copy_api_files_path)
      end

      it "links[license, organize, feature] are nil" do
        expect(user_file_serialized["links"]["license"]).to be_nil
        expect(user_file_serialized["links"]["organize"]).to be_nil
        expect(user_file_serialized["links"]["feature"]).to be_nil
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

        it "user_file has no any license" do
          expect(user_file.license).to be_nil
        end

        it "link[show_license] is nil" do
          expect(user_file_serialized["links"]["show_license"]).to be_nil
        end

        context "when user_file is owned by user" do
          before do
            user_file.update(scope: "space-#{review_space.id}")
            allow(user_file).to receive(:in_space?).and_return(true)
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
            expect(user_file_serialized["links"]["download"]).
              to eq(download_api_file_path(user_file))
            expect(user_file_serialized["links"]["copy"]).to eq(copy_api_files_path)
          end

          # rubocop:todo RSpec/NestedGroups
          context "when user_file is a space viewer" do
            before do
              allow(user).to receive(:member_viewer?).and_return(false)
              allow(user_file).to receive(:licenseable).and_return(true)
              review_space.space_memberships.where(user_id: user.id).first.update(role: "viewer")
            end

            it "user_file is owned by user" do
              expect(user_file).to be_owned_by_user(user)
            end

            it "links[publish, rename, remove] are nil" do
              expect(user_file_serialized["links"]["publish"]).to be_nil
              expect(user_file_serialized["links"]["rename"]).to be_nil
              expect(user_file_serialized["links"]["remove"]).to be_nil
            end
          end

          context "when user_file is a space lead" do
            before { allow(user).to receive(:member_viewer?).and_return(true) }

            it "user_file is owned by user" do
              expect(user_file).to be_owned_by_user(user)
            end

            it "links[publish] exist" do
              expect(user_file_serialized["links"]["publish"]).
                to eq("/publish?id=#{user_file.uid}")
            end

            it "links[remove, organize] exist" do
              expect(user_file_serialized["links"]["remove"]).to eq(remove_api_files_path)
              expect(user_file_serialized["links"]["organize"]).to eq(move_api_files_path)
            end
          end

          context "when user_file is licenseable" do
            before { allow(user_file).to receive(:licenseable).and_return(true) }

            it "user_file is licenseable" do
              expect(user_file.licenseable).to be_truthy
            end

            it "link[license] exist" do
              expect(user_file_serialized["links"]["license"]).
                to eq(license_item_api_license_path(":id", ":item_uid"))
            end
          end
        end
      end

      context "when file is licensed" do
        before { create(:licensed_item, license_id: license.id, licenseable: user_file) }

        let(:licensed_item) { LicensedItem.where(license_id: license.id, licenseable: user_file) }

        it "user_file has proper license of a proper user" do
          expect(user_file.license.title).to eq(license.title)
          expect(user_file.license.content).to eq(license.content)
          expect(user_file.license.user_id).to eq(user.id)
        end

        it "link[show_license] exists" do
          expect(user_file_serialized["links"]["show_license"]).to eq("/licenses/#{license.id}")
        end

        context "when license is active" do
          before { create(:accepted_license, :active, license_id: license.id, user_id: user.id) }

          let(:accepted_license) do
            AcceptedLicense.where(license_id: license.id, user_id: user.id).first
          end

          it "user_file has active license of a proper user" do
            expect(user_file.license.title).to eq(license.title)
            expect(accepted_license.user_id).to eq(user.id)
            expect(accepted_license.state).to eq("active")
          end

          context "when license is owned by user" do
            it "have proper owner" do
              expect(user_file.license.user_id).to eq(user.id)
            end

            it "links[object_license, detach_license] exist" do
              expect(user_file_serialized["links"]["object_license"]).
                to eq("/api/licenses/#{license.id}")
              expect(user_file_serialized["links"]["detach_license"]).
                to eq("/api/licenses/:id/remove_item/:item_uid")
            end
          end

          context "when license does not owned by user" do
            before { user_file.license.update(user_id: nil) }

            it "links[download, copy] exist" do
              expect(user_file_serialized["links"]["download"]).
                to eq(download_api_file_path(user_file))
              expect(user_file_serialized["links"]["copy"]).to eq(copy_api_files_path)
            end
          end
        end

        context "when license is not active and approval required" do
          before do
            create(:accepted_license, :pending, license_id: license.id, user_id: user.id)
            user_file.license.update(approval_required: true)
          end

          let(:accepted_license) do
            AcceptedLicense.where(license_id: license.id, user_id: user.id).first
          end

          it "user_file has inactive license of a proper user with approval required" do
            expect(user_file.license.title).to eq(license.title)
            expect(accepted_license.user_id).to eq(user.id)
            expect(accepted_license.state).not_to eq("active")
          end

          it "user_file has a license with approval required" do
            expect(user_file.license.approval_required).to be_truthy
          end

          context "when license is not pending for approval" do
            it "links[request_approval_license, request_approval_action] are nil" do
              expect(user_file_serialized["links"]["request_approval_license"]).to be_nil
              expect(user_file_serialized["links"]["request_approval_action"]).to be_nil
            end
          end

          context "when license is not pending approval or not" do
            before { accepted_license.update(state: "not pending") }

            it "links[request_approval_license, request_approval_action] exist" do
              expect(user_file_serialized["links"]["request_approval_license"]).
                to eq("/licenses/#{license.id}/request_approval")
              expect(user_file_serialized["links"]["request_approval_action"]).
                to eq("api/licenses/:id/request_approval")
            end
          end
        end
        # rubocop:enable RSpec/NestedGroups

        context "when license is not active and approval not required" do
          before do
            create(:accepted_license, :pending, license_id: license.id, user_id: user.id)
            user_file.license.update(approval_required: false)
          end

          let(:accepted_license) do
            AcceptedLicense.where(license_id: license.id, user_id: user.id).first
          end

          it "user_file has inactive license of a proper user with approval required" do
            expect(accepted_license.user_id).to eq(user.id)
            expect(accepted_license.state).not_to eq("active")
            expect(user_file_serialized["links"]["accept_license_action"]).
              to eq(accept_api_license_path(license.id))
          end
        end
      end
    end

    context "when user is authenticated" do
      before do
        allow(user).to receive(:logged_in?).and_return(true)
      end

      it "links[download, publish] exist" do
        expect(user_file_serialized["links"]["download"]).
          to eq(download_api_file_path(user_file))
        expect(user_file_serialized["links"]["publish"]).to eq("/publish?id=#{user_file.uid}")
      end

      context "when user_file is not in root folder" do
        before { user_file.update(parent_folder_id: FFaker::Random.rand(3)) }

        it "links[publish] is nil" do
          expect(user_file_serialized["links"]["publish"]).to be_nil
        end
      end

      context "when user_file is public" do
        before { user_file.update(scope: Scopes::SCOPE_PUBLIC) }

        it "links[download, link, publish] exist" do
          expect(user_file_serialized["links"]["publish"]).to be_nil
        end
      end

      it "links[remove] exist" do
        expect(user_file_serialized["links"]["remove"]).to eq(remove_api_files_path)
      end

      it "links[license, organize, copy] exist" do
        expect(user_file_serialized["links"]["license"]).
          to eq(license_item_api_license_path(":id", ":item_uid"))
        expect(user_file_serialized["links"]["organize"]).to eq(move_api_files_path)
        expect(user_file_serialized["links"]["copy"]).to eq(copy_api_files_path)
      end
    end

    context "when user is admin" do
      before do
        allow(admin).to receive(:logged_in?).and_return(true)
        # rubocop:todo RSpec/SubjectStub
        allow(user_file_serializer).to receive(:current_user).and_return(admin)
        # rubocop:enable RSpec/SubjectStub
      end

      it "links[feature, organize] exist" do
        expect(user_file_serialized["links"]["feature"]).to eq(feature_api_files_path)
        expect(user_file_serialized["links"]["organize"]).to eq(move_api_files_path)
      end
    end
  end
end
