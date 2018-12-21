require 'rails_helper'
require 'auditor_helper'

RSpec.describe Permissions do
  let(:viewer_role) { SpaceMembership::ROLE_VIEWER }
  let(:member_role) { SpaceMembership::ROLE_MEMBER }
  let(:admin_role) { SpaceMembership::ROLE_ADMIN }
  let(:host_side) { SpaceMembership::SIDE_HOST }
  let(:guest_side) { SpaceMembership::SIDE_GUEST }

  let(:host_admin) { create(:user, dxuser: "user_3") }
  let(:host_member) { create(:user, dxuser: "user_4") }
  let(:host_member2) { create(:user, dxuser: "user_5") }
  let(:host_viewer) { create(:user, dxuser: "user_6") }
  let(:guest_admin) { create(:user, dxuser: "user_7") }

  describe "editable_by? context" do
    context "review space" do
      let!(:space) { create(:space, :review, state: :active) }

      let!(:host_admin_membership) { create(:space_membership, role: admin_role, side: host_side, user_id: host_admin.id, spaces: [space]) }
      let!(:host_member_membership) { create(:space_membership, role: member_role, side: host_side, user_id: host_member.id, spaces: [space]) }
      let!(:host_member_membership2) { create(:space_membership, role: member_role, side: host_side, user_id: host_member2.id, spaces: [space]) }
      let!(:host_viewer_membership) { create(:space_membership, role: viewer_role, side: host_side, user_id: host_viewer.id, spaces: [space]) }
      let!(:guest_admin_membership) { create(:space_membership, role: member_role, side: guest_side, user_id: guest_admin.id, spaces: [space]) }

      context "content owned by same side" do

        describe "files" do
          let!(:file_from_member) { create(:user_file, scope: space.uid, parent_id: host_member.id, user_id: host_member.id) }
          let!(:file_from_admin) { create(:user_file, scope: space.uid, parent_id: host_admin.id, user_id: host_admin.id) }

          it "viewer can't edit content created by member or lead or admin" do
            context = Context.new(host_viewer.id, host_viewer.dxuser, "token", 1.hour.from_now.to_i, host_viewer.org_id)

            expect(file_from_member.editable_by?(context)).to eq(false)
            expect(file_from_admin.editable_by?(context)).to eq(false)
          end

          it "member can edit content created by another member or lead or admin" do
            context = Context.new(host_member2.id, host_member2.dxuser, "token", 1.hour.from_now.to_i, host_member2.org_id)

            expect(file_from_member.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "admin or lead can edit content created by member or another lead or admin" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_member.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "inactive member cannot edit content" do
            host_admin_membership.update(active: false)
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_admin.editable_by?(context)).to eq(false)
          end
        end

      end

      context "content owned by other side" do
        describe "files" do
          let!(:file_from_member) { create(:user_file, scope: space.uid, parent_id: guest_admin.id, user_id: guest_admin.id) }

          it "member cannot edit content" do
            context = Context.new(host_member2.id, host_member2.dxuser, "token", 1.hour.from_now.to_i, host_member2.org_id)

            expect(file_from_member.editable_by?(context)).to eq(false)
          end

          it "admin or lead cannot edit content" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_member.editable_by?(context)).to eq(false)
          end
        end
      end

      context "content owner does not have membership" do
        describe "files" do
          let!(:file_from_member) { create(:user_file, scope: space.uid, parent_id: host_member.id, user_id: host_member.id) }

          it "content owner is considered as reviewer" do
            host_member_membership.destroy
            context = Context.new(host_member2.id, host_member2.dxuser, "token", 1.hour.from_now.to_i, host_member2.org_id)

            expect(file_from_member.editable_by?(context)).to eq(true)
          end
        end
      end

      context "space restrict_to_template and not shared" do
        describe "files" do
          let!(:confid_space) { space.confidential_space(host_member_membership) }
          let!(:file_from_member) { create(:user_file, scope: confid_space.uid, parent_id: host_member.id, user_id: host_member.id) }

          it "nobody can edit content" do
            confid_space.update(restrict_to_template: true)
            context = Context.new(host_member2.id, host_member2.dxuser, "token", 1.hour.from_now.to_i, host_member2.org_id)

            expect(file_from_member.editable_by?(context)).to eq(false)
          end
        end
      end

    end

    context "groups space" do
      let!(:space) { create(:space, :group, state: :active) }

      let!(:host_admin_membership) { create(:space_membership, role: admin_role, side: host_side, user_id: host_admin.id, spaces: [space]) }
      let!(:host_member_membership) { create(:space_membership, role: member_role, side: host_side, user_id: host_member.id, spaces: [space]) }
      let!(:host_member_membership2) { create(:space_membership, role: member_role, side: host_side, user_id: host_member2.id, spaces: [space]) }
      let!(:host_viewer_membership) { create(:space_membership, role: viewer_role, side: host_side, user_id: host_viewer.id, spaces: [space]) }

      context "content owned by same side" do

        describe "files" do
          let!(:file_from_member) { create(:user_file, scope: space.uid, parent_id: host_member.id, user_id: host_member.id) }
          let!(:file_from_admin) { create(:user_file, scope: space.uid, parent_id: host_admin.id, user_id: host_admin.id) }

          it "viewer can't edit content created by member or lead or admin" do
            context = Context.new(host_viewer.id, host_viewer.dxuser, "token", 1.hour.from_now.to_i, host_viewer.org_id)

            expect(file_from_member.editable_by?(context)).to eq(false)
            expect(file_from_admin.editable_by?(context)).to eq(false)
          end

          it "member can edit content created by another member or lead or admin" do
            context = Context.new(host_member2.id, host_member2.dxuser, "token", 1.hour.from_now.to_i, host_member2.org_id)

            expect(file_from_member.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "admin or lead can edit content created by member or another lead or admin" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_member.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end
        end

      end

    end

    context "verification space" do
      let!(:space) { create(:space, :verification, state: :active) }

      let!(:host_admin_membership) { create(:space_membership, role: admin_role, side: host_side, user_id: host_admin.id, spaces: [space]) }
      let!(:host_member_membership) { create(:space_membership, role: member_role, side: host_side, user_id: host_member.id, spaces: [space]) }
      let!(:host_member_membership2) { create(:space_membership, role: member_role, side: host_side, user_id: host_member2.id, spaces: [space]) }
      let!(:host_viewer_membership) { create(:space_membership, role: viewer_role, side: host_side, user_id: host_viewer.id, spaces: [space]) }

      context "space not verified" do

        describe "files" do
          let!(:file_from_member) { create(:user_file, scope: space.uid, parent_id: host_member.id, user_id: host_member.id) }
          let!(:file_from_admin) { create(:user_file, scope: space.uid, parent_id: host_admin.id, user_id: host_admin.id) }

          it "viewer can't edit content created by member or lead or admin" do
            context = Context.new(host_viewer.id, host_viewer.dxuser, "token", 1.hour.from_now.to_i, host_viewer.org_id)

            expect(file_from_member.editable_by?(context)).to eq(false)
            expect(file_from_admin.editable_by?(context)).to eq(false)
          end

          it "member can edit content created by another member or lead or admin" do
            context = Context.new(host_member2.id, host_member2.dxuser, "token", 1.hour.from_now.to_i, host_member2.org_id)

            expect(file_from_member.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end

          it "admin or lead can edit content created by member or another lead or admin" do
            context = Context.new(host_admin.id, host_admin.dxuser, "token", 1.hour.from_now.to_i, host_admin.org_id)

            expect(file_from_member.editable_by?(context)).to eq(true)
            expect(file_from_admin.editable_by?(context)).to eq(true)
          end
        end

      end

      context "space not verified" do

        describe "files" do
          let!(:file_from_member) { create(:user_file, scope: space.uid, parent_id: host_member.id, user_id: host_member.id) }

          it "nobody can edit content in verified space" do
            space.update(verified: true)
            context = Context.new(host_member2.id, host_member2.dxuser, "token", 1.hour.from_now.to_i, host_member2.org_id)

            expect(file_from_member.editable_by?(context)).to eq(false)
          end
        end

      end

    end
  end
end
