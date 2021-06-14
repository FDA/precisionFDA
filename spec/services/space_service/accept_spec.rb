require "rails_helper"

RSpec.describe SpaceService::Accept, type: :service do
  let(:host_response) do
    described_class.call(DNAnexusAPI.new(SecureRandom.uuid), space, space.leads.host.first)
  end

  let(:host_lead) { create(:user) }
  let(:guest_lead) { create(:user) }

  before do
    rack = PlatformRack.new
    stub_request(:any, /^#{rack.path}/).to_rack(rack)
  end

  describe "#call" do
    let(:space) { create(:space, :group, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
    let(:guest_response) do
      described_class.call(DNAnexusAPI.new(SecureRandom.uuid), space, space.leads.guest.first)
    end

    context "when only host accepted the space" do
      it "doesn't make the space active" do
        expect { host_response }.not_to change(space, :state).from(Space::STATE_UNACTIVATED)
      end
    end

    context "when only guest accepted the space" do
      it "doesn't make the space active" do
        expect { guest_response }.not_to change(space, :state).from(Space::STATE_UNACTIVATED)
      end
    end

    context "when the both accepted the space" do
      let(:common_response) do
        host_response
        guest_response
      end

      it "makes the space active" do
        expect { common_response }.to change(space, :state).from(Space::STATE_UNACTIVATED).
          to(Space::STATE_ACTIVE)
      end
    end
  end
end
