# Service that allows to create invitations and send correspondent emails
class RequestAccessService
  class << self
    # Creates a user's request for site access.
    # Skips emails sendings if invitation did not created before.
    # @param params [Hash] invitation attributes.
    # @return invitation [Invitation] or not persisted invitation object.
    def create_request_for_access(params)
      invitation = create_invitation(params)

      if invitation.persisted?
        send_invitation_email(invitation)
        send_guest_access_email(invitation)
      end

      invitation
    end

    def send_invitation_email(invitation)
      NotificationsMailer.invitation_email(invitation).deliver_now!
    end

    def send_guest_access_email(invitation)
      NotificationsMailer.guest_access_email(invitation).deliver_now!
    end

    # Creates an invitation for site access.
    # Skips Auditor.perform_audit and Event creation if invitation did not created before.
    # @param params [Hash] invitation attributes.
    # @return invitation [Invitation] or not persisted invitation object.
    def create_invitation(params)
      full_params = params.merge(code: SecureRandom.uuid)
      invitation = nil

      ActiveRecord::Base.transaction do
        invitation = Invitation.create(full_params)

        if invitation.persisted?
          Auditor.perform_audit(audit_data(full_params))
          Event::UserAccessRequested.create_for(invitation)
        end
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
