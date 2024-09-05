require "rails_helper"

RSpec.describe Permissions do
  let(:viewer_role) { SpaceMembership::ROLE_VIEWER }
  let(:contributor_role) { SpaceMembership::ROLE_CONTRIBUTOR }
  let(:admin_role) { SpaceMembership::ROLE_ADMIN }
  let(:host_side) { SpaceMembership::SIDE_HOST }
  let(:guest_side) { SpaceMembership::SIDE_GUEST }

  let(:host_admin) { create(:user, dxuser: "user_3") }
  let(:host_contributor) { create(:user, dxuser: "user_4") }
  let(:host_contributor2) { create(:user, dxuser: "user_5") }
  let(:host_viewer) { create(:user, dxuser: "user_6") }
  let(:guest_admin) { create(:user, dxuser: "user_7") }

  describe "editable_by? context" do
    context "review space" do
      let!(:space) { create(:space, :review, state: :active) }

      let!(:host_admin_membership) { create(:space_membership, role: admin_role, side: host_side, user_id: host_admin.id, spaces: [space]) }
      let!(:host_contributor_membership) { create(:space_membership, role: contributor_role, side: host_side, user_id: host_contributor.id, spaces: [space]) }
      let!(:host_contributor_membership2) { create(:space_membership, role: contributor_role, side: host_side, user_id: host_contributor2.id, spaces: [space]) }
      let!(:host_viewer_membership) { create(:space_membership, role: viewer_role, side: host_side, user_id: host_viewer.id, spaces: [space]) }
      let!(:guest_admin_membership) { create(:space_membership, role: contributor_role, side: guest_side, user_id: guest_admin.id, spaces: [space]) }

      context "content owned by same side" do

        describe "files" do
          let!(:file_from_contributor) { create(:user_file, scope: space.uid, parent_id: host_contributor.id, user_id: host_contributor.id) }
          let!(:file_from_admin) { create(:user_file, scope: space.uid, parent_id: host_admin.id, user_id: host_admin.id) }

          it "viewer can't edit content created by contributor or lead or admin" do
            context = Context.new(host_viewer.id, host_viewer.dxuser, "token", 1.hour.from_now.to_i, host_viewer.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(false)
            expect(file_from_admin.editable_by?(context)).to eq(false)
          end

          it "contributor can edit content created by another contributor or lead or admin" do
            context = Context.new(host_contributor2.id, host_contributor2.dxuser, "token", 1.hour.from_now.to_i, host_contributor2.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "admin or lead can edit content created by contributor or another lead or admin" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "inactive contributor cannot edit content" do
            host_admin_membership.update(active: false)
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_admin.editable_by?(context)).to eq(false)
          end
        end

      end

      context "content owned by other side" do
        describe "files" do
          let!(:file_from_other) { create(:user_file, scope: space.uid, parent_id: guest_admin.id, user_id: guest_admin.id) }

          it "contributor cannot edit content" do
            context = Context.new(host_contributor2.id, host_contributor2.dxuser, "token", 1.hour.from_now.to_i, host_contributor2.org_id)

            expect(file_from_other.editable_by?(context)).to eq(false)
          end

          it "admin or lead cannot edit content" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_other.editable_by?(context)).to eq(false)
          end
        end
      end

      context "content owner does not have membership" do
        describe "files" do
          let!(:file_from_contributor) { create(:user_file, scope: space.uid, parent_id: host_contributor.id, user_id: host_contributor.id) }

          it "content owner is considered as reviewer" do
            host_contributor_membership.destroy
            context = Context.new(host_contributor2.id, host_contributor2.dxuser, "token", 1.hour.from_now.to_i, host_contributor2.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(true)
          end
        end
      end

      context "space restrict_to_template and not shared" do
        describe "files" do
          let!(:confid_space) { space.confidential_space(host_contributor_membership) }
          let!(:file_from_contributor) { create(:user_file, scope: confid_space.uid, parent_id: host_contributor.id, user_id: host_contributor.id) }

          it "nobody can edit content" do
            confid_space.update(restrict_to_template: true)
            context = Context.new(host_contributor2.id, host_contributor2.dxuser, "token", 1.hour.from_now.to_i, host_contributor2.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(false)
          end
        end
      end

    end

    context "groups space" do
      let!(:space) { create(:space, :group, state: :active) }

      let!(:host_admin_membership) { create(:space_membership, role: admin_role, side: host_side, user_id: host_admin.id, spaces: [space]) }
      let!(:host_contributor_membership) { create(:space_membership, role: contributor_role, side: host_side, user_id: host_contributor.id, spaces: [space]) }
      let!(:host_contributor_membership2) { create(:space_membership, role: contributor_role, side: host_side, user_id: host_contributor2.id, spaces: [space]) }
      let!(:host_viewer_membership) { create(:space_membership, role: viewer_role, side: host_side, user_id: host_viewer.id, spaces: [space]) }

      context "content owned by same side" do

        describe "files" do
          let!(:file_from_contributor) { create(:user_file, scope: space.uid, parent_id: host_contributor.id, user_id: host_contributor.id) }
          let!(:file_from_admin) { create(:user_file, scope: space.uid, parent_id: host_admin.id, user_id: host_admin.id) }

          it "viewer can't edit content created by contributor or lead or admin" do
            context = Context.new(host_viewer.id, host_viewer.dxuser, "token", 1.hour.from_now.to_i, host_viewer.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(false)
            expect(file_from_admin.editable_by?(context)).to eq(false)
          end

          it "contributor can edit content created by another contributor or lead or admin" do
            context = Context.new(host_contributor2.id, host_contributor2.dxuser, "token", 1.hour.from_now.to_i, host_contributor2.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "admin or lead can edit content created by contributor or another lead or admin" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end
        end

      end

    end

    context "verification space" do
      let!(:space) { create(:space, :verification, state: :active) }

      let!(:host_admin_membership) { create(:space_membership, role: admin_role, side: host_side, user_id: host_admin.id, spaces: [space]) }
      let!(:host_contributor_membership) { create(:space_membership, role: contributor_role, side: host_side, user_id: host_contributor.id, spaces: [space]) }
      let!(:host_contributor_membership2) { create(:space_membership, role: contributor_role, side: host_side, user_id: host_contributor2.id, spaces: [space]) }
      let!(:host_viewer_membership) { create(:space_membership, role: viewer_role, side: host_side, user_id: host_viewer.id, spaces: [space]) }

      context "space not verified" do
        describe "files" do
          let!(:file_from_contributor) { create(:user_file, scope: space.uid, parent_id: host_contributor.id, user_id: host_contributor.id) }
          let!(:file_from_admin) { create(:user_file, scope: space.uid, parent_id: host_admin.id, user_id: host_admin.id) }

          it "viewer can't edit content created by contributor or lead or admin" do
            context = Context.new(host_viewer.id, host_viewer.dxuser, "token", 1.hour.from_now.to_i, host_viewer.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(false)
            expect(file_from_admin.editable_by?(context)).to eq(false)
          end

          it "contributor can edit content created by another contributor or lead or admin" do
            context = Context.new(host_contributor2.id, host_contributor2.dxuser, "token", 1.hour.from_now.to_i, host_contributor2.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "admin or lead can edit content created by contributor or another lead or admin" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end
        end
      end

      context "space not verified" do
        describe "files" do
          let!(:file_from_contributor) { create(:user_file, scope: space.uid, parent_id: host_contributor.id, user_id: host_contributor.id) }

          it "nobody can edit content in verified space" do
            space.update(verified: true)
            context = Context.new(host_contributor2.id, host_contributor2.dxuser, "token", 1.hour.from_now.to_i, host_contributor2.org_id)

            expect(file_from_contributor.editable_by?(context)).to eq(false)
          end
        end
      end

    end
  end
end
