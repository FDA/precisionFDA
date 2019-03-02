module SpaceEventService
  def self.call(space_id, user_id, membership, entity, activity_type)
    if membership.nil?
      membership = Space.find(space_id).space_memberships.find_by(user_id: user_id)
      membership = SpaceMembership.new_by_admin(User.find(user_id)) unless membership
    end
    if activity_type == "copy_to_cooperative"
      activity_type =
        case entity.klass
        when "app" then :app_added
        when "comparison" then :comparison_added
        when "file" then :file_added
        when "asset" then :asset_added
        when "job" then :job_added
        when "note" then :note_added
        when "workflow" then :workflow_added
        end
    end
    space_event = SpaceEvent.create(space_id: space_id, user_id: user_id, side: membership[:side], role: membership[:role], entity: entity, activity_type: activity_type)
    NotificationSender.call(space_event)
  end
end
