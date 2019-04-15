module SpaceEventService
  class CommentNotifications

    class << self

      def send(event)
        receivers(event).each do |receiver|
          ReviewSpaceMailer.new_comment_email(event.entity, receiver).deliver_now!
        end
      end

      private

      def receivers(event)
        candidates = []
        mentioned = event.entity.mentioned_users
        mentioned.map { |u| candidates << u }
        candidates << event.entity.parent.user if event.entity.parent.present?

        candidates.uniq.select do |user|
          next if user.id == event.user_id
          notification_preference_by_role(event, user)
        end
      end

      def notification_preference_by_role(event, user)
        notification_preference = NotificationPreference.find_by_user(user)
        role = event.space.space_memberships.find_by_user_id(user.id).role
        role = "all" unless ["admin", "lead"].include?(role)
        preference = "#{role}_comment_activity"
        admin_preference = rsa?(role, user) ? "admin_comment_activity" : nil
        if admin_preference
          notification_preference.send(preference) || notification_preference.send(admin_preference)
        else
          notification_preference.send(preference)
        end
      end

      def rsa?(role, user)
        role != "admin" && user.review_space_admin?
      end

    end

  end
end
