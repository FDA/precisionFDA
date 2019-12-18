module Admin
  # Responsible for users provisioning.
  class InvitationsController < BaseController
    include ErrorProcessable
    include Naming

    ERROR_KEYS = %i(first_name last_name email org org_handle).freeze
    WARNING_KEYS = %i(org org_handle username).freeze

    before_action :redirect_to_list,
                  only: %i(search provision browse),
                  unless: -> { request.xhr? }

    # Lists invitations.
    def index; end

    # Searches invitations.
    def search
      query = unsafe_params[:query]
      exclude = unsafe_params[:exclude]
      invitations = InvitationSearcher.call(query, exclude).map do |invitation|
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
          organize_intent: invitation.organize_intent,
          participate_intent: invitation.participate_intent,
        }
      end

      render json: invitations
    end

    def provision
      results = {}

      unsafe_params[:invitations].each do |id, opts|
        invitation = Invitation.find(id)
        results[id] = provision_user(invitation, opts)
      end

      render json: results
    end

    def browse
      invitations = InvitationSearcher.call(nil, unsafe_params[:exclude])
      invitations_grid = initialize_grid(invitations)

      render json: {
        grid: render_to_string(
          partial: "admin/provision/invitations_grid",
          locals: {
            invitations: invitations_grid,
          },
        ),
      }
    end

    private

    def redirect_to_list
      redirect_to admin_invitations_path
    end

    def provision_user(invitation, opts)
      result = {}
      result[:errors] = errors(opts)

      return result if result[:errors].present?

      result[:warnings] = warnings(invitation, opts)
      save_user(invitation, opts)
      result.reject { |_k, v| v.blank? }
    end

    def errors(opts)
      add_errors(opts.slice(*ERROR_KEYS))
    end

    def warnings(invitation, opts)
      add_warnings(invitation, *opts.slice(*WARNING_KEYS).values)
    end

    def save_user(invitation, opts)
      service = DIContainer.resolve("orgs.provisioner")
      user_params = opts.merge(singular: true)
      service.call(context.user, invitation, user_params)
    end
  end
end
