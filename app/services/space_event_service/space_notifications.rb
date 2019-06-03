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
        User.joins(:space_memberships).merge(event.space.space_memberships.active.lead).select do |user|
          next if user.id == event.user_id
          notification_preference_by_role(event, user)
        end
      end

      def notification_preference_by_role(event, user)
        notification_preference = NotificationPreference.find_by_user(user)
        role = event.space.space_memberships.find_by_user_id(user.id).role
        if lead_or_admin?(role)
          admin_preference = rsa?(role, user) ? "admin_space_locked_unlocked_deleted" : nil
          preference = "#{role}_space_locked_unlocked_deleted"

          if admin_preference
            notification_preference.send(preference) || notification_preference.send(admin_preference)
          else
            notification_preference.send(preference)
          end
        else
          false
        end
      end

      def lead_or_admin?(role)
        ["admin", "lead"].include?(role)
      end

      def rsa?(role, user)
        role != "admin" && user.review_space_admin?
      end

    end

  end
end
