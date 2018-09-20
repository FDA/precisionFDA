module SpaceEventService
  def self.call(space_id, user_id, membership, entity, activity_type)
    if membership.nil?
      membership = Space.find(space_id).space_memberships.find_by!(user_id: user_id)
    end
    SpaceEvent.create(space_id: space_id, user_id: user_id, side: membership[:side], role: membership[:role], entity: entity, activity_type: activity_type)
  end
end
