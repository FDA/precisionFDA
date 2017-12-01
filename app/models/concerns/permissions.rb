module Permissions
  extend ActiveSupport::Concern

  module ClassMethods
    def accessible_by(context)
      if context.guest?
        accessible_by_public
      else
        raise unless context.user_id.present? && context.user.present?

        queries = [].tap do |queries|
          queries.push({ user_id: context.user_id })
          queries.push({ scope: "public" })
          queries.push({ scope: context.user.space_uids })
          queries.push({ user_id: User.challenge_bot.id }) if context.challenge_evaluator?
        end

        where.any_of(*queries)
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

    def accessible_by_space(space)
      where(scope: space.uid)
    end

    def map_context_slice(context, *args)
      self.map { |o| o.context_slice(context, *args) }
    end
  end

  def accessible_by?(context)
    if context.guest?
      public?
    else
      return true if public?
      return true if user_id == context.user_id
      return true if context.user.space_uids.include?(scope)

      context.challenge_evaluator? && user.dxuser == CHALLENGE_BOT_DX_USER
    end
  end

  def editable_by?(context)
    if context.guest?
      false
    else
      user_id == context.user_id
    end
  end

  # Helper method, not to be called from outside the model
  def core_publishable_by?(context, scope_to_publish_to)
    if context.guest?
      false
    else
      # Publishable if owned by user, and not already public,
      # and not in another space (if publishing to space)
      user_id == context.user_id && !public? && (scope_to_publish_to == "public" || private?)
    end
  end

  def core_publishable_by_user?(user, scope_to_publish_to)
    return false unless user
    # Publishable if owned by user, and not already public,
    # and not in another space (if publishing to space)
    user_id == user.id && !public? && (scope_to_publish_to == "public" || private?)
  end

  def publishable_by?(context, scope_to_publish_to = "public")
    core_publishable_by?(context, scope_to_publish_to)
  end

  def publishable_by_user?(user, scope_to_publish_to = "public")
    core_publishable_by_user?(user, scope_to_publish_to)
  end

  def public?
    scope == "public"
  end

  def private?
    scope == "private" || scope.nil?
  end

  def in_space?
    !public? && !private?
  end

  def space_object
    raise unless in_space?
    Space.from_scope(scope)
  end

  def context_slice(context, *args)
    wrapper = {id: id, uid: uid, klass: klass, scope: scope, item: accessible_by?(context) ? self.slice(*args) : nil}
  end
end
