module SpaceService
  class Create
    # @param space_form [SpaceForm] Space form.
    # @param options [Hash] Options.
    def self.call(space_form, options = {})
      new(**options).call(space_form)
    end

    def initialize(user:, api:, for_challenge: false, notification_mailer: NotificationsMailer)
      @api = api
      @admin_api = DIContainer.resolve("api.admin")
      @notification_mailer = notification_mailer
      @user = user
      @for_challenge = for_challenge
    end

    # Creates a space based on space_form data and returns new space
    # @param space_form [SpaceForm] Space form object.
    # @return [Space] Created space.
    def call(space_form)
      space = nil
      site_admins = nil

      Space.transaction do
        space = build_space(space_form)
        dxorgs = [space.host_dxorg, space.guest_dxorg].uniq.compact

        create_orgs(dxorgs)
        space.save!
        add_leads(space, space_form)
        invite_challenge_bot(space) if @for_challenge

        create_shared_or_private_project(space, space_form)

        if space.review?
          create_reviewer_confidential_space(space, space_form)
        elsif space.groups? || space.government? || space.administrator?
          remove_pfda_admin_user(space, space_form)
        elsif space.private_type?
          # Private Spaces have space_id set to it's own id
          space.update(space_id: space.id)
        end

        # For private, government and administrator spaces we accept the space automatically
        accept_space(space) if space.private_type? || space.government? || space.administrator?

        site_admins = User.site_admins - [space.host_lead]
        create_site_admin_invitations_to_space(space, site_admins) if space.administrator?
      end

      send_emails(space) unless space.private_type?

      space
    end

    private

    attr_reader :user, :api, :notification_mailer, :admin_api

    # Invites all site administrators to the space
    def create_site_admin_invitations_to_space(space, site_admins)
      host_lead = space.host_lead # the admin who's created the current administrator space

      return if site_admins.empty?

      admin_membership = space.space_memberships.find_by(user: host_lead)

      site_admins.each do |site_admin|
        # rubocop:disable Layout/LineLength
        Rails.logger.info("Adding site admin #{user.dxuser} to space #{space.id}" \
                          " with admin membership #{admin_membership.id}")
        new_membership = SpaceMembershipService::CreateOrUpdate.call(api, space, site_admin, SpaceMembership::ROLE_ADMIN, admin_membership, false)
        NotificationsMailer.space_activated_email(space, new_membership).deliver_later!
        # rubocop:enable Layout/LineLength
      end
    end

    # Sends invitation emails to administrator space
    # Logic inspired from SpaceMembershipService::CreateOrUpdate
    # Known Bug: could probably send an email if space_membership record was already existing
    # However this should be unexpected edge case AFAIK (samuel)
    def send_invitation_emails_to_site_admins(space, site_admins)
      host_lead = space.host_lead # the admin who's created the current administrator space

      return if site_admins.empty?

      admin_membership = space.space_memberships.find_by(user: host_lead)

      fork do
        site_admins.each do |site_admin|
          membership = space.space_memberships.active.where(user_id: site_admin.id).first
          SpaceEventService.call(space.id, admin_membership.user_id, admin_membership, membership, :membership_added)
        end
      end
    end

    # Accept space without user action
    def accept_space(space)
      space.active! if space.accepted? # always true for private_type spaces
      space.save!
    end

    def invite_challenge_bot(space)
      membership = space.space_memberships.find_by(user_id: space.host_lead.id)

      SpaceService::Invite.call(
        admin_api,
        space,
        membership,
        User.challenge_bot,
        SpaceMembership::ROLE_ADMIN,
      )
    end

    # Construct guest dxorg upon its existance - used for Non review and Non groups
    #   and Non gov., admin groups types,
    #   which have space_form.guest_lead_dxuser == '' and space_form.sponsor_lead_dxuser == ''
    #   - for Private type spaces we do not create dxorg here
    def construct_guest_dxorg(guest_lead_dxuser, sponsor_lead_dxuser, uuid)
      return if guest_lead_dxuser && guest_lead_dxuser.empty? && sponsor_lead_dxuser && sponsor_lead_dxuser.empty?

      Org.construct_dxorg("space_guest_#{uuid}")
    end

    def build_space(space_form)
      uuid = SecureRandom.hex[0..9]

      Space.new(
        name: space_form.name,
        description: space_form.description,
        host_dxorg: Org.construct_dxorg("space_host_#{uuid}"),
        guest_dxorg: construct_guest_dxorg(
          space_form.guest_lead_dxuser, space_form.sponsor_lead_dxuser, uuid
        ),
        sponsor_org_id: space_form.space_sponsor&.org_id,
        space_type: space_form.space_type,
        cts: space_form.cts, # only for review spaces
        restricted_discussions: space_form.restricted_discussions, # only for review spaces
        restricted_reviewer: space_form.restricted_reviewer, # only for review spaces
        restrict_to_template: space_form.restrict_to_template,
        protected: space_form.protected,
      )
    end

    # Provision Host and Guest orgs
    def create_orgs(orgs_dxs)
      orgs_dxs.each { |dxorg| OrgService::Create.call(dxorg) }
    end

    # Add host and guest leads as ADMINs
    # @param [Space]
    # @param [SpaceForm]
    def add_leads(space, space_form)
      add_lead(
        space,
        space_form.host_admin,
        SpaceMembership::SIDE_HOST,
      )

      # do not add guest/sponsor side admin for private_type, gov and admin spaces
      return if space.private_type? || space.government? || space.administrator?

      add_lead(
        space,
        space.review? ? space_form.space_sponsor : space_form.guest_admin,
        SpaceMembership::SIDE_GUEST,
      )
    end

    def add_lead(space, lead, side)
      SpaceMembershipService::CreateLead.call(
        admin_api,
        space,
        lead,
        side,
        user,
      )
    end

    # Remove pfda admin from orgs (only for group spaces).
    # Skip removing if:
    #   - admin is a current user
    #   - admin is a host lead - skip removing from a host org
    #   - admin is a guest lead - skip removing from a guest org
    def remove_pfda_admin_user(space, space_form)
      return if user.dxid == ADMIN_USER

      admin_api.org_remove_member(space.host_dxorg, ADMIN_USER) unless space_form.host_admin.dxid == ADMIN_USER

      return if space_form.guest_admin.nil? || space_form.guest_admin&.dxid == ADMIN_USER

      admin_api.org_remove_member(space.guest_dxorg, ADMIN_USER)
    end

    # Send an activation email to all space leads
    # @param [Space]
    def send_emails(space)
      space.leads.find_each do |lead|
        notification_mailer.space_activation_email(space, lead).deliver_later!
      end
    end

    # Create a project of a cooperative (shared) review or private_type space.
    # @param [Space]
    #  rubocop:disable Metrics/MethodLength
    def create_shared_or_private_project(space, space_form)
      if ADMIN_USER != user.dxid
        admin_api.org_invite(
          space.host_dxorg,
          user.dxid,
          level: DNAnexusAPI::ORG_MEMBERSHIP_ADMIN,
          suppressEmailNotification: true,
        )
      end

      project_dxid = api.project_new(
        "precisionfda-space-#{space.id}-HOST",
        billTo: user.billto,
      )["id"]

      if space.review?
        # invite host admin to take the billing
        # host admin will be the ADMIN after accepting the transfer
        api.project_transfer(
          project_dxid,
          space_form.host_admin.dxid,
          suppressEmailNotification: true,
        )
      end

      invite_orgs_to_project(space, project_dxid)

      space.host_project = project_dxid
      space.save!
    end
    #  rubocop:enable Metrics/MethodLength

    # Create a project of a confidential review space.
    # @param [Space]
    # @param [SpaceForm]
    def create_reviewer_confidential_space(shared_space, space_form)
      space = shared_space.confidential_spaces.create!(
        name: shared_space.name,
        description: shared_space.description,
        space_type: shared_space.space_type,
        cts: shared_space.cts,
        state: shared_space.state,
        host_dxorg: shared_space.host_dxorg,
        restrict_to_template: space_form.restrict_to_template,
        protected: space_form.protected,
        restricted_reviewer: space_form.restricted_reviewer,
        restricted_discussions: false, # allow discussions in review space private area
      )

      project_dxid = api.project_new(
        "precisionfda-space-#{space.id}-REVIEWER-PRIVATE",
        billTo: user.billto,
      )["id"]

      space.host_project = project_dxid
      space.save!

      api.project_invite(
        project_dxid,
        space.host_dxorg,
        DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )

      api.project_transfer(
        project_dxid,
        space_form.host_admin.dxid,
        suppressEmailNotification: true,
      )

      duplicate_space(space, space_form.source_space_id)
    end

    # Duplicates source space's data: apps, workflows and files.
    # @param space [Space] Reviewer private space.
    # @param source_space_id [Integer] Duplicated space ID.
    def duplicate_space(space, source_space_id)
      return if source_space_id.nil?

      source_space = Space.find(source_space_id)

      space_copier = CopyService::SpaceCopier.new(api: api, user: user)
      space_copier.copy(space, source_space)
    end

    def invite_orgs_to_project(space, project_dxid)
      api.project_invite(
        project_dxid,
        space.host_dxorg,
        DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )
      return unless space.shared? || space.groups?

      api.project_invite(
        project_dxid,
        space.guest_dxorg,
        DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )
    end

    def guest_dx_org(uuid, _space, _space_form)
      Org.construct_dxorg("space_guest_#{uuid}")
    end
  end
end
