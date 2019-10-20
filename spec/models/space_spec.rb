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
#  state                :integer          default(0), not null
#  space_type           :integer          default(0), not null
#  verified             :boolean          default(FALSE), not null
#  sponsor_org_id       :integer
#  space_template_id    :integer
#  restrict_to_template :boolean          default(FALSE)
#  inactivity_notified  :boolean          default(FALSE)
#

require "rails_helper"

RSpec.describe Space, type: :model do
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:verified) do
    create(
      :space,
      :verification,
      :verified,
      host_lead_id: host_lead.id,
      guest_lead_id: guest_lead.id,
    )
  end
  let(:non_verified) do
    create(
      :space,
      :verification,
      :non_verified,
      host_lead_id: host_lead.id,
      guest_lead_id: guest_lead.id,
    )
  end
  let(:membership_host) { create(:space_membership, user_id: host_lead.id) }
  let(:membership_guest) { create(:space_membership, user_id: guest_lead.id) }

  let(:context) { instance_double("context") }

  before do
    allow(context).to receive(:guest?).and_return(false)
    allow(context).to receive(:user_id).and_return(guest_lead.id)
  end

  it "when verified to not be editiable" do
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
  end
end
