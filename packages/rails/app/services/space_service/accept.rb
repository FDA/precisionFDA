module SpaceService
  class Accept
    # @param [Space] space
    def self.project_creator_class(space)
      if space.review?
        ProjectBuilders::ReviewSpace
      elsif space.verification?
        ProjectBuilders::VerificationSpace
      else
        # for Group, Gov and Admin types of spaces
        ProjectBuilders::GroupSpace
      end
    end

    # @param admin [SpaceMembership]
    def self.call(api, space, admin)
      new(project_creator: project_creator_class(space).new(api)).call(space, admin)
    end

    def initialize(project_creator:)
      @project_creator = project_creator
    end

    # @param admin [SpaceMembership]
    def call(space, admin)
      Space.transaction do
        project_creator.create(space, admin)
        activate(space) if space.accepted?
        space.save!
      end
    end

    private

    attr_reader :project_creator

    def activate(space)
      space.active!
      space.confidential_spaces.each(&:active!)
      send_emails(space)
    end

    def send_emails(space)
      https_apps_client = HttpsAppsClient.new
      space.leads.find_each do |lead|
        https_apps_client.email_send(NotificationPreference.email_types[:space_activated], [], { id: lead.id }) # id is membership id
      end
    end
  end
end
