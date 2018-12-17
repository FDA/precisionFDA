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
        candidates = event.entity.mentioned_users
        candidates << event.entity.parent.user if event.entity.parent.present?

        candidates.uniq.select do |user|
          next if user.id == event.user_id
          NotificationPreference.find_by_user(user).comment_activity
        end
      end

    end

  end
end
