module Licenses
  extend ActiveSupport::Concern

  def licensed_by?(context)
    accepted_licenses.exists?(user_id: context.user_id, state: [nil, "active"])
  end

  # Check license status, whether it is 'active' or 'pending'
  # @param user [User object]
  # @param status [String]
  # @return true or false - depends upon match status given
  def license_status?(user, status)
    accepted_licenses.exists?(user_id: user.id, state: [nil, status])
  end

  def licensed_by_set?(context)
    accepted_licenses.exists?(user_id: context.user_id)
  end

  def licensed_by_pending?(context)
    accepted_licenses.exists?(user_id: context.user_id, state: "pending")
  end

  def user_license(context)
    return {
      unset: !licensed_by_set?(context),
      active: licensed_by?(context),
      pending: licensed_by_pending?(context)
    }
  end

end
