module OrgService
  # Provisions user and his org on platform and stores info in database.
  # rubocop:disable Metrics/ClassLength
  class Provision
    # @param platform_service [OrgService::ProvisionOnPlatform] Service that provisions
    #   org on the platform.
    def initialize(platform_service)
      @platform_service = platform_service
      @admin = nil
      @invitation = nil
      @params = {}
    end

    # Provisions user and his org on the platform and stores info in database.
    # @param admin [User] Admin who provisions the org.
    # @param invitation [Invitation] Invitation to get info from.
    # @param params [Hash] Additional params for org and user.
    def call(admin, invitation, params)
      @admin = admin
      @invitation = invitation
      @params = params

      audit_before_create
      provide_org_on_platform
      user, org = store_data

      audit_created_org(user, org)
    end

    private

    # Creates audit record before org starts being provisioned.
    def audit_before_create
      Auditor.perform_audit(
        action: "create",
        record_type: "Provision Org",
        record: {
          message: "The system is about to start provisioning admin '#{@params[:username]}' " \
                   "and org '#{@params[:org_handle]}' (self-represented) " \
                   "initiated by '#{@admin.dxuser}'",
        },
      )
    end

    # Provisions org on the platform.
    def provide_org_on_platform
      @platform_service.call(
        org: @params[:org],
        username: @params[:username],
        org_handle: @params[:org_handle],
        email: @params[:email],
        first_name: @params[:first_name],
        last_name: @params[:last_name],
      )
    end

    # Stores org's and user's data in the database.
    def store_data
      user = org = nil

      ActiveRecord::Base.transaction do
        org = create_org
        user = create_user(org)
        create_profile(user)
        @invitation.update!(user_id: user.id)
        add_user_to_spaces(user)
      end

      [user, org]
    end

    # Stores org in the database.
    # @return [Org] Created org.
    def create_org
      Org.create!(
        name: @params[:org],
        handle: @params[:org_handle],
        address: @params[:address],
        duns: @params[:duns],
        phone: @params[:phone],
        singular: @params[:singular],
        state: "complete",
      )
    end

    # Stores user in the database.
    # @param org [Org] Org to create user for.
    # @return [User] Created user.
    def create_user(org)
      user = org.users.create!(
        dxuser: @params[:username],
        schema_version: User::CURRENT_SCHEMA,
        email: @params[:email],
        first_name: @params[:first_name],
        last_name: @params[:last_name],
        normalized_email: @params[:email].downcase,
      )
      org.update!(admin_id: user.id)
      user
    end

    # add user to spaces if there is any invitation
    def add_user_to_spaces(user)
      space_invitations = @invitation.space_invitations

      return if space_invitations.empty?

      space_invitations.each do |space_invitation|
        add_user_to_space(user, space_invitation)
      end

      space_invitations.each(&:destroy!)
    end

    def add_user_to_space(user, space_invitation)
      space = space_invitation.space
      inviter = space_invitation.inviter

      space_invite_form = create_invite_form(space, user, space_invitation.role)

      unless space_invite_form.valid?
        logger.warn(
          "Can't invite user #{user.dxuser} to " \
          "space '#{space.title}' due to the following errors: " \
          "#{space_invite_form.errors.full_messages.to_sentence}",
        )

        return
      end

      inviter_membership = fetch_inviter_membership(space, inviter)

      unless inviter_membership
        logger.warn(
          "Space inviter #{inviter.username} has no permissions " \
          "to invite to '#{space.title}' space",
        )

        return
      end

      space_invite_form.invite(inviter_membership, @platform_service.admin_api)
    end

    def create_invite_form(space, user, role)
      SpaceInviteForm.new(
        space: space,
        invitees_role: role,
        invitees: user.dxuser,
      )
    end

    def fetch_inviter_membership(space, inviter)
      membership = space.space_memberships.active.find_by(user: inviter)

      if membership.nil? && inviter.review_space_admin?
        SpaceMembership.new_by_admin(inviter)
      else
        membership
      end
    end

    # Stores user's profile in the database.
    # @param user [User] User to create profile for.
    # @return [Profile] Created user's profile.
    def create_profile(user)
      profile = user.build_profile(
        @invitation.
          slice(:address1, :address2, :phone, :city,
                :us_state, :postal_code, :country, :phone_country).
          merge(phone_confirmed: @invitation.new_phone_format?, email: @params[:email]),
      )

      profile.save(validate: false)
      profile
    end

    # Created audit record when org is provisioned.
    def audit_created_org(user, org)
      Auditor.perform_audit(
        action: "create",
        record_type: "Provision Org",
        record: {
          message: "A new admin and organization have been created: user=#{user.as_json}, " \
                   "org=#{org.as_json} by '#{@admin.dxuser}'",
        },
      )
    end
  end
  # rubocop:enable Metrics/ClassLength
end
