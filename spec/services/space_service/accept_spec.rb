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
    context "when guest is empty" do
      let(:space) { create(:space, :verification, guest_dxorg: nil, host_lead_id: host_lead.id) }

      before { space.leads.guest.first.destroy }

      it "it makes the space active" do
        expect { host_response }.to change(space, :state).from(Space::STATES.first.to_s)
          .to(Space::STATES.second.to_s)
      end
    end

    context "when guest is the same as host" do
      let(:space) { create(:space, :verification, host_lead_id: host_lead.id, guest_lead_id: host_lead.id) }

      it "it makes the space active" do
        expect { host_response }.to change(space, :state).from(Space::STATES.first.to_s)
          .to(Space::STATES.second.to_s)
      end
    end

    context "when guest and host are different" do
      let(:space) { create(:space, :verification, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id) }
      let(:guest_response) { described_class.call(DNAnexusAPI.new(SecureRandom.uuid), space, space.leads.guest.first) }

      context "and only host accepted the space" do
        it "it doesn't make the space active" do
          expect { host_response }.not_to change(space, :state).from(Space::STATES.first.to_s)
        end
      end

      context "and only guest accepted the space" do
        it "it doesn't make the space active" do
          expect { guest_response }.not_to change(space, :state).from(Space::STATES.first.to_s)
        end
      end

      context "and the both accepted the space" do
        let(:common_response) do
          host_response
          guest_response
        end

        it "it makes the space active" do
          expect { common_response }.to change(space, :state).from(Space::STATES.first.to_s)
            .to(Space::STATES.second.to_s)
        end
      end
    end
  end
end
