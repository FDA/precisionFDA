module Permissions
  extend ActiveSupport::Concern

  module ClassMethods
    def accessible_by(context)
      raise unless context.user_id.present? && context.org_id.present?
      where.any_of({user_id: context.user_id}, {scope: "public"}, {scope: context.org_id.to_s})
    end

    def editable_by(context)
      raise unless context.user_id.present?
      where(user_id: context.user_id)
    end
  end

  def accessible_by?(context)
    user_id == context.user_id || scope == "public" || scope == context.org_id.to_s
  end

  def editable_by?(context)
    user_id == context.user_id
  end

  def public?
    scope == "public"
  end

end
