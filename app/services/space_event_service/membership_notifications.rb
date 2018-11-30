module SpaceEventService
  class MembershipNotifications

    class << self

      def send(event)
        receivers(event).each do |receiver|
          ReviewSpaceMailer.member_added_email(event.entity, receiver, ).deliver_now!
        end
      end

      private

      def action(event)
        {
          "membership_added" => "Added a new member",
          "membership_removed" => "disabled",
          "membership_changed" => "role changed",
        }[event.activity_type]
      end

      def receivers(event)
        User.joins(:space_memberships).merge(event.entity.space_object.space_memberships.active).select do |user|
          next if user.id == event.user_id
          NotificationPreference.find_by_user(user).membership_changed
        end
      end

    end

  end
end
