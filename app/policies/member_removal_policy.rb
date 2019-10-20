# Responsible for check if user can be removed from org.
class MemberRemovalPolicy
  # Checks if user can be removed from org.
  # @param org [Org] Organization to remove user from.
  # @param member [User] User to remove from the organization.
  # @return [true, false] True if user can be removed from org, false otherwise.
  def self.satisfied?(org, member)
    org.admin != member && member.org == org
  end
end
