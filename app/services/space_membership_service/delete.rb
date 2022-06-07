module SpaceMembershipService
  # Operation to remove a member from a space, and the associated permissions on the platform
  module Delete
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] membership
    # @param [SpaceMembership] admin_membership
    def self.call(admin_api, user_api, space, membership, admin_membership)
      return false unless space
      return false unless membership

      # Should not delete last member of a Space
      raise "Cannot delete last member of space #{space.id}." if space.space_memberships.count == 1

      # Remove user's org and project membership from dx platform
      project_dxid = space.host_project
      admin_api.org_remove_member(space.host_dxorg, membership.user.dxid)
      user_api.project_leave(project_dxid)

      space.space_memberships.delete(membership)
      membership.destroy!

      create_event(space, membership, admin_membership)
      space.save!
      space
    end

    def self.create_event(space, membership, admin_membership)
      SpaceEventService.call(space.id, admin_membership.user_id, admin_membership, membership, :membership_deleted)
    end
  end
end
