require 'rails_helper'

RSpec.describe Space, type: :model do

  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:verified) { FactoryBot.create(:space, :verification, :verified, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
  let(:non_verified) { FactoryBot.create(:space, :verification, :non_verified, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
  let(:membership_host) { FactoryBot.create(:space_membership, user_id: host_lead.id) }
  let(:membership_guest) { FactoryBot.create(:space_membership, user_id: guest_lead.id) }

  let(:context){ double("context") }

  before  do
    allow(context).to receive(:guest?).and_return(false)
    allow(context).to receive(:user_id).and_return(guest_lead.id)
  end

  it 'should not be editiable when verified' do
    expect(verified.editable_by?(context)).to be_falsey
  end

  # it 'should not be verified and be editable' do
  #   expect(non_verified.editable_by?(context)).to be_truthy
  # end

  describe "from_scope for one scope" do
    context "with valid scope" do
      let(:space_scope) { verified.uid }
      let(:space) { Space.from_scope(space_scope) }

      it "return Space object" do
        expect(space.name).to eq(verified.name)
        expect(space.name).to eq(verified.name)
        expect(space.host_dxorg).to eq(verified.host_dxorg)
        expect(space.guest_dxorg).to eq(verified.guest_dxorg)
      end
    end

    context "with invalid scope" do
      let(:space_scope) { "" }
      let(:space) { Space.from_scope(space_scope) }

      it "raise RuntimeError" do
        expect { raise RuntimeError }.to raise_error(RuntimeError)
      end
    end

    # it "raise RuntimeError" do
      #   # puts("In invalid scope: space_scope = #{space_scope.inspect}")
      #   puts("In invalid scope: space_uid = #{space_uid.inspect}")
      #   allow(Space).to receive(:from_scope).with("").and_return(RuntimeError)
      #   allow_any_instance_of(Space)
      #     .to receive(:space_memberships)
      #           .with([space_uid])
      #           .and_return([])
      #   expect(Space.space_members_ids("")).to raise_exception
      # end
      # it "raise RuntimeError" do
      #   allow(Space).to receive(:from_scope).with("").and_return(RuntimeError)
      #   expect(Space.space_members_ids("")).to raise_error(RuntimeError, "oops")
      # end

      # it "returns a proper members ids array" do
      #   expect(space_members_ids).to be_a(Array)
      # end
  end

  # describe "space_members_ids for one space", focus: true   do
  #   context "with invalid scope" do
  #     # let(:space_scope) { Space.space_members_ids("") }
  #     let(:space_uid) { verified.uid }
  #     it "raise RuntimeError" do
  #       # puts("In invalid scope: space_scope = #{space_scope.inspect}")
  #       puts("In invalid scope: space_uid = #{space_uid.inspect}")
  #       allow(Space).to receive(:from_scope).with("").and_return(RuntimeError)
  #       allow_any_instance_of(Space)
  #         .to receive(:space_memberships)
  #               .with([space_uid])
  #               .and_return([])
  #       expect(Space.space_members_ids("")).to raise_exception
  #     end
  #     it "raise RuntimeError" do
  #       allow(Space).to receive(:from_scope).with("").and_return(RuntimeError)
  #       expect(Space.space_members_ids("")).to raise_error(RuntimeError, "oops")
  #     end
  #
  #     # it "returns a proper members ids array" do
  #     #   expect(space_members_ids).to be_a(Array)
  #     # end
  #   end
  # end
end
