module SpaceMembershipService
  # Operation to remove a member from a space, and the associated permissions on the platform
  # THIS IS ONLY INTENTED FOR ADMIN SPACES currently. Other space types does not remove their members via memberships, only lowers permissions to DISABLED.
  module Delete
    # @param [DNAnexusAPI] admin_api - currently not used
    # @param [DNAnexusAPI] user_api
    # @param [Space] space
    # @param [SpaceMembership] membership
    # @param [SpaceMembership] admin_membership
    def self.call(admin_api, user_api, space, membership, admin_membership)
      return false unless space
      return false unless membership
      raise "This method is only intented for Admin Spaces at this moment!" unless space.administrator?

      # Should not delete last member of a Space
      raise "Cannot delete last member of space #{space.id}." if space.space_memberships.count == 1

      # Remove user's org and project membership from dx platform
      project_dxid = space.host_project
      user_api.org_remove_member(space.host_dxorg, membership.user.dxid)

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
