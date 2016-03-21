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
      accepted_licenses.exists?(user_id: context.user_id)
    end
  end

end
