# Responsible for check if org can be dissolved
class OrgDissolvePolicy
  # Checks if user can dissolve an org.
  # @param org [Org] Organization to dissolve.
  # @param user [User] User that requests dissolve.
  # @return [true, false] True if org can be dissolved, false otherwise
  def self.satisfied?(org, user)
    org.admin == user
  end
end
