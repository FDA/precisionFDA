module Permissions
  extend ActiveSupport::Concern

  module ClassMethods
    def accessible_by(context)
      return accessible_by_public if context.guest?
      return none unless context.logged_in?

      accessible_by_user(context.user)
    end

    def accessible_by_user(user)
      query = where(user: user, scope: Scopes::SCOPE_PRIVATE).
        or(where(scope: Scopes::SCOPE_PUBLIC)).
        or(where(scope: user.space_uids))

      query = query.or(where(user: User.challenge_bot)) if user.is_challenge_evaluator?

      query
    end

    def editable_by(context)
      return none unless context.logged_in?

      editable_scopes = Space.editable_by(context).
        pluck(Arel.sql("distinct concat('space-', spaces.id)"))

      where(
        user: context.user,
        scope: [Scopes::SCOPE_PUBLIC, Scopes::SCOPE_PRIVATE],
      ).or(where(scope: editable_scopes))
    end

    def editable_in_space(context, ids)
      if context.guest?
        none
      else
        return false if try(:space_object).try(:verified?)
        raise unless context.user_id.present?
        where(user_id: ids)
      end
    end

    def accessible_by_public
      where(scope: Scopes::SCOPE_PUBLIC)
    end

    def accessible_by_private
      where(scope: Scopes::SCOPE_PRIVATE)
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
    elsif context.logged_in?
      return true if public?
      return true if !in_space? && user_id == context.user_id
      return true if context.user.space_uids.include?(scope)

      context.challenge_evaluator? && user.dxuser == CHALLENGE_BOT_DX_USER
    else
      false
    end
  end

  def editable_by?(context)
    return false if context.guest? || in_locked_verification_space?

    return user_id == context.user_id unless in_space?

    space_object.editable_by?(context.user)
  end

  # Check if the object belongs to current user
  # @param context [Context] a user which is logged in
  # @return [true, false] Returns true if the object belongs to current user,
  #   false otherwise.
  def owned_by?(context)
    user_id == context.user_id
  end

  def core_publishable_by?(context)
    return false if context.guest? || user_id != context.user_id

    core_publishable_by_user?(context.user)
  end

  def core_publishable_by_user?(user)
    user.present? && user_id == user.id && (private? || in_space?)
  end

  def publishable_by?(context, _scope_to_publish_to)
    core_publishable_by?(context)
  end

  def copyable_to_cooperative_by?(context)
    return false unless in_space?
    return false unless accessible_by?(context)
    return false unless copyable_to_cooperative?
    return false unless space_object.active?
    return true if user_id == context.user_id

    return false unless context.review_space_admin?

    owner = space_object.space_memberships.find_by(user_id: user_id)
    owner.present? ? owner.host? : true
  end

  def copyable_to_cooperative?
    return false unless in_confidential_space?
    self.class.where(dxid: dxid, scope: space_object.shared_space.uid).empty?
  end

  def public?
    scope == Scopes::SCOPE_PUBLIC
  end

  def private?
    scope.nil? || scope == Scopes::SCOPE_PRIVATE
  end

  def in_locked_verification_space?
    in_space? && space_object.verified?
  end

  def in_verification_space?
    in_space? && space_object.verification?
  end

  def in_space?
    Space.valid_scope?(scope)
  end

  def in_confidential_space?
    in_space? && space_object.confidential?
  end

  def space_object
    Space.from_scope(scope)
  end

  def context_slice(context, *args)
    wrapper = {id: id, uid: uid, klass: klass, scope: scope, item: accessible_by?(context) ? self.slice(*args) : nil}
  end
end
