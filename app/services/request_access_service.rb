# Service that allows to create invitations and send correspondent emails
class RequestAccessService
  class << self
    def create_request_for_access(params)
      invitation = create_invitation(params)
      send_invitation_email(invitation)
      send_guest_access_email(invitation)
      invitation
    end

    def send_invitation_email(invitation)
      NotificationsMailer.invitation_email(invitation).deliver_now!
    end

    def send_guest_access_email(invitation)
      NotificationsMailer.guest_access_email(invitation).deliver_now!
    end

    def create_invitation(params)
      full_params = params.merge(code: SecureRandom.uuid)
      invitation = nil

      ActiveRecord::Base.transaction do
        invitation = Invitation.create(full_params)
        Auditor.perform_audit(audit_data(full_params))
        Event::UserAccessRequested.create_for(invitation)
      end

      invitation
    end

    private

    def audit_data(params)
      {
        action: "create",
        record_type: "Access Request",
        record: {
          message: "Access requested: #{params.to_json}",
        },
      }
    end
  end
end
