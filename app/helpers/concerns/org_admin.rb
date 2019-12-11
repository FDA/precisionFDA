module Concerns
  # Provides concern for non-singular organization admin detection.
  module OrgAdmin
    extend ActiveSupport::Concern

    # Checks if user is admin of real organization.
    # @return [true, false] True if user is an admin of real org, false otherwise.
    def non_singular_org_admin?(user)
      return false unless user

      org = user.org

      org.real_org? && org.admin == user
    end
  end
end
