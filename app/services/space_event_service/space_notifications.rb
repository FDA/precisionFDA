module SpaceEventService
  class SpaceNotifications

    class << self

      def send(event)
        receivers(event).each do |receiver|
          ReviewSpaceMailer.space_transition_email(event.entity, event.user, receiver, action(event)).deliver_now!
        end
      end

      private

      def action(event)
        event.activity_type.to_s.gsub('space_', '')
      end

      def receivers(event)
        # TODO should be admins and lead reviewer
        User.joins(:space_memberships).merge(event.space.space_memberships.active.lead).select do |user|
          next if user.id == event.user_id
          NotificationPreference.find_by_user(user).space_lock_unlock_delete
        end
      end

    end

  end
end
