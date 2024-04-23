describe RequestAccessService do
  subject(:service) { described_class }

  let(:invitation_mail) { instance_double("Mailer", deliver_later!: nil) }
  let(:guest_access_mail) { instance_double("Mailer", deliver_later!: nil) }

  describe "::create_request_for_access" do
    before do
      allow(Event::UserAccessRequested).to receive(:create_for)
      allow(NotificationsMailer).to receive_messages(
        invitation_email: invitation_mail,
        guest_access_email: guest_access_mail,
      )
    end

    context "when invitation was created" do
      let!(:invitation) { create(:invitation, org: nil) }

      before do
        allow(Invitation).to receive(:create).and_return(invitation)
        allow(Auditor).to receive(:perform_audit)
      end

      it "creates new invitation" do
        service.create_request_for_access({})
        expect(Invitation).to have_received(:create)
      end

      it "returns created invitation" do
        created_invitation = service.create_request_for_access({})
        expect(created_invitation).to eq(invitation)
      end

      it "creates audit record" do
        service.create_request_for_access({})
        expect(Auditor).to have_received(:perform_audit)
      end

      it "creates event" do
        service.create_request_for_access({})
        expect(Event::UserAccessRequested).to have_received(:create_for)
      end

      it "sends invitation email" do
        service.create_request_for_access({})
        expect(NotificationsMailer).to have_received(:invitation_email).with(invitation)
      end

      it "sends guest access email" do
        service.create_request_for_access({})
        expect(NotificationsMailer).to have_received(:guest_access_email).with(invitation)
      end
    end

    context "when invitation was not created" do
      let!(:invitation) { build(:invitation, org: nil) }

      before do
        allow(Invitation).to receive(:create).and_return(invitation)
        allow(Auditor).to receive(:perform_audit)
      end

      it "returns non persisted invitation" do
        built_invitation = service.create_request_for_access({})
        expect(Invitation).to have_received(:create)
        expect(built_invitation).to eq(invitation)
      end

      it "does not creates audit record" do
        service.create_request_for_access({})
        expect(Auditor).not_to have_received(:perform_audit)
      end

      it "does not creates event" do
        service.create_request_for_access({})
        expect(Event::UserAccessRequested).not_to have_received(:create_for)
      end

      it "does not sends invitation email" do
        service.create_request_for_access({})
        expect(NotificationsMailer).not_to have_received(:invitation_email).with(invitation)
      end

      it "does not sends guest access email" do
        service.create_request_for_access({})
        expect(NotificationsMailer).not_to have_received(:guest_access_email).with(invitation)
      end
    end
  end
end
