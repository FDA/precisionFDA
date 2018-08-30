class SpaceMembershipPolicy

  class << self

    def can_disable?(space, admin, member)
      suitable_admin_and_member?(space, admin, member)
    end

    def can_lead?(space, admin, member)
      suitable_admin_and_member?(space, admin, member)
    end

    def can_admin?(space, admin, member)
      return false unless suitable_admin_and_member?(space, admin, member)
      return false if member.admin?
      true
    end

    def can_member?(space, admin, member)
      return false unless suitable_admin_and_member?(space, admin, member)
      return false if member.member?
      true
    end

    def can_viewer?(space, admin, member)
      return false unless suitable_admin_and_member?(space, admin, member)
      return false if member.viewer?
      true
    end

    def can_request_lock?(space, admin)
      return unless space.shared?
      return unless admin.host?
      return unless space.active?
      space.requests.lock_up.pending.empty?
    end

    def can_request_unlock?(space, admin)
      return unless space.shared?
      return unless admin.host?
      return unless space.locked?
      space.requests.unlock.pending.empty?
    end

    private

    attr_reader :admin

    def suitable_admin_and_member?(space, admin, member)
      return false unless admin.lead_or_admin?
      return false if member.inactive?
      return false if member.lead?
      admin.side == member.side
    end

  end
end
