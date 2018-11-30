require 'rails_helper'

RSpec.describe Space, type: :model do

  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:verified) { FactoryBot.create(:space, :verification, :verified, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
  let(:non_verified) { FactoryBot.create(:space, :verification, :non_verified, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }

  let(:context){ double("context") }

  before  do
    allow(context).to receive(:guest?).and_return(false)
    allow(context).to receive(:user_id).and_return(guest_lead.id)
  end

  it 'should not be editiable when verified' do
    expect(verified.editable_by?(context)).to be_falsey
  end

  it 'should not be verified and be editable' do
    expect(non_verified.editable_by?(context)).to be_truthy
  end
end
