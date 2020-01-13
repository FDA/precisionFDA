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

    # GET
    # Lists invitations.
    def index
      js countries: Country.pluck(:name, :id)
    end

    # GET
    # Searches invitations.
    def search
      query = unsafe_params[:query]
      exclude = unsafe_params[:exclude]

      render_invitations(query, exclude)
    end

    # POST
    # Responsible for users provision.
    def provision
      results = {}

      unsafe_params[:invitations].each do |id, opts|
        invitation = Invitation.find(id)
        first_name = opts[:first_name]
        last_name = opts[:last_name]
        username = User.construct_username(first_name, last_name)
        org = "#{first_name.capitalize} #{last_name.capitalize}"

        full_opts = opts.merge(
          username: username,
          org: org,
          org_handle: username,
        )

        results[id] = provision_user(invitation, full_opts)
      end

      render json: results
    end

    # GET
    # Renders list of invitations for browsing.
    def browse
      render_invitations(nil, unsafe_params[:exclude])
    end

    private

    # Searches and renders invitations.
    # @param query [String] Query to search invitations.
    # @param exclude [Array<Integer>] Invitations ids to exclude from search.
    def render_invitations(query, exclude)
      invitations = InvitationSearcher.call(query, exclude)
      serialized = invitations.map { |invitation| InvitationSerializer.call(invitation) }

      render json: serialized
    end

    # Redirects to invitations index page.
    def redirect_to_list
      redirect_to admin_invitations_path
    end

    # Provisions user.
    # @param invitation [Invitation] Invitation to use for provision.
    # @param opts [Hash] Options to use for provision.
    # @return [Hash] Hash containing array of errors if any.
    def provision_user(invitation, opts)
      result = { errors: errors(opts) }

      return result if result[:errors].present?

      save_user(invitation, opts)

      result
    end

    # Validates provided opts.
    # @param opts [Hash] Options to validate.
    def errors(opts)
      add_errors(opts.slice(*ERROR_KEYS))
    end

    # Performs user provisioning.
    # @param invitation [Invitation] Invitation to use for provision.
    # @param opts [Hash] Options to use for provision.
    def save_user(invitation, opts)
      service = DIContainer.resolve("orgs.provisioner")
      user_params = opts.merge(singular: true)
      service.call(@context.user, invitation, user_params)
    end
  end
end
