# == Schema Information
#
# Table name: spaces
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  description          :text(65535)
#  host_project         :string(255)
#  guest_project        :string(255)
#  host_dxorg           :string(255)
#  guest_dxorg          :string(255)
#  meta                 :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  space_id             :integer
#  state                :integer          default("unactivated"), not null
#  space_type           :integer          default("groups"), not null
#  verified             :boolean          default(FALSE), not null
#  sponsor_org_id       :integer
#  restrict_to_template :boolean          default(FALSE)
#  inactivity_notified  :boolean          default(FALSE)
#

require "rails_helper"

RSpec.describe Space, type: :model do
  # rubocop:disable RSpec/AnyInstance
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:user_member) { create(:user, dxuser: "user_3") }
  let(:review) do
    create(
      :space,
      :review,
      :accepted,
      host_lead_id: host_lead.id,
      guest_lead_id: guest_lead.id,
    )
  end
  let(:membership_host) { create(:space_membership, user_id: host_lead.id) }
  let(:membership_guest) { create(:space_membership, user_id: guest_lead.id) }

  let(:context) { instance_double("context") }

  before do
    allow(context).to receive(:logged_in?).and_return(true)
    allow(context).to receive(:guest?).and_return(false)
    allow(context).to receive(:user).and_return(guest_lead)
    allow(context).to receive(:user_id).and_return(guest_lead.id)
  end

  describe "from_scope for one scope" do
    context "with valid scope" do
      let(:space_scope) { review.uid }
      let(:space) { described_class.from_scope(space_scope) }

      it "return Space object" do
        expect(space.name).to eq(review.name)
        expect(space.host_dxorg).to eq(review.host_dxorg)
        expect(space.guest_dxorg).to eq(review.guest_dxorg)
      end
    end

    context "with invalid scope" do
      let(:space_scope) { "" }
      let(:space) { described_class.from_scope(space_scope) }

      it "raise RuntimeError" do
        expect { raise RuntimeError }.to raise_error(RuntimeError)
      end
    end
  end

  describe "have_permission? to run app in space" do
    before { review.update(host_project: "project-#{SecureRandom.hex(12)}") }

    describe "with a valid space host_project" do
      let(:project) { review.host_project }

      context "when user_member has a viewer role" do
        before { review.space_memberships.viewer.host.create!(user_id: user_member.id) }

        it "returns no permission due to viewer role of a space member" do
          result = review.have_permission?(project, user_member)
          expect(result).to be_falsey
        end
      end

      context "when space member has an admin role" do
        before { review.space_memberships.admin.host.create!(user_id: user_member.id) }

        it "returns a permission" do
          result = review.have_permission?(project, user_member)
          expect(result).to be_truthy
        end
      end

      context "when space member has a contributor role" do
        before { review.space_memberships.contributor.host.create!(user_id: user_member.id) }

        it "returns a permission" do
          result = review.have_permission?(project, user_member)
          expect(result).to be_truthy
        end
      end
    end

    describe "with invalid space host_project" do
      let(:project) { nil }

      context "when space member has a viewer role" do
        before { review.space_memberships.viewer.host.create!(user_id: user_member.id) }

        it "returns no permission due to invalid space host_project" do
          result = review.have_permission?(project, user_member)
          expect(result).to be_falsey
        end
      end

      context "when space member has an admin role" do
        before { review.space_memberships.admin.host.create!(user_id: user_member.id) }

        it "returns no permission due to invalid space host_project" do
          result = review.have_permission?(project, user_member)
          expect(result).to be_falsey
        end
      end

      context "when space member has a contributor role" do
        before { review.space_memberships.contributor.host.create!(user_id: user_member.id) }

        it "returns no permission due to invalid space host_project" do
          result = review.have_permission?(project, user_member)
          expect(result).to be_falsey
        end
      end
    end
  end

  describe "member" do
    context "when user is a space member" do
      let(:lead_id) { host_lead.id }

      it "returns SpaceMembership object with user member id" do
        expect(review.member(lead_id).user_id).to eq lead_id
      end
    end

    context "when user is not a space member" do
      let(:lead_id) { FFaker::Random.rand(5) }

      it "returns nil" do
        expect(review.member(lead_id)).to be_nil
      end
    end
  end

  describe "member_in_cooperative?" do
    let(:confidential) do
      create(
        :space,
        :review,
        :active,
        space_id: review.id,
        host_lead_id: host_lead.id,
        guest_lead_id: guest_lead.id,
      )
    end
    let(:member_id) { user_member.id }

    context "when user is a confidential space member" do
      before { confidential.space_memberships.contributor.host.create!(user_id: member_id) }

      context "when a confidential space member has a non-viewer role" do
        it "returns SpaceMembership object with user member id" do
          expect(confidential.member(member_id).lead_or_admin_or_contributor?).to be_truthy
        end
      end

      it "returns SpaceMembership object with user member id" do
        expect(confidential.member_in_cooperative?(member_id)).to be_falsey
      end

      context "when user is also a cooperative space member" do
        before { review.space_memberships.contributor.host.create!(user_id: member_id) }

        it "returns SpaceMembership object with user member id" do
          expect(confidential.member_in_cooperative?(member_id)).to be_truthy
        end
      end
    end

    context "when user is a confidential space member" do
      before { confidential.space_memberships.viewer.host.create!(user_id: member_id) }

      context "when a confidential space member has a viewer role" do
        it "returns SpaceMembership object with user member id" do
          expect(confidential.member(member_id).viewer?).to be_truthy
        end
      end

      it "returns SpaceMembership object with user member id" do
        expect(confidential.member_in_cooperative?(member_id)).to be_falsey
      end

      context "when user is also a cooperative space member" do
        before { review.space_memberships.viewer.host.create!(user_id: member_id) }

        it "returns SpaceMembership object with user member id" do
          expect(confidential.member_in_cooperative?(member_id)).to be_truthy
        end
      end
    end
  end

  describe "accessible_by?" do
    subject(:accessible_by) { review.accessible_by?(context) }

    let(:context) { Context.new(host_lead.id, host_lead.dxuser, SecureRandom.uuid, nil, nil) }

    context "when user context is a space member and space_membership is active" do
      it "returns true" do
        expect(accessible_by).to be_truthy
      end
    end

    context "when user context is space member and space_memberships are not active" do
      before { review.space_memberships.map { |membership| membership.update(active: false) } }

      it "returns false" do
        expect(accessible_by).to be_falsey
      end
    end

    context "when user context is not a space member" do
      before do
        review.space_memberships.map { |membership| membership.update(user_id: user_member.id) }
      end

      it "returns false" do
        expect(accessible_by).to be_falsey
      end
    end
  end
  # rubocop:enable RSpec/AnyInstance
end
