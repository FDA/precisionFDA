module Licenses
  extend ActiveSupport::Concern

  # module ClassMethods
  #   def licensed_by(context)
  #     if context.guest?
  #       none
  #     else
  #       raise unless context.user_id.present?
  #       where(user_id: context.user_id)
  #     end
  #   end
  # end

  def licensed_by?(context)
    if context.guest?
      false
    else
      accepted_licenses.exists?(user_id: context.user_id, state: [nil, 'active'])
    end
  end

  def licensed_by_set?(context)
    if context.guest?
      false
    else
      accepted_licenses.exists?(user_id: context.user_id)
    end
  end

  def licensed_by_pending?(context)
    if context.guest?
      false
    else
      accepted_licenses.exists?(user_id: context.user_id, state: 'pending')
    end
  end

  def user_license(context)
    return {
      unset: !licensed_by_set?(context),
      active: licensed_by?(context),
      pending: licensed_by_pending?(context)
    }
  end

end
