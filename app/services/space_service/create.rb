module SpaceService
  class Create
    # @param [SpaceForm] space_form
    def self.call(space_form, options = {})
      new(options).call(space_form)
    end

    def initialize(user:, api:, papi: DNAnexusAPI.for_admin,
                   notification_mailer: NotificationsMailer)
      @api = api
      @papi = papi
      @notification_mailer = notification_mailer
      @user = user
    end

    # @param [SpaceForm, #name, #description, #space_type, #cts, #host_lead_dxuser, #guest_lead_dxuser, #sponsor_org] space_form
    def call(space_form)
      Space.transaction do
        space = build_space(space_form)
        create_orgs(space)
        space.save!
        add_leads(space, space_form)
        remove_pfda_admin_user(space) unless space.review?
        create_reviewer_cooperative_project(space) if space.review?
        create_reviewer_confidential_space(space, space_form) if space.review?
        send_emails(space)
        space
      end
    end

    private

    attr_reader :user, :papi, :api, :notification_mailer

    def build_space(space_form)
      uuid = SecureRandom.hex

      space = Space.new(
        name: space_form.name,
        description: space_form.description,
        host_dxorg: Org.construct_dxorg("space_host_#{uuid}"),
        guest_dxorg: Org.construct_dxorg("space_guest_#{uuid}"),
        space_type: space_form.space_type,
        cts: space_form.cts,
        space_template_id: space_form.space_template_id,
        restrict_to_template: space_form.restrict_to_template
      )
      space.sponsor_org_id = space_form.sponsor_org.id if space.review?
      space
    end

    # Provision Host and Guest orgs
    def create_orgs(space)
      OrgService::Create.call(api, space.host_dxorg)
      OrgService::Create.call(api, space.guest_dxorg)
    end

    # Add leads as ADMINs
    def add_leads(space, space_form)
      add_lead(
        space,
        User.find_by!(dxuser: space_form.host_lead_dxuser),
        SpaceMembership::SIDE_HOST
      )

      add_lead(
        space,
        space.review? ? space.sponsor_org.admin : User.find_by!(dxuser: space_form.guest_lead_dxuser),
        SpaceMembership::SIDE_GUEST
      )
    end

    def add_lead(space, user, side)
      SpaceMembershipService::CreateLead.call(
        papi,
        space,
        user,
        side
      )
    end

    # Remove pfda admin from orgs
    def remove_pfda_admin_user(space)
      papi.call(space.host_dxorg, "removeMember", user: ADMIN_USER)
      papi.call(space.guest_dxorg, "removeMember", user: ADMIN_USER)
    end

    def send_emails(space)
      space.leads.find_each do |lead|
        notification_mailer.space_activation_email(space, lead).deliver_now!
      end
    end

    def create_reviewer_cooperative_project(space)
      papi.call(space.host_dxorg, "invite", {
        invitee: user.dxid,
        level: "ADMIN",
        suppressEmailNotification: true
      })

      project_dxid = api.call(
        "project", "new",
        name: "precisionfda-space-#{space.id}-HOST",
        billTo: user.billto,
      )["id"]

      api.call(
        project_dxid, "invite",
        invitee: space.host_dxorg,
        level: "CONTRIBUTE",
        suppressEmailNotification: true,
        suppressAllNotifications: true
      )

      api.call(
        project_dxid, "invite",
        invitee: space.guest_dxorg,
        level: "CONTRIBUTE",
        suppressEmailNotification: true,
        suppressAllNotifications: true
      )

      api.call(
        project_dxid, "invite",
        invitee: Setting.review_app_developers_org,
        level: "CONTRIBUTE",
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )

      space.host_project = project_dxid
      space.save!
    end

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

      project_dxid = api.call(
        "project", "new",
        name: "precisionfda-space-#{space.id}-REVIEWER-PRIVATE",
        billTo: user.billto,
      )["id"]

      space.host_project = project_dxid
      space.save!

      api.call(
        project_dxid, "invite",
        invitee: space.host_dxorg,
        level: "CONTRIBUTE",
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )

      api.call(
        project_dxid, "invite",
        invitee: Setting.review_app_developers_org,
        level: "CONTRIBUTE",
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      )

      apply_space_template(space)
    end

    def apply_space_template(space)
      parent_space = space.space
      template = parent_space.space_template

      if template.present?
        template.space_template_nodes.each do |n|
          case n.node
          when UserFile
            copy_service.copy(n.node, space.uid)
          when App
            copy_service.copy(n.node, space.uid)
          else
            raise("Space template #{template.id} has Unexpected node #{n.id} of #{n.node.class.to_s} class")
          end
        end
      end
    end

    def papi
      @papi ||= DNAnexusAPI.for_admin
    end

    def copy_service
      @copy_service ||= CopyService.new(api: api, user: user)
    end

  end
end
