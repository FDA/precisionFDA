module SpaceEventService
  class ContentNotifications

    class << self

      def send(event)
        receivers(event).each do |receiver|
          ReviewSpaceMailer.new_content_email(event.entity, receiver).deliver_now!
        end
      end

      private

      def receivers(event)
        User.joins(:space_memberships).merge(event.entity.space_object.space_memberships.active).select do |user|
          next if user.id == event.user_id
          NotificationPreference.find_by_user(user).content_added_or_deleted
        end
      end

    end

  end
end
