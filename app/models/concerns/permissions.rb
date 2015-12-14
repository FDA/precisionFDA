module Permissions
  extend ActiveSupport::Concern

  module ClassMethods
    def accessible_by(context)
      if context.guest?
        accessible_by_public
      else
        raise unless context.user_id.present? && context.org_id.present?
        where.any_of({user_id: context.user_id}, {scope: "public"}, {scope: context.org_id.to_s})
      end
    end

    def editable_by(context)
      if context.guest?
        none
      else
        raise unless context.user_id.present?
        where(user_id: context.user_id)
      end
    end

    def accessible_by_public
      where(scope: "public")
    end
  end

  def accessible_by?(context)
    if context.guest?
      scope == "public"
    else
      user_id == context.user_id || scope == "public" || scope == context.org_id.to_s
    end
  end

  def editable_by?(context)
    if context.guest?
      false
    else
      user_id == context.user_id
    end
  end

  def publishable_by?(context)
    if context.guest?
      false
    else
      user_id == context.user_id && scope != "public"
    end
  end

  def public?
    scope == "public"
  end

  def context_slice(context, *args)
    wrapper = {uid: uid, klass: klass, item: accessible_by?(context) ? self.slice(*args) : nil}
  end

end
