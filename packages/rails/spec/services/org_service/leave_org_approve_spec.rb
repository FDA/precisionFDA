require "rails_helper"

describe OrgService::LeaveOrgApprove do
  subject(:service) { described_class.new(admin, mailer) }

  let(:mailer) { double }
  let(:mail) { double }
  let(:admin) { build(:user) }
  let(:request) { build(:org_action_request_leave) }
  let(:remove_request) { build(:org_action_request_remove_member) }

  before do
    allow(mail).to receive(:deliver_now!).and_return(nil)
    allow(mailer).to receive(:user_remove_approved_email).and_return(mail)
    allow(mailer).to receive(:user_leave_approved_email).and_return(mail)
  end

  context "when admin is not FDA admin" do
    before do
      allow(admin).to receive(:can_administer_site?).and_return(false)
    end

    it "raises RuntimeError" do
      expect { service.call(request) }.to raise_error(RuntimeError)
    end
  end

  context "when admin is FDA admin" do
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
      let(:approval_time) { Time.now }

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

      context "when request is REMOVE_MEMBER" do
        it "correctly calls mailer" do
          service.call(remove_request)

          expect(mailer).to(
            have_received(:user_remove_approved_email).
              with(remove_request.org, remove_request.member, admin),
          )

          expect(mail).to have_received(:deliver_now!)
        end
      end

      context "when request is LEAVE" do
        it "correctly calls mailer" do
          service.call(request)

          expect(mailer).to(
            have_received(:user_leave_approved_email).
              with(request.org, request.initiator, admin),
          )

          expect(mail).to have_received(:deliver_now!)
        end
      end
    end
  end
end
