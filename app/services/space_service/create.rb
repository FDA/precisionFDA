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
      Space.transaction do
        space = build_space(space_form)
        dxorgs = [space.host_dxorg, space.guest_dxorg].uniq.compact
        create_orgs(dxorgs)
        space.save!
        add_leads(space, space_form)
        invite_challenge_bot(space) if @for_challenge

        if space.review?
          create_reviewer_cooperative_project(space)
          create_reviewer_confidential_space(space, space_form)
        else
          remove_pfda_admin_user(space, space_form)
        end

        send_emails(space)
        space
      end
    end

    private

    attr_reader :user, :api, :notification_mailer, :admin_api

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

    def build_space(space_form)
      uuid = SecureRandom.hex[0..9]

      Space.new(
        name: space_form.name,
        description: space_form.description,
        host_dxorg: Org.construct_dxorg("space_host_#{uuid}"),
        guest_dxorg: Org.construct_dxorg("space_guest_#{uuid}"),
        sponsor_org_id: space_form.space_sponsor&.org_id,
        space_type: space_form.space_type,
        cts: space_form.cts,
        restrict_to_template: space_form.restrict_to_template,
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
      )
    end

    # Remove pfda admin from orgs (only for group spaces).
    # Skip removing if:
    #   - admin is a current user
    #   - admin is a host lead - skip removing from a host org
    #   - admin is a guest lead - skip removing from a guest org
    def remove_pfda_admin_user(space, space_form)
      return if user.dxid == ADMIN_USER

      unless space_form.host_admin.dxid == ADMIN_USER
        admin_api.org_remove_member(space.host_dxorg, ADMIN_USER)
      end

      return if space_form.guest_admin.dxid == ADMIN_USER

      admin_api.org_remove_member(space.guest_dxorg, ADMIN_USER)
    end

    # Send an activation email to all space leads
    # @param [Space]
    def send_emails(space)
      space.leads.find_each do |lead|
        notification_mailer.space_activation_email(space, lead).deliver_now!
      end
    end

    # Create a project of a cooperative review space.
    # @param [Space]
    def create_reviewer_cooperative_project(space)
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

      api.project_invite(
        project_dxid,
        space.host_dxorg,
        DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )

      api.project_invite(
        project_dxid,
        space.guest_dxorg,
        DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )

      api.project_invite(
        project_dxid,
        Setting.review_app_developers_org,
        DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )

      space.host_project = project_dxid
      space.save!
    end

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

      api.project_invite(
        project_dxid,
        Setting.review_app_developers_org,
        DNAnexusAPI::PROJECT_ACCESS_CONTRIBUTE,
        suppressEmailNotification: true,
        suppressAllNotifications: true,
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

    def guest_dx_org(uuid, space, space_form)
      Org.construct_dxorg("space_guest_#{uuid}")
    end
  end
end
