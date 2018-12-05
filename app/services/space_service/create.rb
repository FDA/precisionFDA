module SpaceService
  class Create
    # @param [SpaceForm] space_form
    def self.call(space_form, options = {})
      new(options).call(space_form)
    end

    def initialize(api:, papi: DNAnexusAPI.for_admin,
                   notification_mailer: NotificationsMailer)
      @api = api
      @papi = papi
      @notification_mailer = notification_mailer
    end

    # @param [SpaceForm, #name, #description, #space_type, #cts, #host_lead_dxuser, #guest_lead_dxuser, #sponsor_org] space_form
    def call(space_form)
      Space.transaction do
        space = build_space(space_form)
        create_orgs(space)
        space.save!
        add_leads(space, space_form)
        remove_pfda_admin_user(space) unless space.review?
        send_emails(space)
        space
      end
    end

    private

    attr_reader :papi, :api, :notification_mailer

    def build_space(space_form)
      uuid = SecureRandom.hex

      space = Space.new(
        name: space_form.name,
        description: space_form.description,
        host_dxorg: Org.construct_dxorg("space_host_#{uuid}"),
        guest_dxorg: Org.construct_dxorg("space_guest_#{uuid}"),
        space_type: space_form.space_type,
        cts: space_form.cts,
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
  end
end
