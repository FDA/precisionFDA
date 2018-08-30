module SpacesHelper

  def member_side(space, member)
    if space.groups?
      member.host? ? "host" : "guest"
    elsif space.review?
      member.host? ? "reviewer" : "sponsor"
    end
  end

  def space_sides(space)
    if space.groups?
      SpaceMembership.sides.to_h
    elsif space.review?
      {
        reviewer: SpaceMembership.sides[SpaceMembership::SIDE_HOST],
        sponsor: SpaceMembership.sides[SpaceMembership::SIDE_GUEST],
      }
    end
  end

  def space_initial_roles
    SpaceMembership.roles.slice(:admin, :member).keys
  end

  def space_header(space)

  end

  def space_type(space)
    return 'Group' if space.groups?

    space.confidential? ? 'Confidential' : 'Cooperative'
  end

end
