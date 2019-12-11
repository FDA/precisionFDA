require "rails_helper"

describe OrgService::DissolveOrgApprove do
  let(:admin) { build(:user) }
  let(:org) { build(:org, admin: admin) }
  let(:request) { build(:org_action_request_dissolve, org: org) }
  let(:mailer) { nil }

  context "when admin is not FDA admin" do
    subject(:service) { described_class.new(admin, mailer, leave_org_request_creator) }

    let(:leave_org_request_creator) { instance_double("OrgService::LeaveOrgRequest", call: nil) }

    before do
      allow(admin).to receive(:can_administer_site?).and_return(false)
    end

    it "raises RuntimeError" do
      expect { service.call(request) }.to raise_error(RuntimeError)
    end
  end

  context "when admin is FDA admin" do
    subject(:service) { described_class.new(admin, mailer, leave_org_request_creator) }

    let(:leave_org_request_creator) { instance_double("OrgService::LeaveOrgRequest", call: nil) }

    before do
      allow(admin).to receive(:can_administer_site?).and_return(true)
    end

    it "doesn't raise error" do
      expect { service.call(request) }.not_to raise_error
    end

    context "when request is not NEW" do
      it "raises RuntimeError" do
        request.state = nil

        expect { service.call(request) }.to raise_error(RuntimeError)
      end
    end

    context "when request is NEW" do
      let(:approval_time) { Time.current }

      before do
        allow(request).to receive(:update!)
        allow(Time).to receive(:now).and_return(approval_time)
      end

      it "updates request" do
        service.call(request)

        expect(request).to have_received(:update!).
          with(
            state: OrgActionRequest::State::APPROVED,
            approver: admin,
            approved_at: approval_time,
          )
      end
    end
  end

  context "when org dissolving request is approved" do
    subject(:service) { described_class.new(admin, mailer, leave_org_request_creator) }

    let(:policy) { class_double("UserRemovalPolicy") }
    let(:leave_org_request_creator) { OrgService::LeaveOrgRequest.new(policy) }

    before do
      allow(policy).to receive(:satisfied?).and_return(true)
      allow(admin).to receive(:can_administer_site?).and_return(true)

      org.update!(
        users: [create_list(:user, 3), admin].flatten,
      )
    end

    it "creates and approves leave requests for all users in org" do
      service.call(request)

      leave_requests = OrgActionRequest.where(
        action_type: OrgActionRequest::Type::LEAVE_ON_DISSOLVE,
        state: OrgActionRequest::State::APPROVED,
      )

      expect(leave_requests.count).to eq(4)
    end

    it "doesn't create leave request for user who's already have one" do
      create(:org_action_request_leave, org: org, initiator: org.users.first)
      create(:org_action_request_leave, org: org, initiator: org.users.second)

      service.call(request)

      leave_requests = OrgActionRequest.where(
        action_type: OrgActionRequest::Type::LEAVE_ON_DISSOLVE,
        state: OrgActionRequest::State::APPROVED,
      )

      expect(leave_requests.count).to eq(2)
      expect(leave_requests.map(&:initiator)).to eq(org.users[2..-1])
    end
  end
end
