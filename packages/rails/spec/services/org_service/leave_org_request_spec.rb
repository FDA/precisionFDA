require "rails_helper"

describe OrgService::LeaveOrgRequest do
  subject(:service) { described_class.new(policy) }

  let(:user) { build(:user) }
  let(:org) { build(:org) }
  let(:policy) { class_double("UserRemovalPolicy") }
  let(:request) { instance_double("OrgActionRequest") }

  describe "#call" do
    it "calls policy to decide if user can be removed" do
      allow(policy).to receive(:satisfied?).and_return(true)

      service.call(org, user)

      expect(policy).to have_received(:satisfied?).with(org, user)
    end

    context "when policy doesn't satisfied" do
      before do
        allow(policy).to receive(:satisfied?).and_return(false)
      end

      it "raises StandardError" do
        expect { service.call(org, user) }.to raise_error(RuntimeError)
      end
    end

    context "when policy is satisfied" do
      before do
        allow(policy).to receive(:satisfied?).and_return(true)
        allow(OrgActionRequest).to receive(:create!).and_return(request)
      end

      it "correctly creates and returns created request" do
        created_request = service.call(org, user)

        expect(OrgActionRequest).to have_received(:create!).
          with(initiator: user,
               org: org,
               action_type: OrgActionRequest::Type::LEAVE,
               state: OrgActionRequest::State::NEW)

        expect(created_request).to eq(request)
      end
    end
  end
end
