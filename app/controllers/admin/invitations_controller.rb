module Admin
  # Responsible for users provisioning.
  class InvitationsController < BaseController
    include ErrorProcessable
    include Naming

    ERROR_KEYS = %i(first_name last_name email org org_handle username).freeze
    WARNING_KEYS = %i(org org_handle username).freeze

    before_action :redirect_to_list,
                  only: %i(search provision browse),
                  unless: -> { request.xhr? }

    # GET
    # Lists invitations.
    def index
      js countries: Country.pluck(:name, :id)
    end

    # POST
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

      # rubocop:todo Lint/NonLocalExitFromIterator
      Utils.each_with_delay(unsafe_params[:invitations].to_a, rand(1..1.5)) do |inv_params|
        invitation_id = inv_params.first
        opts = inv_params.last

        invitation = Invitation.find(invitation_id)

        begin
          results[invitation_id] = provision_user(invitation, opts)
        rescue DXClient::Errors::TooManyRequestsError => e
          render(json: { error: e.message }, status: :bad_request) && return
        end
      end
      # rubocop:enable Lint/NonLocalExitFromIterator

      render json: results
    end

    # POST
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
      first_name = opts[:first_name]
      last_name = opts[:last_name]

      username = find_unused_username(User.construct_username(first_name, last_name))
      org_name = username.titleize.gsub(".", " ")

      full_opts = opts.merge(
        username: username,
        org: org_name,
        org_handle: find_unused_orgname(username),
      )

      result = { errors: errors(full_opts), user: { username: username } }

      return result if result[:errors].present?

      save_user(invitation, full_opts)

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
