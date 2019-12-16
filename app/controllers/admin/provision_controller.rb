module Admin
  # Responsible for users provisioning.
  class ProvisionController < BaseController
    include ErrorProcessable
    include Naming

    USER_FIELDS = %i(
      org
      org_handle
      username
      email
      first_name
      last_name
      country
      address
      duns
      phone
    ).freeze

    ERROR_KEYS = %i(first_name last_name email org org_handle).freeze
    WARNING_KEYS = %i(org org_handle username).freeze

    # Lists invitations.
    def invitations; end

    # Searches invitations.
    def search_invitations
      invitations = InvitationSearcher.call(unsafe_params[:query]).map do |invitation|
        {
          id: invitation.id,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          email: invitation.email,
          address1: invitation.address1,
          address2: invitation.address2,
          country: invitation.country.name,
          city: invitation.city,
          us_state: invitation.us_state,
          postal_code: invitation.postal_code,
          phone: invitation.full_phone,
          duns: invitation.duns,
        }
      end

      render json: invitations
    end

    def provision_users
      results = {}

      unsafe_params[:invitations].each do |id, opts|
        current_result = {}
        invitation = Invitation.find(id)
        errors = add_errors(opts.slice(*ERROR_KEYS))
        current_result[:errors] = errors && next if errors.present?
        warnings = add_warnings(invitation, *opts.slice(*WARNING_KEYS).values)
        current_result[:warnings] = warnings if warnings.present?

        save_user(invitation, opts)

        results[id] = current_result
      end

      render json: results
    end

    private

    def save_user(invitation, opts)
      service = DIContainer.resolve("orgs.provisioner")
      user_params = opts.slice(*USER_FIELDS).merge(singular: true)
      service.call(context.user, invitation, user_params)
    end
  end
end
