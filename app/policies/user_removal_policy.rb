# Responsible for check if user can be removed from org.
class UserRemovalPolicy
  # Checks if user can be removed from org.
  # @param org [Org] Organization to remove user from.
  # @param user [User] User to remove from the organization.
  # @return [true, false] True if user can be removed from org, false otherwise.
  def self.satisfied?(org, user)
    user.org == org
  end
end
