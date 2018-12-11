module SpaceService
  class Accept
    # @param [Space] space
    def self.project_creator_class(space)
      if space.review?
        ReviewSpaceProjectCreator
      else
        GroupSpaceProjectCreator
      end
    end

    # @param admin [SpaceMembership]
    def self.call(api, space, admin, context)
      new(project_creator: project_creator_class(space).new(api, context)).call(space, admin)
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
      space.leads.find_each do |lead|
        NotificationsMailer.space_activated_email(space, lead).deliver_now!
      end
    end
  end
end
